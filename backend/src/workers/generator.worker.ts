import { Worker } from 'bullmq';
import { checkRedisStatus, initRedis } from '../config/redis';
import { Assignment } from '../models/assessment.model';
import { generateAssignmentAI } from '../services/openai.service';
import { addPDFJob } from '../queues/pdf.queue';
import { 
  broadcastGenerationStarted,
  broadcastGenerationProgress,
  broadcastGenerationFailed,
  broadcastGenerationCompleted
} from '../sockets/socket.handler';

const QUEUE_NAME = 'assessment-generation';

// Unified generation executor coordinates queue progress steps and websocket events
export const executeGeneration = async (assignmentId: string): Promise<void> => {
  try {
    console.log(`🔨 [AI Worker] Starting AI questions synthesis for ID: ${assignmentId}`);
    
    // WebSocket Event 1: started (10%)
    broadcastGenerationStarted(assignmentId);

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    assignment.status = 'generating';
    await assignment.save();

    // WebSocket Event 2: progress (40%)
    await new Promise((resolve) => setTimeout(resolve, 800));
    broadcastGenerationProgress(
      assignmentId, 
      40, 
      `Contacting VedaAI generator engine for subject: ${assignment.subject}...`
    );

    // Call OpenAI / Mock Section Generators
    const sections = await generateAssignmentAI({
      title: assignment.title,
      subject: assignment.subject,
      difficulty: assignment.difficulty,
      numberOfQuestions: assignment.numberOfQuestions || 5,
      additionalInstructions: assignment.additionalInstructions || ''
    });

    // Save sections and update status to completed
    assignment.sections = sections;
    assignment.status = 'completed';
    await assignment.save();

    // WebSocket Event 2: progress (70%)
    await new Promise((resolve) => setTimeout(resolve, 800));
    broadcastGenerationProgress(
      assignmentId,
      70,
      'AI synthesis successful. Delegate exam to decoupled PDF compiler queues...'
    );

    // DECOUPLED STAGE: Enqueue compilation job inside secondary PDF compiler queue
    await addPDFJob(assignment._id.toString());

    console.log(`✅ [AI Worker] Successfully completed AI question synthesis. Delegated to PDF queue.`);
    // Broadcast generation completed with assignment data
    broadcastGenerationCompleted(assignmentId, assignment);

  } catch (error: any) {
    console.error(`❌ [AI Worker] Failed generating questions for ${assignmentId}:`, error);

    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
        error: error.message || 'AI generation failed'
      });
    } catch (dbErr) {
      console.error('Failed updating error status in database:', dbErr);
    }

    // WebSocket Event 4: failed
    broadcastGenerationFailed(assignmentId, error.message || 'AI generation failed');
  }
};

// In-Memory simulated asynchronous runner (used when Redis is offline)
export const runInMemoryWorker = async (assignmentId: string): Promise<void> => {
  await executeGeneration(assignmentId);
};

// BullMQ Worker setup
let bullWorker: Worker | null = null;

export const initWorker = (): void => {
  if (checkRedisStatus()) {
    const connection = initRedis();
    if (connection) {
      bullWorker = new Worker(
        QUEUE_NAME,
        async (job) => {
          const { assignmentId } = job.data;
          await executeGeneration(assignmentId);
        },
        {
          connection,
          concurrency: 2
        }
      );

      bullWorker.on('completed', (job) => {
        console.log(`✅ [BullMQ Worker] Job completed: ${job.id}`);
      });

      bullWorker.on('failed', (job, err) => {
        console.error(`❌ [BullMQ Worker] Job failed: ${job?.id}. Error: ${err.message}`);
      });

      console.log('✅ BullMQ Worker initialized successfully');
    }
  } else {
    console.log('⚠️ Redis offline. BullMQ Worker not registered (In-Memory runner active)');
  }
};

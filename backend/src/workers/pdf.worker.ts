import { Worker } from 'bullmq';
import { checkRedisStatus, initRedis } from '../config/redis';
import { Assignment } from '../models/assessment.model';
import { generateAssessmentPDF } from '../services/pdf.service';
import { 
  broadcastGenerationProgress,
  broadcastGenerationCompleted,
  broadcastGenerationFailed
} from '../sockets/socket.handler';

const QUEUE_NAME = 'pdf-generation';

// Unified PDF generation executor shared between BullMQ worker and in-memory simulated worker
export const executePDFGeneration = async (assignmentId: string): Promise<void> => {
  try {
    console.log(`🖨️ [PDF Worker] Starting PDF layout compilation for ID: ${assignmentId}`);

    // WebSocket Event 2: progress (80%)
    broadcastGenerationProgress(
      assignmentId,
      80,
      'AI questions successfully saved. Initiating pdf-lib document layout engines...'
    );

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    // Call professional pdf-lib compilation service
    const absolutePdfPath = await generateAssessmentPDF(assignment);
    const relativePdfPath = `/pdfs/assessment-${assignment._id}.pdf`;

    // Save final document compilation paths
    assignment.pdfPath = relativePdfPath;
    assignment.status = 'completed';
    await assignment.save();

    // WebSocket Event 2: progress (95%)
    await new Promise((resolve) => setTimeout(resolve, 300));
    broadcastGenerationProgress(
      assignmentId,
      95,
      'Pagination headers & page counters stamped successfully. Saving static files...'
    );

    // WebSocket Event 3: completed
    await new Promise((resolve) => setTimeout(resolve, 400));
    broadcastGenerationCompleted(assignmentId, assignment);

    console.log(`✅ [PDF Worker] Successfully compiled PDF document for ID: ${assignmentId}`);
  } catch (error: any) {
    console.error(`❌ [PDF Worker] Failed compiling PDF document for ${assignmentId}:`, error);

    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
        error: error.message || 'PDF compilation failed'
      });
    } catch (dbErr) {
      console.error('Failed updating error status in database:', dbErr);
    }

    // WebSocket Event 4: failed
    broadcastGenerationFailed(assignmentId, error.message || 'PDF compilation failed');
  }
};

// In-Memory simulated asynchronous runner (used when Redis is offline)
export const runInMemoryPDFWorker = async (assignmentId: string): Promise<void> => {
  await executePDFGeneration(assignmentId);
};

// BullMQ Worker setup
let pdfWorker: Worker | null = null;

export const initPDFWorker = (): void => {
  if (checkRedisStatus()) {
    const connection = initRedis();
    if (connection) {
      pdfWorker = new Worker(
        QUEUE_NAME,
        async (job) => {
          const { assignmentId } = job.data;
          await executePDFGeneration(assignmentId);
        },
        {
          connection,
          concurrency: 2
        }
      );

      pdfWorker.on('completed', (job) => {
        console.log(`✅ [BullMQ PDF Worker] Job completed: ${job.id}`);
      });

      pdfWorker.on('failed', (job, err) => {
        console.error(`❌ [BullMQ PDF Worker] Job failed: ${job?.id}. Error: ${err.message}`);
      });

      console.log('✅ BullMQ PDF Worker initialized successfully');
    }
  } else {
    console.log('⚠️ Redis offline. BullMQ PDF Worker not registered (In-Memory runner active)');
  }
};

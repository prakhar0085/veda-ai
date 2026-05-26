import { Queue } from 'bullmq';
import { checkRedisStatus, initRedis } from '../config/redis';
import { runInMemoryWorker } from '../workers/generator.worker';

const QUEUE_NAME = 'assessment-generation';

let assessmentQueue: Queue | null = null;

export const initQueue = (): void => {
  if (checkRedisStatus()) {
    const connection = initRedis();
    if (connection) {
      assessmentQueue = new Queue(QUEUE_NAME, {
        connection
      });
      console.log('✅ BullMQ Queue initialized successfully');
    }
  } else {
    console.log('⚠️ Redis offline. Queue using in-memory simulated background jobs.');
  }
};

export const addAssessmentJob = async (assessmentId: string): Promise<void> => {
  if (checkRedisStatus() && assessmentQueue) {
    await assessmentQueue.add(
      'generate-assessment',
      { assessmentId },
      {
        attempts: 2,
        backoff: 5000,
        removeOnComplete: true,
        removeOnFail: false
      }
    );
    console.log(`📡 Enqueued job in BullMQ: ${assessmentId}`);
  } else {
    // Redis is offline, fallback to in-memory asynchronous worker execution
    console.log(`💻 Enqueued job in-memory background worker: ${assessmentId}`);
    // Run worker task in background (asynchronously)
    setTimeout(async () => {
      try {
        await runInMemoryWorker(assessmentId);
      } catch (error) {
        console.error(`❌ In-memory worker error for assessment ${assessmentId}:`, error);
      }
    }, 500); // Small delay to simulate queue delay
  }
};

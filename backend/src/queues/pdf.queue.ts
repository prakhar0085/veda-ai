import { Queue } from 'bullmq';
import { checkRedisStatus, initRedis } from '../config/redis';
import { runInMemoryPDFWorker } from '../workers/pdf.worker';

const QUEUE_NAME = 'pdf-generation';

let pdfQueue: Queue | null = null;

export const initPDFQueue = (): void => {
  if (checkRedisStatus()) {
    const connection = initRedis();
    if (connection) {
      pdfQueue = new Queue(QUEUE_NAME, {
        connection
      });
      console.log('✅ BullMQ PDF Queue initialized successfully');
    }
  } else {
    console.log('⚠️ Redis offline. PDF Queue using in-memory simulated background compiling.');
  }
};

export const addPDFJob = async (assignmentId: string): Promise<void> => {
  if (checkRedisStatus() && pdfQueue) {
    await pdfQueue.add(
      'compile-pdf',
      { assignmentId },
      {
        attempts: 2,
        backoff: 5000,
        removeOnComplete: true,
        removeOnFail: false
      }
    );
    console.log(`📡 Enqueued PDF job in BullMQ: ${assignmentId}`);
  } else {
    // Redis offline fallback enqueuer
    console.log(`💻 Enqueued PDF compiling in-memory background worker: ${assignmentId}`);
    setTimeout(async () => {
      try {
        await runInMemoryPDFWorker(assignmentId);
      } catch (error) {
        console.error(`❌ In-memory PDF worker error for assignment ${assignmentId}:`, error);
      }
    }, 500); // Small queue delay simulation
  }
};

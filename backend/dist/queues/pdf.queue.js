"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPDFJob = exports.initPDFQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const pdf_worker_1 = require("../workers/pdf.worker");
const QUEUE_NAME = 'pdf-generation';
let pdfQueue = null;
const initPDFQueue = () => {
    if ((0, redis_1.checkRedisStatus)()) {
        const connection = (0, redis_1.initRedis)();
        if (connection) {
            pdfQueue = new bullmq_1.Queue(QUEUE_NAME, {
                connection
            });
            console.log('✅ BullMQ PDF Queue initialized successfully');
        }
    }
    else {
        console.log('⚠️ Redis offline. PDF Queue using in-memory simulated background compiling.');
    }
};
exports.initPDFQueue = initPDFQueue;
const addPDFJob = async (assignmentId) => {
    if ((0, redis_1.checkRedisStatus)() && pdfQueue) {
        await pdfQueue.add('compile-pdf', { assignmentId }, {
            attempts: 2,
            backoff: 5000,
            removeOnComplete: true,
            removeOnFail: false
        });
        console.log(`📡 Enqueued PDF job in BullMQ: ${assignmentId}`);
    }
    else {
        // Redis offline fallback enqueuer
        console.log(`💻 Enqueued PDF compiling in-memory background worker: ${assignmentId}`);
        setTimeout(async () => {
            try {
                await (0, pdf_worker_1.runInMemoryPDFWorker)(assignmentId);
            }
            catch (error) {
                console.error(`❌ In-memory PDF worker error for assignment ${assignmentId}:`, error);
            }
        }, 500); // Small queue delay simulation
    }
};
exports.addPDFJob = addPDFJob;
//# sourceMappingURL=pdf.queue.js.map
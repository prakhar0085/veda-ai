"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAssessmentJob = exports.initQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const generator_worker_1 = require("../workers/generator.worker");
const QUEUE_NAME = 'assessment-generation';
let assessmentQueue = null;
const initQueue = () => {
    if ((0, redis_1.checkRedisStatus)()) {
        const connection = (0, redis_1.initRedis)();
        if (connection) {
            assessmentQueue = new bullmq_1.Queue(QUEUE_NAME, {
                connection
            });
            console.log('✅ BullMQ Queue initialized successfully');
        }
    }
    else {
        console.log('⚠️ Redis offline. Queue using in-memory simulated background jobs.');
    }
};
exports.initQueue = initQueue;
const addAssessmentJob = async (assessmentId) => {
    if ((0, redis_1.checkRedisStatus)() && assessmentQueue) {
        await assessmentQueue.add('generate-assessment', { assessmentId }, {
            attempts: 2,
            backoff: 5000,
            removeOnComplete: true,
            removeOnFail: false
        });
        console.log(`📡 Enqueued job in BullMQ: ${assessmentId}`);
    }
    else {
        // Redis is offline, fallback to in-memory asynchronous worker execution
        console.log(`💻 Enqueued job in-memory background worker: ${assessmentId}`);
        // Run worker task in background (asynchronously)
        setTimeout(async () => {
            try {
                await (0, generator_worker_1.runInMemoryWorker)(assessmentId);
            }
            catch (error) {
                console.error(`❌ In-memory worker error for assessment ${assessmentId}:`, error);
            }
        }, 500); // Small delay to simulate queue delay
    }
};
exports.addAssessmentJob = addAssessmentJob;
//# sourceMappingURL=generator.queue.js.map
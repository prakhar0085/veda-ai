"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPDFWorker = exports.runInMemoryPDFWorker = exports.executePDFGeneration = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const assessment_model_1 = require("../models/assessment.model");
const pdf_service_1 = require("../services/pdf.service");
const socket_handler_1 = require("../sockets/socket.handler");
const QUEUE_NAME = 'pdf-generation';
// Unified PDF generation executor shared between BullMQ worker and in-memory simulated worker
const executePDFGeneration = async (assignmentId) => {
    try {
        console.log(`🖨️ [PDF Worker] Starting PDF layout compilation for ID: ${assignmentId}`);
        // WebSocket Event 2: progress (80%)
        (0, socket_handler_1.broadcastGenerationProgress)(assignmentId, 80, 'AI questions successfully saved. Initiating pdf-lib document layout engines...');
        const assignment = await assessment_model_1.Assignment.findById(assignmentId);
        if (!assignment) {
            throw new Error(`Assignment not found: ${assignmentId}`);
        }
        // Call professional pdf-lib compilation service
        const absolutePdfPath = await (0, pdf_service_1.generateAssessmentPDF)(assignment);
        const relativePdfPath = `/pdfs/assessment-${assignment._id}.pdf`;
        // Save final document compilation paths
        assignment.pdfPath = relativePdfPath;
        assignment.status = 'completed';
        await assignment.save();
        // WebSocket Event 2: progress (95%)
        await new Promise((resolve) => setTimeout(resolve, 300));
        (0, socket_handler_1.broadcastGenerationProgress)(assignmentId, 95, 'Pagination headers & page counters stamped successfully. Saving static files...');
        // WebSocket Event 3: completed
        await new Promise((resolve) => setTimeout(resolve, 400));
        (0, socket_handler_1.broadcastGenerationCompleted)(assignmentId, assignment);
        console.log(`✅ [PDF Worker] Successfully compiled PDF document for ID: ${assignmentId}`);
    }
    catch (error) {
        console.error(`❌ [PDF Worker] Failed compiling PDF document for ${assignmentId}:`, error);
        try {
            await assessment_model_1.Assignment.findByIdAndUpdate(assignmentId, {
                status: 'failed',
                error: error.message || 'PDF compilation failed'
            });
        }
        catch (dbErr) {
            console.error('Failed updating error status in database:', dbErr);
        }
        // WebSocket Event 4: failed
        (0, socket_handler_1.broadcastGenerationFailed)(assignmentId, error.message || 'PDF compilation failed');
    }
};
exports.executePDFGeneration = executePDFGeneration;
// In-Memory simulated asynchronous runner (used when Redis is offline)
const runInMemoryPDFWorker = async (assignmentId) => {
    await (0, exports.executePDFGeneration)(assignmentId);
};
exports.runInMemoryPDFWorker = runInMemoryPDFWorker;
// BullMQ Worker setup
let pdfWorker = null;
const initPDFWorker = () => {
    if ((0, redis_1.checkRedisStatus)()) {
        const connection = (0, redis_1.initRedis)();
        if (connection) {
            pdfWorker = new bullmq_1.Worker(QUEUE_NAME, async (job) => {
                const { assignmentId } = job.data;
                await (0, exports.executePDFGeneration)(assignmentId);
            }, {
                connection,
                concurrency: 2
            });
            pdfWorker.on('completed', (job) => {
                console.log(`✅ [BullMQ PDF Worker] Job completed: ${job.id}`);
            });
            pdfWorker.on('failed', (job, err) => {
                console.error(`❌ [BullMQ PDF Worker] Job failed: ${job?.id}. Error: ${err.message}`);
            });
            console.log('✅ BullMQ PDF Worker initialized successfully');
        }
    }
    else {
        console.log('⚠️ Redis offline. BullMQ PDF Worker not registered (In-Memory runner active)');
    }
};
exports.initPDFWorker = initPDFWorker;
//# sourceMappingURL=pdf.worker.js.map
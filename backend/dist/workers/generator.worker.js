"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWorker = exports.runInMemoryWorker = exports.executeGeneration = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const assessment_model_1 = require("../models/assessment.model");
const openai_service_1 = require("../services/openai.service");
const pdf_service_1 = require("../services/pdf.service");
const socket_handler_1 = require("../sockets/socket.handler");
const QUEUE_NAME = 'assessment-generation';
// Unified generation executor coordinates queue progress steps and websocket events
const executeGeneration = async (assignmentId) => {
    try {
        console.log(`🔨 [Worker] Starting assignment generation for ID: ${assignmentId}`);
        // WebSocket Event 1: started
        (0, socket_handler_1.broadcastGenerationStarted)(assignmentId);
        const assignment = await assessment_model_1.Assignment.findById(assignmentId);
        if (!assignment) {
            throw new Error(`Assignment not found: ${assignmentId}`);
        }
        assignment.status = 'generating';
        await assignment.save();
        // WebSocket Event 2: progress (40%)
        await new Promise((resolve) => setTimeout(resolve, 800));
        (0, socket_handler_1.broadcastGenerationProgress)(assignmentId, 40, `Contacting VedaAI generator engine for subject: ${assignment.subject}...`);
        // Call OpenAI / Mock Section Generators
        const sections = await (0, openai_service_1.generateAssignmentAI)({
            title: assignment.title,
            subject: assignment.subject,
            difficulty: assignment.difficulty,
            numberOfQuestions: 5 // Default number of questions
        });
        assignment.sections = sections;
        await assignment.save();
        // WebSocket Event 2: progress (75%)
        await new Promise((resolve) => setTimeout(resolve, 800));
        (0, socket_handler_1.broadcastGenerationProgress)(assignmentId, 75, 'AI synthesis successful. Designing section layouts and formatting margins...');
        // Compile PDF
        const pdfPath = await (0, pdf_service_1.generateAssessmentPDF)(assignment);
        const relativePdfPath = `/pdfs/assessment-${assignment._id}.pdf`;
        assignment.pdfPath = relativePdfPath;
        assignment.status = 'completed';
        await assignment.save();
        // WebSocket Event 2: progress (90%)
        await new Promise((resolve) => setTimeout(resolve, 500));
        (0, socket_handler_1.broadcastGenerationProgress)(assignmentId, 90, 'Finalizing print-ready PDF files and caching metadata...');
        // WebSocket Event 3: completed
        await new Promise((resolve) => setTimeout(resolve, 500));
        (0, socket_handler_1.broadcastGenerationCompleted)(assignmentId, assignment);
        console.log(`✅ [Worker] Successfully generated assignment: ${assignmentId}`);
    }
    catch (error) {
        console.error(`❌ [Worker] Failed generating assignment ${assignmentId}:`, error);
        try {
            await assessment_model_1.Assignment.findByIdAndUpdate(assignmentId, {
                status: 'failed',
                error: error.message || 'Unknown generation error'
            });
        }
        catch (dbErr) {
            console.error('Failed updating error status in database:', dbErr);
        }
        // WebSocket Event 4: failed
        (0, socket_handler_1.broadcastGenerationFailed)(assignmentId, error.message || 'Unknown generation error');
    }
};
exports.executeGeneration = executeGeneration;
// In-Memory simulated asynchronous runner (used when Redis is offline)
const runInMemoryWorker = async (assignmentId) => {
    await (0, exports.executeGeneration)(assignmentId);
};
exports.runInMemoryWorker = runInMemoryWorker;
// BullMQ Worker setup
let bullWorker = null;
const initWorker = () => {
    if ((0, redis_1.checkRedisStatus)()) {
        const connection = (0, redis_1.initRedis)();
        if (connection) {
            bullWorker = new bullmq_1.Worker(QUEUE_NAME, async (job) => {
                const { assignmentId } = job.data;
                await (0, exports.executeGeneration)(assignmentId);
            }, {
                connection,
                concurrency: 2
            });
            bullWorker.on('completed', (job) => {
                console.log(`✅ [BullMQ Worker] Job completed: ${job.id}`);
            });
            bullWorker.on('failed', (job, err) => {
                console.error(`❌ [BullMQ Worker] Job failed: ${job?.id}. Error: ${err.message}`);
            });
            console.log('✅ BullMQ Worker initialized successfully');
        }
    }
    else {
        console.log('⚠️ Redis offline. BullMQ Worker not registered (In-Memory runner active)');
    }
};
exports.initWorker = initWorker;
//# sourceMappingURL=generator.worker.js.map
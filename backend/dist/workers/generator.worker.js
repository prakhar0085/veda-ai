"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWorker = exports.runInMemoryWorker = exports.executeGeneration = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const assessment_model_1 = require("../models/assessment.model");
const openai_service_1 = require("../services/openai.service");
const pdf_queue_1 = require("../queues/pdf.queue");
const socket_handler_1 = require("../sockets/socket.handler");
const QUEUE_NAME = 'assessment-generation';
// Unified generation executor coordinates queue progress steps and websocket events
const executeGeneration = async (assignmentId) => {
    try {
        console.log(`🔨 [AI Worker] Starting AI questions synthesis for ID: ${assignmentId}`);
        // WebSocket Event 1: started (10%)
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
            numberOfQuestions: assignment.numberOfQuestions || 5,
            additionalInstructions: assignment.additionalInstructions || ''
        });
        // Save sections and update status to completed
        assignment.sections = sections;
        assignment.status = 'completed';
        await assignment.save();
        // WebSocket Event 2: progress (70%)
        await new Promise((resolve) => setTimeout(resolve, 800));
        (0, socket_handler_1.broadcastGenerationProgress)(assignmentId, 70, 'AI synthesis successful. Delegate exam to decoupled PDF compiler queues...');
        // DECOUPLED STAGE: Enqueue compilation job inside secondary PDF compiler queue
        await (0, pdf_queue_1.addPDFJob)(assignment._id.toString());
        console.log(`✅ [AI Worker] Successfully completed AI question synthesis. Delegated to PDF queue.`);
        // Broadcast generation completed with assignment data
        (0, socket_handler_1.broadcastGenerationCompleted)(assignmentId, assignment);
    }
    catch (error) {
        console.error(`❌ [AI Worker] Failed generating questions for ${assignmentId}:`, error);
        try {
            await assessment_model_1.Assignment.findByIdAndUpdate(assignmentId, {
                status: 'failed',
                error: error.message || 'AI generation failed'
            });
        }
        catch (dbErr) {
            console.error('Failed updating error status in database:', dbErr);
        }
        // WebSocket Event 4: failed
        (0, socket_handler_1.broadcastGenerationFailed)(assignmentId, error.message || 'AI generation failed');
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
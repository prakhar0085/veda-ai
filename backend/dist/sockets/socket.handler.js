"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastGenerationFailed = exports.broadcastGenerationCompleted = exports.broadcastGenerationProgress = exports.broadcastGenerationStarted = exports.getSocketServer = exports.initSockets = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSockets = (httpServer, frontendUrl) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: [frontendUrl, 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Join a room for a specific assignment generation
        socket.on('join-assessment-room', (assignmentId) => {
            socket.join(`assignment:${assignmentId}`);
            console.log(`📡 Client ${socket.id} joined room: assignment:${assignmentId}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSockets = initSockets;
const getSocketServer = () => {
    return io;
};
exports.getSocketServer = getSocketServer;
// WebSocket Event 1: Generation Started
const broadcastGenerationStarted = (assignmentId) => {
    if (io) {
        io.to(`assignment:${assignmentId}`).emit('generation-started', {
            id: assignmentId,
            message: 'Background worker active. Starting assessment synthesis...'
        });
        console.log(`📢 Broadcasted [generation-started] room assignment:${assignmentId}`);
    }
};
exports.broadcastGenerationStarted = broadcastGenerationStarted;
// WebSocket Event 2: Generation Progress
const broadcastGenerationProgress = (assignmentId, progress, message) => {
    if (io) {
        io.to(`assignment:${assignmentId}`).emit('generation-progress', {
            id: assignmentId,
            progress,
            message
        });
        console.log(`📢 Broadcasted [generation-progress] room assignment:${assignmentId} - ${progress}%: ${message}`);
    }
};
exports.broadcastGenerationProgress = broadcastGenerationProgress;
// WebSocket Event 3: Generation Completed
const broadcastGenerationCompleted = (assignmentId, data) => {
    if (io) {
        io.to(`assignment:${assignmentId}`).emit('generation-completed', {
            id: assignmentId,
            data
        });
        console.log(`📢 Broadcasted [generation-completed] room assignment:${assignmentId}`);
    }
};
exports.broadcastGenerationCompleted = broadcastGenerationCompleted;
// WebSocket Event 4: Generation Failed
const broadcastGenerationFailed = (assignmentId, error) => {
    if (io) {
        io.to(`assignment:${assignmentId}`).emit('generation-failed', {
            id: assignmentId,
            error
        });
        console.log(`📢 Broadcasted [generation-failed] room assignment:${assignmentId} - Error: ${error}`);
    }
};
exports.broadcastGenerationFailed = broadcastGenerationFailed;
//# sourceMappingURL=socket.handler.js.map
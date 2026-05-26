"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configuration imports
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const generator_queue_1 = require("./queues/generator.queue");
const generator_worker_1 = require("./workers/generator.worker");
const socket_handler_1 = require("./sockets/socket.handler");
// Middleware & Router imports
const assessment_routes_1 = __importDefault(require("./routes/assessment.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
// Load environmental variables
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const startServer = async () => {
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    // Ensure public folder structure exists for storing PDFs in workspace
    const pdfDir = path_1.default.join(__dirname, '..', 'public', 'pdfs');
    if (!fs_1.default.existsSync(pdfDir)) {
        fs_1.default.mkdirSync(pdfDir, { recursive: true });
    }
    // --- MIDDLEWARE PORTAL ---
    // Configure CORS to support communication with our Next.js client
    app.use((0, cors_1.default)({
        origin: [FRONTEND_URL, 'http://localhost:3000'],
        credentials: true
    }));
    // Helmet helps secure Express apps by setting various HTTP headers
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' } // Allows iframe embeddings of PDF documents
    }));
    // HTTP Request logger
    app.use((0, morgan_1.default)('dev'));
    // Body parsers
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // --- STATIC FILES PORTAL ---
    // Hosts generated PDFs directly
    app.use('/pdfs', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'pdfs')));
    // --- DATABASE & CACHING INITIALIZATION ---
    await (0, db_1.connectDB)();
    (0, redis_1.initRedis)(); // Initializes Redis connection
    // --- ASYNC QUEUES & WORKERS HUBS ---
    (0, generator_queue_1.initQueue)(); // Initializes BullMQ Queues
    (0, generator_worker_1.initWorker)(); // Initializes BullMQ Workers
    // --- WEBSOCKET ENGINE ---
    (0, socket_handler_1.initSockets)(server, FRONTEND_URL);
    // --- ROUTE ATTACHMENT ---
    app.use('/api/assessments', assessment_routes_1.default);
    app.use('/api/assignments', assignment_routes_1.default);
    // Standard health check probe
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'active',
            timestamp: new Date().toISOString()
        });
    });
    // Global Express Error Interceptor
    app.use(error_middleware_1.errorHandler);
    server.listen(PORT, () => {
        console.log(`🚀 VedaAI backend online at: http://localhost:${PORT}`);
    });
};
// Handle process crashes gracefully
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception encountered:', error);
});
startServer();
//# sourceMappingURL=index.js.map
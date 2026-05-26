import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Configuration imports
import { connectDB } from './config/db';
import { initRedis } from './config/redis';
import { initQueue } from './queues/generator.queue';
import { initWorker } from './workers/generator.worker';
import { initSockets } from './sockets/socket.handler';
import { initPDFQueue } from './queues/pdf.queue';
import { initPDFWorker } from './workers/pdf.worker';

// Middleware & Router imports
import assessmentRoutes from './routes/assessment.routes';
import assignmentRoutes from './routes/assignment.routes';
import { errorHandler } from './middleware/error.middleware';

// Load environmental variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const startServer = async () => {
  const app = express();
  const server = http.createServer(app);

  // Ensure public folder structure exists for storing PDFs in workspace
  const pdfDir = path.join(__dirname, '..', 'public', 'pdfs');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  // --- MIDDLEWARE PORTAL ---
  // Configure CORS to support communication with our Next.js client
  app.use(
    cors({
      origin: [FRONTEND_URL, 'http://localhost:3000'],
      credentials: true
    })
  );

  // Helmet helps secure Express apps by setting various HTTP headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' } // Allows iframe embeddings of PDF documents
    })
  );

  // HTTP Request logger
  app.use(morgan('dev'));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- STATIC FILES PORTAL ---
  // Hosts generated PDFs directly
  app.use('/pdfs', express.static(path.join(__dirname, '..', 'public', 'pdfs')));

  // --- DATABASE & CACHING INITIALIZATION ---
  await connectDB();
  initRedis(); // Initializes Redis connection

  // --- ASYNC QUEUES & WORKERS HUBS ---
  initQueue();  // Initializes BullMQ Queues
  initWorker(); // Initializes BullMQ Workers
  initPDFQueue();  // Initializes BullMQ PDF Queues
  initPDFWorker(); // Initializes BullMQ PDF Workers

  // --- WEBSOCKET ENGINE ---
  initSockets(server, FRONTEND_URL);

  // --- ROUTE ATTACHMENT ---
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/assignments', assignmentRoutes);

  // Standard health check probe
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'active',
      timestamp: new Date().toISOString()
    });
  });

  // Global Express Error Interceptor
  app.use(errorHandler);

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

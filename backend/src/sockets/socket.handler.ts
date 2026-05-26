import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketServer | null = null;

export const initSockets = (httpServer: HTTPServer, frontendUrl: string): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: [frontendUrl, 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a room for a specific assignment generation
    socket.on('join-assessment-room', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(`📡 Client ${socket.id} joined room: assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketServer = (): SocketServer | null => {
  return io;
};

// WebSocket Event 1: Generation Started
export const broadcastGenerationStarted = (assignmentId: string): void => {
  if (io) {
    io.to(`assignment:${assignmentId}`).emit('generation-started', {
      id: assignmentId,
      message: 'Background worker active. Starting assessment synthesis...'
    });
    console.log(`📢 Broadcasted [generation-started] room assignment:${assignmentId}`);
  }
};

// WebSocket Event 2: Generation Progress
export const broadcastGenerationProgress = (
  assignmentId: string,
  progress: number,
  message: string
): void => {
  if (io) {
    io.to(`assignment:${assignmentId}`).emit('generation-progress', {
      id: assignmentId,
      progress,
      message
    });
    console.log(`📢 Broadcasted [generation-progress] room assignment:${assignmentId} - ${progress}%: ${message}`);
  }
};

// WebSocket Event 3: Generation Completed
export const broadcastGenerationCompleted = (assignmentId: string, data: any): void => {
  if (io) {
    io.to(`assignment:${assignmentId}`).emit('generation-completed', {
      id: assignmentId,
      data
    });
    console.log(`📢 Broadcasted [generation-completed] room assignment:${assignmentId}`);
  }
};

// WebSocket Event 4: Generation Failed
export const broadcastGenerationFailed = (assignmentId: string, error: string): void => {
  if (io) {
    io.to(`assignment:${assignmentId}`).emit('generation-failed', {
      id: assignmentId,
      error
    });
    console.log(`📢 Broadcasted [generation-failed] room assignment:${assignmentId} - Error: ${error}`);
  }
};

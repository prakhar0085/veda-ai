import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('🔌 Connected to Socket.io server');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from Socket.io server');
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const joinAssessmentRoom = (assessmentId: string): void => {
  const currentSocket = initSocket();
  currentSocket.emit('join-assessment-room', assessmentId);
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

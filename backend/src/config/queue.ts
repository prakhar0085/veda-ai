import dotenv from 'dotenv';

dotenv.config();

export const queueConfig = {
  connection: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  }
};

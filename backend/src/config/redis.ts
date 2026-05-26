import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisConnection: Redis | null = null;
let isRedisConnected = false;

export const initRedis = (): Redis | null => {
  if (redisConnection) return redisConnection;

  try {
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 3) {
          // Fail fast so that we fall back to offline simulation
          console.warn('⚠️ Redis connection failed multiple times. Falling back to in-memory simulated queue.');
          isRedisConnected = false;
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      }
    });

    redisConnection.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisConnected = true;
    });

    redisConnection.on('error', (err) => {
      // Catch errors silently to prevent process from crashing when Redis is not running
      if (isRedisConnected) {
        console.warn('⚠️ Redis error encountered:', err.message);
      }
      isRedisConnected = false;
    });

    return redisConnection;
  } catch (error) {
    console.warn('⚠️ Could not initialize Redis. Falling back to in-memory simulated queue.');
    isRedisConnected = false;
    return null;
  }
};

export const getRedisConnection = (): Redis | null => {
  return redisConnection;
};

export const checkRedisStatus = (): boolean => {
  return isRedisConnected;
};

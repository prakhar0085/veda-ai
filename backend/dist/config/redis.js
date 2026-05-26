"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRedisStatus = exports.getRedisConnection = exports.initRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisConnection = null;
let isRedisConnected = false;
const initRedis = () => {
    if (redisConnection)
        return redisConnection;
    try {
        redisConnection = new ioredis_1.default(REDIS_URL, {
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
    }
    catch (error) {
        console.warn('⚠️ Could not initialize Redis. Falling back to in-memory simulated queue.');
        isRedisConnected = false;
        return null;
    }
};
exports.initRedis = initRedis;
const getRedisConnection = () => {
    return redisConnection;
};
exports.getRedisConnection = getRedisConnection;
const checkRedisStatus = () => {
    return isRedisConnected;
};
exports.checkRedisStatus = checkRedisStatus;
//# sourceMappingURL=redis.js.map
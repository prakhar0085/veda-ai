"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.queueConfig = {
    connection: {
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    }
};
//# sourceMappingURL=queue.js.map
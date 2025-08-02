// config/redis.js
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

// Export a singleton instance of the Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
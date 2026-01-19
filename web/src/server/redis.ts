/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import Redis from 'ioredis'

const globalForRedis = global as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    // Fix BullMQ/ioredis worker "Reached the max retries per request limit"
    maxRetriesPerRequest: null,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

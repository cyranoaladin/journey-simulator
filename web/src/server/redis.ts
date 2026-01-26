import { createClient } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis =
  globalForRedis.redis ??
  createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Too many reconnection attempts')
          return new Error('Too many reconnection attempts')
        }
        return Math.min(retries * 100, 3000)
      },
    },
  })

redis.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redis.on('connect', () => {
  console.log('Redis: Connected')
})

if (!redis.isOpen) {
  redis.connect().catch((err) => {
    console.error('Redis: Failed to connect:', err)
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

export async function cacheFlush(): Promise<void> {
  try {
    await redis.flushAll()
  } catch (error) {
    console.error('Cache flush error:', error)
  }
}

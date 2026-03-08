/**
 * Memory Layer for Journey Simulator
 * Handles persistent state using Redis
 *
 * Key structure:
 * - journey:{userId}:{journeyId} → JourneyState (30-day TTL)
 * - user:{userId}:xp → current XP
 * - user:{userId}:nfts → minted NFT list
 * - session:{sessionId} → user session (24-hour TTL)
 */

import { createClient, type RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

export async function initRedis(): Promise<RedisClientType> {
  if (redisClient) return redisClient

  redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })

  redisClient.on('error', (err) => console.error('[Redis Error]', err))
  redisClient.on('connect', () => console.log('[Redis] Connected'))

  await redisClient.connect()
  return redisClient
}

export async function getRedis(): Promise<RedisClientType> {
  if (!redisClient) {
    return initRedis()
  }
  return redisClient
}

// ---- Journey State ----

export async function loadJourneyState(userId: string, journeyId: string): Promise<Record<string, unknown>> {
  const redis = await getRedis()
  const key = `journey:${userId}:${journeyId}`

  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error(`[Memory] Failed to load journey state: ${key}`, error)
    return {}
  }
}

export async function saveJourneyState(
  userId: string,
  journeyId: string,
  state: Record<string, unknown>
): Promise<void> {
  const redis = await getRedis()
  const key = `journey:${userId}:${journeyId}`

  try {
    await redis.setEx(
      key,
      86400 * 30, // 30-day TTL
      JSON.stringify({
        ...state,
        updated_at: new Date().toISOString(),
      })
    )
  } catch (error) {
    console.error(`[Memory] Failed to save journey state: ${key}`, error)
    throw error
  }
}

export async function deleteJourneyState(userId: string, journeyId: string): Promise<void> {
  const redis = await getRedis()
  const key = `journey:${userId}:${journeyId}`

  try {
    await redis.del(key)
  } catch (error) {
    console.error(`[Memory] Failed to delete journey state: ${key}`, error)
  }
}

// ---- User XP Cache ----

export async function getUserXP(userId: string): Promise<number> {
  const redis = await getRedis()
  const key = `user:${userId}:xp`

  try {
    const xp = await redis.get(key)
    return xp ? parseInt(xp, 10) : 0
  } catch (error) {
    console.error(`[Memory] Failed to get user XP: ${userId}`, error)
    return 0
  }
}

export async function incrementUserXP(userId: string, amount: number): Promise<number> {
  const redis = await getRedis()
  const key = `user:${userId}:xp`

  try {
    return await redis.incrBy(key, amount)
  } catch (error) {
    console.error(`[Memory] Failed to increment user XP: ${userId}`, error)
    throw error
  }
}

// ---- User NFTs Cache ----

export async function getUserNFTs(userId: string): Promise<string[]> {
  const redis = await getRedis()
  const key = `user:${userId}:nfts`

  try {
    const nfts = await redis.lRange(key, 0, -1)
    return nfts
  } catch (error) {
    console.error(`[Memory] Failed to get user NFTs: ${userId}`, error)
    return []
  }
}

export async function addUserNFT(userId: string, nftId: string): Promise<void> {
  const redis = await getRedis()
  const key = `user:${userId}:nfts`

  try {
    await redis.rPush(key, nftId)
    await redis.expire(key, 86400 * 365) // 1-year TTL
  } catch (error) {
    console.error(`[Memory] Failed to add user NFT: ${userId}`, error)
  }
}

// ---- Session Management ----

export async function createSession(sessionId: string, userId: string, metadata: Record<string, unknown>): Promise<void> {
  const redis = await getRedis()
  const key = `session:${sessionId}`

  try {
    await redis.setEx(
      key,
      86400, // 24-hour TTL
      JSON.stringify({
        userId,
        ...metadata,
        created_at: new Date().toISOString(),
      })
    )
  } catch (error) {
    console.error(`[Memory] Failed to create session: ${sessionId}`, error)
  }
}

export async function getSession(sessionId: string): Promise<Record<string, unknown> | null> {
  const redis = await getRedis()
  const key = `session:${sessionId}`

  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`[Memory] Failed to get session: ${sessionId}`, error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const redis = await getRedis()
  const key = `session:${sessionId}`

  try {
    await redis.del(key)
  } catch (error) {
    console.error(`[Memory] Failed to delete session: ${sessionId}`, error)
  }
}

// ---- Rate Limiting ----

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = await getRedis()

  try {
    const current = await redis.incr(key)
    let ttl = await redis.ttl(key)

    if (current === 1) {
      await redis.expire(key, windowSeconds)
      ttl = windowSeconds
    }

    const allowed = current <= limit
    const remaining = Math.max(0, limit - current)
    const resetAt = Date.now() + (ttl * 1000 || windowSeconds * 1000)

    return { allowed, remaining, resetAt }
  } catch (error) {
    console.error(`[Memory] Rate limit check failed: ${key}`, error)
    // Fail open (allow request)
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 }
  }
}

// ---- Cleanup ----

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

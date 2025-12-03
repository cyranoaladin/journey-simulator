import crypto from 'crypto'
import { redis } from './redis'

export type SiwsChallenge = {
    id: string
    nonce: string
    message: string
    addressHint?: string
    createdAt: number
    expiresAt: number
    used: boolean
}

const CHALLENGE_TTL_SECONDS = 5 * 60 // 5 minutes

export async function createSiwsChallenge(
    addressHint?: string
): Promise<SiwsChallenge> {
    const id = crypto.randomUUID()
    const nonce = crypto.randomUUID()
    const domain = process.env.SIWS_APP_DOMAIN || 'mfai.app'

    const message = [
        `Sign in to Money Factory AI`,
        ``,
        `Domain: ${domain}`,
        `Nonce: ${nonce}`,
        `Purpose: authenticate this wallet on Money Factory AI`,
    ].join('\n')

    const now = Date.now()
    const challenge: SiwsChallenge = {
        id,
        nonce,
        message,
        addressHint,
        createdAt: now,
        expiresAt: now + CHALLENGE_TTL_SECONDS * 1000,
        used: false,
    }

    await redis.set(
        `siws:${id}`,
        JSON.stringify(challenge),
        'EX',
        CHALLENGE_TTL_SECONDS
    )
    return challenge
}

export async function getSiwsChallenge(
    id: string
): Promise<SiwsChallenge | null> {
    const data = await redis.get(`siws:${id}`)
    if (!data) return null

    const ch = JSON.parse(data) as SiwsChallenge
    if (ch.used) return null
    // Redis handles expiration, but double check just in case
    if (Date.now() > ch.expiresAt) {
        return null
    }
    return ch
}

export async function markSiwsChallengeUsed(id: string): Promise<void> {
    const ch = await getSiwsChallenge(id)
    if (!ch) return

    ch.used = true
    // Update with same TTL or shorter
    const ttl = Math.max(0, Math.ceil((ch.expiresAt - Date.now()) / 1000))
    if (ttl > 0) {
        await redis.set(`siws:${id}`, JSON.stringify(ch), 'EX', ttl)
    } else {
        await redis.del(`siws:${id}`)
    }
}

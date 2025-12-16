import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import { getSiwsChallenge, markSiwsChallengeUsed } from '@/server/siwsStore'

const Body = z.object({
  address: z.string().min(32).max(64), // publicKey base58
  signature: z.string().min(10), // signature base58 de message
  challengeId: z.string().uuid(), // id retourné par /challenge
})

function base64Url(input: Buffer | Uint8Array | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input as any)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

// NB: comme Next ne supporte pas await import('crypto') dans une fonction sync,
// on sépare la fabrication du token dans une fonction async.
async function signJwtLikeAsync(address: string, nonce: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 60 * 60 * 24 // 24h

  const payload = {
    sub: address,
    nonce,
    iat: now,
    exp,
    iss: process.env.SIWS_APP_DOMAIN || 'mfai.app',
  }

  const headerB64 = base64Url(JSON.stringify(header))
  const payloadB64 = base64Url(JSON.stringify(payload))
  const data = `${headerB64}.${payloadB64}`

  const cryptoMod = await import('crypto')
  const secret = process.env.SIWS_JWT_SECRET || 'dev-siws-secret-change-me'
  const sig = base64Url(cryptoMod.createHmac('sha256', secret).update(data).digest())

  return `${data}.${sig}`
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { address, signature, challengeId } = parsed.data
  const challenge = await getSiwsChallenge(challengeId)

  if (!challenge) {
    return NextResponse.json({ error: 'invalid_or_expired_challenge' }, { status: 400 })
  }

  try {
    const pubkey = new PublicKey(address)
    const sigBytes = bs58.decode(signature)
    const msgBytes = new TextEncoder().encode(challenge.message)
    const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubkey.toBytes())

    if (!ok) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
    }

    await markSiwsChallengeUsed(challengeId)

    const token = await signJwtLikeAsync(address, challenge.nonce)

    return NextResponse.json({
      ok: true,
      address,
      token,
      issuedAt: new Date().toISOString(),
      expiresIn: 60 * 60 * 24,
    })
  } catch (e) {
    console.error('SIWS verify error', e)
    return NextResponse.json({ error: 'verification_failed' }, { status: 500 })
  }
}

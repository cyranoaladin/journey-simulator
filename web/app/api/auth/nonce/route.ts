import { NextResponse } from 'next/server'
import crypto from 'crypto'

// In a real production app, you might store this in Redis with an expiration
// For this MVP, we'll use a simple in-memory store or stateless approach (signed cookie)
// But to keep it simple and stateless for now, we will just generate a random nonce
// and expect the client to sign it. The verification step will check the signature.
// To prevent replay attacks, we should ideally store the nonce associated with the wallet
// and invalidate it after use.

export async function POST() {
  try {
    const nonce = crypto.randomBytes(32).toString('base64')

    // We return the nonce to the client.
    // The client will sign a message containing this nonce.
    // Message format: "Sign this message to login to Money Factory AI.\nNonce: <nonce>"

    return NextResponse.json({ nonce })
  } catch (error) {
    console.error('Error generating nonce:', error)
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 })
  }
}

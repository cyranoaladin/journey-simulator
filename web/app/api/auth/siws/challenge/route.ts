import { NextResponse } from 'next/server'

export async function POST() {
  const challenge = crypto.randomUUID()
  const message = `Sign this message to authenticate. Nonce: ${challenge}`
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  return NextResponse.json({ challenge, message, expiresAt })
}

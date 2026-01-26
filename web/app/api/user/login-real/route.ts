import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let email = ''
  let walletAddress = ''

  try {
    const body = await req.json()
    email = body?.email || ''
    walletAddress = body?.walletAddress || ''
  } catch {}

  if (!email || !walletAddress) {
    return NextResponse.json(
      { ok: false, error: 'Email and wallet address are required for real mode' },
      { status: 400 }
    )
  }

  const user = {
    id: `u-${Date.now()}`,
    email,
    name: email.split('@')[0],
    walletAddress,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({
    ok: true,
    user,
    accessToken: `real-access-${Date.now()}`,
    refreshToken: `real-refresh-${Date.now()}`,
  })
}

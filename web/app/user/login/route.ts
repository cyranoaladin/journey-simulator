/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success)
    return NextResponse.json({ success: false, message: 'bad_request' }, { status: 400 })
  const { email } = parsed.data
  const user = {
    id: 'demo_user',
    name: email.split('@')[0],
    email,
    role: 'user' as const,
    wallet_address: '',
    persona: 'developer' as const,
    total_xp: 0,
    current_level: 0,
    completed_phases: 0,
    subscription: false as const,
    is_active: true,
  }
  return NextResponse.json({
    success: true,
    user,
    accessToken: 'demo.access.token',
    refreshToken: 'demo.refresh.token',
  })
}

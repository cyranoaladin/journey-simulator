import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  wallet_address: z.string().optional(),
  persona: z.string().optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success)
    return NextResponse.json({ success: false, message: 'bad_request' }, { status: 400 })
  const { name, email } = parsed.data
  const user = {
    id: 'demo_user',
    name,
    email,
    role: 'user' as const,
    wallet_address: parsed.data.wallet_address || '',
    persona: (parsed.data.persona || 'developer') as any,
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

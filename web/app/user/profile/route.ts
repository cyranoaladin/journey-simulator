import { NextResponse } from 'next/server'

export async function GET() {
  const user = {
    id: 'demo_user',
    name: 'demo',
    email: 'demo@local',
    role: 'user' as const,
    wallet_address: '',
    persona: 'developer' as const,
    total_xp: 0,
    current_level: 0,
    completed_phases: 0,
    subscription: false as const,
    is_active: true,
  }
  return NextResponse.json({ user })
}

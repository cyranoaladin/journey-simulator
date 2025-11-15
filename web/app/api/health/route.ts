import { NextResponse } from 'next/server'
import { bumpHealth } from '@/server/metrics'

export async function GET() {
  bumpHealth()
  return NextResponse.json({ ok: true, time: new Date().toISOString() })
}

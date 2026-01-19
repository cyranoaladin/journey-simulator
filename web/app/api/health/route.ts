/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextResponse } from 'next/server'
import { bumpHealth } from '@/server/metrics'

export async function GET() {
  bumpHealth()
  return NextResponse.json({ ok: true, time: new Date().toISOString() })
}

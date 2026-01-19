/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextResponse } from 'next/server'
import { getMetrics } from '@/server/metrics'

export async function GET() {
  return NextResponse.json({ ok: true, metrics: getMetrics(), time: new Date().toISOString() })
}

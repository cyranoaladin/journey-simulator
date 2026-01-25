/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextRequest, NextResponse } from 'next/server'
import { listAgentLogs } from '@/server/state'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const journeyId = searchParams.get('journeyId') || undefined
  const limit = Number(searchParams.get('limit') || '50')
  const logs = await listAgentLogs({ journeyId, limit })
  return NextResponse.json({ logs })
}

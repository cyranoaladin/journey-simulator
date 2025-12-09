import { NextRequest, NextResponse } from 'next/server'
import { listAgentLogs } from '@/server/state'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const journeyId = searchParams.get('journeyId') || undefined
  const limit = Number(searchParams.get('limit') || '50')
  const logs = await listAgentLogs({ journeyId, limit })
  return NextResponse.json({ logs })
}

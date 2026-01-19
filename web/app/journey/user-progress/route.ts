/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextRequest, NextResponse } from 'next/server'

type ProgressState = {
  total_xp: number
  completed_phases: number
  nft_certificates: unknown[]
  token_transactions: { mfai_tokens: number }
  persona: string
  subscription: false
}

const progress: ProgressState = {
  total_xp: 0,
  completed_phases: 0,
  nft_certificates: [],
  token_transactions: { mfai_tokens: 0 },
  persona: 'developer',
  subscription: false,
}

export async function GET() {
  return NextResponse.json({ success: true, progress })
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<ProgressState> | null
  if (body && typeof body === 'object') {
    if (typeof body.total_xp === 'number') progress.total_xp = body.total_xp
    if (typeof body.completed_phases === 'number') progress.completed_phases = body.completed_phases
  }
  return NextResponse.json({ ok: true })
}

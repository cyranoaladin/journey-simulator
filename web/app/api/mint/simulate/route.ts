/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { simulateTx } from 'agents/tools/solana'

const Body = z.object({
  recipient: z.string(),
  name: z.string().min(1),
  symbol: z.string().min(1),
  uri: z.string().url(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const spec = { ...parsed.data, type: 'CERT_NFT' as const }
  const sim = await simulateTx(spec)

  return NextResponse.json({ ok: true, sim })
}

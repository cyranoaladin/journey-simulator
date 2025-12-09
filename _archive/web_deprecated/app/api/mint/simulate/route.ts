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

  // Best-effort logging (optional)
  try {
    await fetch('http://localhost:8000/mint/mintlogs/', {
      // TODO: Replace with actual FastAPI URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ spec, network: sim.network }),
    })
  } catch (e) {
    console.warn('Failed to log simulation to FastAPI', e)
  }

  return NextResponse.json({ ok: true, sim })
}

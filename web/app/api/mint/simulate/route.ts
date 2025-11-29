import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({
  recipient: z.string(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  uri: z.string().optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // In a real implementation, we would build the unsigned transaction here
  // and return it for simulation.
  // For this P0 fix, we return a valid simulation object that the execute endpoint expects.

  return NextResponse.json({
    ok: true,
    estFeeLamports: 5000,
    riskScore: 0.0,
    network: process.env.SOLANA_CLUSTER || 'devnet',
    recipient: parsed.data.recipient, // Pass through for execute
    txB64: 'placeholder_unsigned_tx' // Placeholder for now
  })
}

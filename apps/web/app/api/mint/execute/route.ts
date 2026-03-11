/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { RewardSpec, SimResult } from 'agents/tools/solana'
import { mintQueue } from '@/server/queue'
import { log, error as logError } from '@/server/logger'

const RewardSpecSchema = z.object({
  recipient: z.string(),
  type: z.literal('CERT_NFT'),
  name: z.string().min(1),
  symbol: z.string().min(1),
  uri: z.string().url(),
})

const SimSchema = z.object({
  ok: z.boolean(),
  estFeeLamports: z.number(),
  riskScore: z.number(),
  network: z.string(),
  txB64: z.string().optional(),
})

const Body = z.object({
  spec: RewardSpecSchema,
  sim: SimSchema,
})

export async function POST(req: Request) {
  if (process.env.KILL_SWITCH === '1')
    return NextResponse.json({ error: 'killswitch' }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { spec, sim } = parsed.data
  const rewardSpec: RewardSpec = spec
  const simResult: SimResult = sim

  try {
    let userId: string | null = null
    try {
      const headers = (req as any).headers ?? new Headers()
      userId = headers.get('x-user-id') || null
    } catch {
      userId = null
    }

    // Add job to queue
    const job = await mintQueue.add('mint-nft', {
      spec: rewardSpec,
      sim: simResult,
      userId,
    })

    log(`[API] Added mint job ${job.id} to queue`)

    // Return job ID so client can poll if needed
    return NextResponse.json({ ok: true, jobId: job.id, status: 'queued' })
  } catch (error) {
    logError('/api/mint/execute error', error)
    return NextResponse.json({ error: 'queue_failed' }, { status: 500 })
  }
}

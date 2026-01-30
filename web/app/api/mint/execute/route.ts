import { NextResponse } from 'next/server'
import { z } from 'zod'
import { executeReward } from 'agents/tools/solana'

const Body = z.object({
  sim: z.object({
    ok: z.boolean(),
    estFeeLamports: z.number(),
    riskScore: z.number(),
    network: z.string(),
  }),
})

export async function POST(req: Request) {
  if (process.env.KILL_SWITCH === '1')
    return NextResponse.json({ error: 'killswitch' }, { status: 403 })
  if (!process.env.MINTER_SECRET_KEY)
    return NextResponse.json({ error: 'minter_key_missing' }, { status: 400 })
  // Basic per-IP rate limiting (MVP)
  try {
    const { rateLimit } = await import('@/server/rateLimit')
    const r = rateLimit(req)
    if (!r.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', retry_after_ms: r.resetMs },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(r.resetMs / 1000)) } }
      )
    }
  } catch (rateLimitError) {
    console.warn('Rate limiter unavailable, continuing without quota enforcement', rateLimitError)
  }
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  // Execute reward (primary action)
  let tx: Awaited<ReturnType<typeof executeReward>>
  try {
    tx = await executeReward(parsed.data.sim)
  } catch (executionError) {
    console.error('Failed to execute reward transaction', executionError)
    return NextResponse.json({ error: 'execute_failed' }, { status: 500 })
  }

  // Best-effort logging to DB (should not break success path)
  try {
    type PrismaMint = {
      prisma: {
        mintLog: {
          create: (args: {
            data: {
              spec: unknown
              signature?: string | null
              network: string
              userId?: string | null
            }
          }) => Promise<{ id: string }>
        }
      }
    }
    const db = (await import('@/server/db')) as unknown as PrismaMint
    const userId = typeof req.headers?.get === "function" ? req.headers.get("x-user-id") : null
    await db.prisma.mintLog.create({
      data: {
        spec: parsed.data.sim,
        signature: tx.txSig,
        network: parsed.data.sim.network,
        userId: userId ?? null,
      },
    })
  } catch (logError) {
    console.warn('Failed to persist mint execution log', logError)
  }

  return NextResponse.json({ ok: true, tx })
}

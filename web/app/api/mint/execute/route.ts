import { NextResponse } from 'next/server'
import { z } from 'zod'
import { executeReward } from 'agents/tools/solana'

const Body = z.object({ sim: z.object({ ok: z.boolean(), estFeeLamports: z.number(), riskScore: z.number(), network: z.string() }) })

export async function POST(req: Request){
  if(process.env.KILL_SWITCH === '1') return NextResponse.json({ error: 'killswitch' }, { status: 403 })
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  try{
    const res = await executeReward(parsed.data.sim)
    type PrismaMint = { prisma: { mintLog: { create: (args: { data: { spec: unknown; signature?: string | null; network: string } }) => Promise<{ id: string }> } } }
    const db = (await import('@/server/db')) as unknown as PrismaMint
    await db.prisma.mintLog.create({ data: { spec: parsed.data.sim, signature: res.txSig, network: parsed.data.sim.network } })
    return NextResponse.json({ ok: true, tx: res })
  } catch {
    return NextResponse.json({ error: 'execute_failed' }, { status: 500 })
  }
}
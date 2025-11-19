import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({ amount: z.number().min(0), userId: z.string().optional() })

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { amount } = parsed.data
  return NextResponse.json({ ok: true, staked: amount, votingPowerDelta: Math.floor(amount * 2) })
}

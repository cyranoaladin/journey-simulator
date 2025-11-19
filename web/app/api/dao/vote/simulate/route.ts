import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({ proposalId: z.string(), support: z.union([z.boolean(), z.enum(['yes','no'])]) })

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const yes = parsed.data.support === true || parsed.data.support === 'yes'
  return NextResponse.json({ ok: true, result: yes ? 'approved' : 'rejected', votes: { yes: yes?1:0, no: yes?0:1 } })
}

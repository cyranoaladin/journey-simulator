import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({ refreshToken: z.string().min(1) })

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ success: false, message: 'bad_request' }, { status: 400 })
  return NextResponse.json({ accessToken: 'demo.access.token', refreshToken: 'demo.refresh.token' })
}

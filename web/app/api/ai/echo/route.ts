import { NextResponse } from 'next/server'
import { z } from 'zod'
import { bumpEcho } from '@/server/metrics'

const Body = z.object({ text: z.string().min(1).max(500), tags: z.array(z.string().min(1)).max(10).optional() })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error.flatten() }, { status: 400 })
  }
  const { text, tags } = parsed.data
  bumpEcho()
  return NextResponse.json({ text, upper: text.toUpperCase(), length: text.length, tags: tags || [] })
}

export async function GET() {
  return NextResponse.json({ sample: true, hint: 'POST { text: "hello", tags: ["demo"] }' })
}

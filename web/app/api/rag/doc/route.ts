import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({ title: z.string().min(3), content: z.string().min(3), tags: z.string().optional() })

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  type PrismaDoc = { prisma: { doc: { create: (args: { data: { title: string; content: string; tags?: string } }) => Promise<{ id: string }> } } }
  const db = (await import('@/server/db')) as unknown as PrismaDoc
  const doc = await db.prisma.doc.create({ data: parsed.data })
  return NextResponse.json({ ok: true, doc })
}

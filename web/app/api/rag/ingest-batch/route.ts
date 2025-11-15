import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText } from '@/server/embeddings'

const Body = z.object({ items: z.array(z.object({ title: z.string().min(3), content: z.string().min(3), tags: z.string().optional() })).min(1) })

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  type PrismaDoc = { prisma: { doc: { create: (args: { data: { title: string; content: string; tags?: string; embedding?: unknown } }) => Promise<{ id: string }> } } }
  const db = (await import('@/server/db')) as unknown as PrismaDoc
  const created: string[] = []
  for(const it of parsed.data.items){
    const embedding = embedText(`${it.title} ${it.content} ${it.tags ?? ''}`)
    const doc = await db.prisma.doc.create({ data: { ...it, embedding } })
    created.push(doc.id)
  }
  return NextResponse.json({ ok: true, createdCount: created.length })
}

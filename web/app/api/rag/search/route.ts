import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText, cosine } from '@/server/embeddings'

const Body = z.object({ text: z.string().min(2) })

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const qvec = embedText(parsed.data.text)
  type PrismaDoc = { prisma: { doc: { findMany: (args: { take?: number; orderBy?: unknown }) => Promise<{ id: string; title: string; embedding: unknown | null }[]> } } }
  const db = (await import('@/server/db')) as unknown as PrismaDoc
  const docs = await db.prisma.doc.findMany({ take: 50, orderBy: { createdAt: 'desc' } })
  type DocRow = { id: string; title: string; embedding: unknown | null }
  const ranked = (docs as DocRow[])
    .map((d) => ({ d, score: Array.isArray(d.embedding) ? cosine(qvec, d.embedding as number[]) : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  return NextResponse.json({ ok: true, count: ranked.length, docs: ranked.map(({ d, score }) => ({ id: d.id, title: d.title, score })) })
}

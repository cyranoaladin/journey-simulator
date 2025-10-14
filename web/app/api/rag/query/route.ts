import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({ text: z.string().min(2) })

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const q = parsed.data.text
  type PrismaDoc = { prisma: { doc: { findMany: (args: { where?: unknown; take?: number; orderBy?: unknown }) => Promise<{ id: string; title: string; content: string; tags?: string | null; embedding?: unknown }[]> } } }
  const db = (await import('@/server/db')) as unknown as PrismaDoc
  const docs = await db.prisma.doc.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
        { tags: { contains: q } },
      ]
    },
    take: 10,
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ ok: true, count: docs.length, docs })
}

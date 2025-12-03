import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText, cosine } from '@/server/embeddings'
import { rankDocs } from '@/server/ragStore'

const Body = z.object({ text: z.string().min(2) })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const qvec = embedText(parsed.data.text)

  if (process.env.DEMO_MODE === 'true') {
    const ranked = rankDocs(10, parsed.data.text)
    return NextResponse.json({
      ok: true,
      count: ranked.length,
      docs: ranked.map(({ id, path, score }) => ({ id, title: path, score })),
    })
  }

  const response = await fetch(
    `http://localhost:8000/documents/?limit=50&order_by=created_at_desc`,
    {
      // TODO: Replace with actual FastAPI URL
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  const docs = await response.json()
  if (!response.ok) {
    return NextResponse.json(
      { error: docs.detail || 'Failed to fetch documents' },
      { status: response.status }
    )
  }

  type DocRow = { id: string; path: string; meta: { embedding: number[] | unknown } } // Updated type based on FastAPI Document schema
  const ranked = (docs as DocRow[])
    .map((d) => ({
      d,
      score: Array.isArray(d.meta?.embedding) ? cosine(qvec, d.meta.embedding as number[]) : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  return NextResponse.json({
    ok: true,
    count: ranked.length,
    docs: ranked.map(({ d, score }) => ({ id: d.id, title: d.path, score })), // Using path as title for now
  })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText } from '@/server/embeddings'
import { batchCreateDocs } from '@/server/ragStore'

const Body = z.object({
  items: z
    .array(
      z.object({
        title: z.string().min(3),
        content: z.string().min(3),
        tags: z.string().optional(),
      })
    )
    .min(1),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  if (process.env.DEMO_MODE === 'true') {
    const created = batchCreateDocs(parsed.data.items)
    return NextResponse.json({ ok: true, createdCount: created.length })
  }

  const created: string[] = []
  for (const it of parsed.data.items) {
    const embedding = embedText(`${it.title} ${it.content} ${it.tags ?? ''}`)
    const response = await fetch('http://localhost:8000/documents/', {
      // TODO: Replace with actual FastAPI URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'ingest_batch',
        path: it.title,
        version: 'v1',
        meta: { tags: it.tags, embedding: embedding },
        content: it.content,
      }),
    })
    const doc = await response.json()
    if (!response.ok) {
      console.error('Failed to create document in batch:', doc.detail || doc.error)
      return NextResponse.json(
        { error: doc.detail || 'Failed to create document in batch' },
        { status: response.status }
      )
    }
    created.push(doc.id)
  }
  return NextResponse.json({ ok: true, createdCount: created.length })
}

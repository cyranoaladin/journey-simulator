import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText } from '@/server/embeddings'

const Body = z.object({
  title: z.string().min(3),
  content: z.string().min(3),
  tags: z.string().optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const embedding = embedText(
    `${parsed.data.title} ${parsed.data.content} ${parsed.data.tags ?? ''}`
  )
  
  const response = await fetch('http://localhost:8000/documents/', { // TODO: Replace with actual FastAPI URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'ingest', // Assuming 'ingest' as source for now
      path: parsed.data.title, // Using title as path for now
      version: 'v1', // Default version
      meta: { tags: parsed.data.tags, embedding: embedding }, // Embeddings as meta
      content: parsed.data.content, // Content for chunk
    }),
  })
  const doc = await response.json()
  if (!response.ok) {
    return NextResponse.json({ error: doc.detail || 'Failed to create document' }, { status: response.status })
  }
  return NextResponse.json({ ok: true, id: doc.id })
}

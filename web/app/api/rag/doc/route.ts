import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createDoc } from '@/server/ragStore'

const Body = z.object({
  title: z.string().min(3),
  content: z.string().min(3),
  tags: z.string().optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  if (process.env.DEMO_MODE === 'true') {
    const doc = createDoc(parsed.data)
    return NextResponse.json({ ok: true, doc })
  }

  const response = await fetch('http://localhost:8000/documents/', {
    // TODO: Replace with actual FastAPI URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'doc_route', // Assuming 'doc_route' as source for now
      path: parsed.data.title, // Using title as path for now
      version: 'v1', // Default version
      meta: { tags: parsed.data.tags },
      content: parsed.data.content, // Content for chunk
    }),
  })
  const doc = await response.json()
  if (!response.ok) {
    return NextResponse.json(
      { error: doc.detail || 'Failed to create document' },
      { status: response.status }
    )
  }
  return NextResponse.json({ ok: true, doc })
}

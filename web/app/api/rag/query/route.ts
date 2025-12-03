import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryDocs } from '@/server/ragStore'

const Body = z.object({ text: z.string().min(2) })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const q = parsed.data.text

  if (process.env.DEMO_MODE === 'true') {
    const docs = queryDocs(10, q)
    return NextResponse.json({ ok: true, count: docs.length, docs })
  }

  const response = await fetch(
    `http://localhost:8000/documents/?q=${q}&limit=10&order_by=created_at_desc`,
    {
      // TODO: Replace with actual FastAPI URL
      method: 'GET', // Changed to GET as documents endpoint is GET
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
  return NextResponse.json({ ok: true, count: docs.length, docs })
}

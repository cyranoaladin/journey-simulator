import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const userId = req.headers.get('x-user-id') || url.searchParams.get('userId') || undefined

  if (process.env.DEMO_MODE === 'true' && prisma?.mintLog?.findFirst) {
    const row = await prisma.mintLog.findFirst({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    if (!row) return NextResponse.json({ ok: true, last: null })
    return NextResponse.json({
      ok: true,
      last: {
        signature: row.signature,
        network: row.network,
        createdAt: row.createdAt,
        spec: row.spec,
      },
    })
  }

  const queryParams = userId ? `?user_id=${userId}` : ''
  const response = await fetch(`http://localhost:8000/mint/mintlogs/last${queryParams}`, {
    // TODO: Replace with actual FastAPI URL
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const row = await response.json()
  if (!response.ok) {
    if (response.status === 404) return NextResponse.json({ ok: true, last: null }) // No mintlog found
    return NextResponse.json(
      { error: row.detail || 'Failed to fetch last mintlog' },
      { status: response.status }
    )
  }

  if (!row) return NextResponse.json({ ok: true, last: null })
  return NextResponse.json({
    ok: true,
    last: {
      signature: row.signature,
      network: row.network,
      createdAt: row.created_at, // Use created_at from FastAPI
      spec: row.spec,
    },
  })
}

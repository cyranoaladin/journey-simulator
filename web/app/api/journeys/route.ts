import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const response = await fetch(`http://localhost:8000/journeys/?limit=20&order_by=created_at_desc`, { // TODO: Replace with actual FastAPI URL
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const journeys = await response.json()
  if (!response.ok) {
    return NextResponse.json({ error: journeys.detail || 'Failed to fetch journeys' }, { status: response.status })
  }
  return NextResponse.json({ ok: true, journeys })
}

const Create = z.object({ title: z.string().min(3), userEmail: z.string().email().optional() })
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = Create.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { title, userEmail } = parsed.data
  
  let userId: string | null = null;
  if (userEmail) {
    const userUpsertResponse = await fetch('http://localhost:8000/users/upsert', { // TODO: Replace with actual FastAPI URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail, hashed_password: "temp_password", role: "student" }), // Assuming default password and role
    })
    const user = await userUpsertResponse.json()
    if (!userUpsertResponse.ok) {
      return NextResponse.json({ error: user.detail || 'Failed to upsert user' }, { status: userUpsertResponse.status })
    }
    userId = user.id;
  }

  const journeyCreateResponse = await fetch('http://localhost:8000/journeys/', { // TODO: Replace with actual FastAPI URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, user_id: userId }),
  })
  const j = await journeyCreateResponse.json()
  if (!journeyCreateResponse.ok) {
    return NextResponse.json({ error: j.detail || 'Failed to create journey' }, { status: journeyCreateResponse.status })
  }
  return NextResponse.json({ ok: true, journey: j })
}

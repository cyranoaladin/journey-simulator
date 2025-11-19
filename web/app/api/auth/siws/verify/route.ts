import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({
  address: z.string().min(20),
  signature: z.string().min(10),
  challenge: z.string().uuid().optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  // TODO: verify signature (SIWS). For MVP stub, return a placeholder JWT.
  return NextResponse.json({ token: 'stub.jwt' })
}

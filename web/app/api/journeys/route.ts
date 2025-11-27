import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  type PrismaJourney = {
    prisma: {
      journey: {
        findMany: (args: {
          take?: number
          orderBy?: unknown
        }) => Promise<{ id: string; title: string; userId?: string | null }[]>
      }
    }
  }
  const db = (await import('@/server/db')) as unknown as PrismaJourney
  const journeys = await db.prisma.journey.findMany({ take: 20, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ ok: true, journeys })
}

const Create = z.object({ title: z.string().min(3), userEmail: z.string().email().optional() })
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = Create.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { title, userEmail } = parsed.data
  type PrismaJ = {
    prisma: {
      user: {
        upsert: (args: {
          where: { email: string }
          update: Record<string, never>
          create: { email: string }
        }) => Promise<{ id: string; email: string }>
      }
      journey: {
        create: (args: {
          data: { title: string; userId?: string | null }
        }) => Promise<{ id: string }>
      }
    }
  }
  const db = (await import('@/server/db')) as unknown as PrismaJ
  const user = userEmail
    ? await db.prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: { email: userEmail },
      })
    : null
  const j = await db.prisma.journey.create({ data: { title, userId: user?.id } })
  return NextResponse.json({ ok: true, journey: j })
}

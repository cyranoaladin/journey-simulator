import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getJourneyProgress,
  createOrUpdateJourneyProgress,
  getUserProgressByPersona,
} from '@/server/journeyService'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const personaId = searchParams.get('personaId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  if (personaId) {
    const progress = await getJourneyProgress(userId, personaId)
    return NextResponse.json({ ok: true, progress })
  }

  const allProgress = await getUserProgressByPersona(userId)
  return NextResponse.json({ ok: true, progress: allProgress })
}

const ProgressUpdate = z.object({
  userId: z.string(),
  personaId: z.string(),
  currentPhaseId: z.string().optional(),
  completedPhases: z.array(z.string()).optional(),
  progress: z.record(z.unknown()).optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = ProgressUpdate.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error }, { status: 400 })
  }

  const progress = await createOrUpdateJourneyProgress(parsed.data)
  return NextResponse.json({ ok: true, progress })
}

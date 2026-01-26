import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createMissionSubmission } from '@/server/missionService'
import { updateUserXPAndBalance } from '@/server/journeyService'

const SubmissionSchema = z.object({
  userId: z.string(),
  personaId: z.string(),
  phaseId: z.string(),
  missionData: z.record(z.unknown()),
  autoComplete: z.boolean().optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = SubmissionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error }, { status: 400 })
  }

  const { userId, personaId, phaseId, missionData, autoComplete } = parsed.data

  const submission = await createMissionSubmission({
    userId,
    personaId,
    phaseId,
    missionData,
    status: autoComplete ? 'completed' : 'pending',
    score: autoComplete ? 100 : undefined,
    feedback: autoComplete ? 'Auto-completed in demo mode' : undefined,
  })

  if (autoComplete) {
    await updateUserXPAndBalance(userId, 50, 5)
  }

  return NextResponse.json({ ok: true, submission })
}

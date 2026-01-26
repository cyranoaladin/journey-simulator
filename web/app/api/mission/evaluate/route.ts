import { NextResponse } from 'next/server'
import { z } from 'zod'
import { evaluateMission } from '@/server/missionService'
import { updateUserXPAndBalance } from '@/server/journeyService'

const EvaluationSchema = z.object({
  submissionId: z.string(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  status: z.enum(['completed', 'rejected']).optional(),
  xpReward: z.number().optional(),
  mfaiReward: z.number().optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = EvaluationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error }, { status: 400 })
  }

  const { submissionId, score, feedback, status, xpReward, mfaiReward } = parsed.data

  const submission = await evaluateMission(submissionId, score, feedback, status || 'completed')

  if (status === 'completed' && (xpReward || mfaiReward)) {
    const userId = (submission as { userId: string }).userId
    await updateUserXPAndBalance(userId, xpReward || 0, mfaiReward || 0)
  }

  return NextResponse.json({ ok: true, submission })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const submissionId = searchParams.get('submissionId')

  if (!submissionId) {
    return NextResponse.json({ error: 'submissionId required' }, { status: 400 })
  }

  const { prisma } = await import('@/server/db')
  const submission = await prisma.missionSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          walletAddress: true,
        },
      },
    },
  })

  if (!submission) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, submission })
}

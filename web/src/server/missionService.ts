import { prisma } from './db'

export interface MissionSubmissionData {
  userId: string
  personaId: string
  phaseId: string
  missionData: Record<string, unknown>
  status?: string
  score?: number
  feedback?: string
}

export async function createMissionSubmission(data: MissionSubmissionData) {
  return await prisma.missionSubmission.create({
    data: {
      userId: data.userId,
      personaId: data.personaId,
      phaseId: data.phaseId,
      missionData: JSON.parse(JSON.stringify(data.missionData)),
      status: data.status || 'pending',
      score: data.score,
      feedback: data.feedback,
    },
  })
}

export async function updateMissionSubmission(
  submissionId: string,
  updates: {
    status?: string
    score?: number
    feedback?: string
  }
) {
  return await prisma.missionSubmission.update({
    where: { id: submissionId },
    data: {
      status: updates.status,
      score: updates.score,
      feedback: updates.feedback,
      evaluatedAt: updates.status === 'completed' ? new Date() : undefined,
    },
  })
}

export async function getMissionSubmissionsByUser(userId: string) {
  return await prisma.missionSubmission.findMany({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
  })
}

export async function getMissionSubmissionsByPhase(personaId: string, phaseId: string) {
  return await prisma.missionSubmission.findMany({
    where: {
      personaId,
      phaseId,
    },
    orderBy: { submittedAt: 'desc' },
  })
}

export async function getPendingMissionSubmissions() {
  return await prisma.missionSubmission.findMany({
    where: {
      status: 'pending',
    },
    orderBy: { submittedAt: 'asc' },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })
}

export async function evaluateMission(
  submissionId: string,
  score: number,
  feedback: string,
  status: 'completed' | 'rejected' = 'completed'
) {
  return await prisma.missionSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      score,
      feedback,
      evaluatedAt: new Date(),
    },
  })
}

import { prisma } from './db'

export interface JourneyProgressData {
  userId: string
  personaId: string
  currentPhaseId?: string
  completedPhases?: string[]
  progress?: Record<string, unknown>
}

export async function getJourneyProgress(userId: string, personaId: string) {
  return await prisma.journeyProgress.findUnique({
    where: {
      userId_personaId: {
        userId,
        personaId,
      },
    },
  })
}

export async function createOrUpdateJourneyProgress(data: JourneyProgressData) {
  const { userId, personaId, currentPhaseId, completedPhases, progress } = data

  return await prisma.journeyProgress.upsert({
    where: {
      userId_personaId: {
        userId,
        personaId,
      },
    },
    update: {
      currentPhaseId,
      completedPhases: completedPhases ? JSON.parse(JSON.stringify(completedPhases)) : undefined,
      progress: progress ? JSON.parse(JSON.stringify(progress)) : undefined,
      updatedAt: new Date(),
    },
    create: {
      userId,
      personaId,
      currentPhaseId,
      completedPhases: JSON.parse(JSON.stringify(completedPhases || [])),
      progress: JSON.parse(JSON.stringify(progress || {})),
    },
  })
}

export async function getUserProgressByPersona(userId: string) {
  return await prisma.journeyProgress.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export async function updateUserXPAndBalance(userId: string, xpDelta: number, mfaiDelta: number) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpDelta },
      mfaiBalance: { increment: mfaiDelta },
    },
  })
}

export async function getUserByWalletAddress(walletAddress: string) {
  return await prisma.user.findUnique({
    where: { walletAddress },
  })
}

export async function createOrUpdateUser(data: {
  email: string
  name?: string
  walletAddress?: string
}) {
  return await prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      walletAddress: data.walletAddress,
    },
    create: {
      email: data.email,
      name: data.name,
      walletAddress: data.walletAddress,
    },
  })
}

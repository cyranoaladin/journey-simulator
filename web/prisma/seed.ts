/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding demo data...')

  // Demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@mfai.local' },
    update: {},
    create: { email: 'demo@mfai.local', name: 'Demo User', walletAddress: 'demo-wallet-address' } as any,
  })

  // Demo journeys (Projects)
  const j1 = await prisma.project.create({
    data: {
      name: 'Builder – Tokenomics',
      status: 'IN_PROGRESS',
      ownerId: user.id,
    },
  })
  const j2 = await prisma.project.create({
    data: {
      name: 'Experience – UX',
      status: 'DRAFT',
      ownerId: user.id,
    },
  })

  // Journey states
  await prisma.journeyState.upsert({
    where: { journeyId: j1.id },
    update: {
      last_state: { phase_id: 'learn', completed_missions: [], xp_delta: 5 },
      last_metadata: { persona_id: 'demo', journey_track: 'builder', language: 'fr' },
    },
    create: {
      journeyId: j1.id,
      last_state: { phase_id: 'learn', completed_missions: [], xp_delta: 5 },
      last_metadata: { persona_id: 'demo', journey_track: 'builder', language: 'fr' },
    },
  })

  await prisma.journeyState.upsert({
    where: { journeyId: j2.id },
    update: {
      last_state: { phase_id: 'build', completed_missions: ['m1'], xp_delta: 20 },
      last_metadata: { persona_id: 'demo', journey_track: 'experience', language: 'fr' },
    },
    create: {
      journeyId: j2.id,
      last_state: { phase_id: 'build', completed_missions: ['m1'], xp_delta: 20 },
      last_metadata: { persona_id: 'demo', journey_track: 'experience', language: 'fr' },
    },
  })

  // Agent logs
  const now = new Date()
  await prisma.agentLog.createMany({
    data: [
      {
        journeyId: j1.id,
        agent: 'Zyno',
        action: 'step',
        ts: new Date(now.getTime() - 60000),
        details: { phaseId: 'learn' },
      },
      {
        journeyId: j1.id,
        agent: 'Zyno',
        action: 'submit',
        ts: new Date(now.getTime() - 30000),
        details: { missionId: 'm1' },
      },
      {
        journeyId: j2.id,
        agent: 'Zyno',
        action: 'step',
        ts: new Date(now.getTime() - 20000),
        details: { phaseId: 'build' },
      },
    ],
  })

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

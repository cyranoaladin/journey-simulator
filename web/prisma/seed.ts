/**
 * Prisma seed script
 * Populates database with sample data for testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      walletAddress: 'ALiCe123456789ABCDEF',
      xp: 150,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
      walletAddress: 'BoB987654321FEDCBA',
      xp: 50,
    },
  })

  console.log(`✓ Created users: ${user1.id}, ${user2.id}`)

  // Create sample journeys
  const journey1 = await prisma.journey.create({
    data: {
      title: 'Learn Solana Basics',
      status: 'active',
      personaId: 'cognitive-activation-hub',
      userId: user1.id,
    },
  })

  const journey2 = await prisma.journey.create({
    data: {
      title: 'Build Your First DApp',
      status: 'in_progress',
      personaId: 'system-architect',
      userId: user1.id,
    },
  })

  console.log(`✓ Created journeys: ${journey1.id}, ${journey2.id}`)

  // Create sample achievements
  await prisma.achievement.create({
    data: {
      userId: user1.id,
      label: 'First Mission Complete',
      points: 10,
    },
  })

  await prisma.achievement.create({
    data: {
      userId: user2.id,
      label: 'Wallet Connected',
      points: 5,
    },
  })

  console.log('✓ Created achievements')

  // Create sample documents (for RAG)
  await prisma.doc.create({
    data: {
      title: 'What is Solana?',
      content: 'Solana is a blockchain network...',
      tags: 'solana,blockchain,learn',
    },
  })

  console.log('✓ Created documents')

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

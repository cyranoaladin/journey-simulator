/**
 * Test User Seed Script - PostgreSQL/Prisma
 * Seeds a test user for E2E tests
 */

const { PrismaClient } = require('@prisma/client');

const TEST_USER = {
  walletAddress: '5mT7JVxXxG3yN9ZqJKPqVqZ8YvXxC2M9K4wZ1vXxXxXx',
  email: 'test@mfai.app',
  name: 'Test User',
  role: 'FOUNDER',
};

async function seedTestUser() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/test_db?schema=public',
      },
    },
  });

  try {
    console.log('🔌 Connecting to PostgreSQL via Prisma...');
    
    // Check if user already exists by walletAddress or email
    const existingByWallet = await prisma.user.findUnique({
      where: { walletAddress: TEST_USER.walletAddress },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });

    if (existingByWallet || existingByEmail) {
      console.log(`✓ Test user already exists: ${TEST_USER.email} / ${TEST_USER.walletAddress}`);
      return;
    }

    // Create test user
    const user = await prisma.user.create({
      data: {
        walletAddress: TEST_USER.walletAddress,
        email: TEST_USER.email,
        name: TEST_USER.name,
        role: TEST_USER.role,
        reputationScore: 100,
        totalXP: 0,
        mfaiTokens: 1000,
        votingPower: 10,
      },
    });

    console.log(`✓ Test user seeded: ${user.email} (${user.id})`);
  } catch (error) {
    console.error('❌ Error seeding test user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestUser();

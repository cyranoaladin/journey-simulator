/**
 * Database Connection Test
 * Validates Prisma client and database accessibility
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testDatabaseConnection() {
  console.log('=========================================');
  console.log('Database Connection Test');
  console.log('=========================================\n');
  
  try {
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connected successfully\n');
    
    console.log('2. Testing User model access...');
    const userCount = await prisma.user.count();
    console.log(`✓ User model accessible (${userCount} users)\n`);
    
    console.log('3. Testing JourneyProgress model...');
    const progressCount = await prisma.journeyProgress.count();
    console.log(`✓ JourneyProgress accessible (${progressCount} records)\n`);
    
    console.log('4. Testing Project model...');
    const projectCount = await prisma.project.count();
    console.log(`✓ Project model accessible (${projectCount} projects)\n`);
    
    console.log('5. Testing Artifact model...');
    const artifactCount = await prisma.artifact.count();
    console.log(`✓ Artifact model accessible (${artifactCount} artifacts)\n`);
    
    console.log('=========================================');
    console.log('✅ Database Connection Test: PASSED');
    console.log('=========================================');
    
  } catch (error) {
    console.log('✗ Database connection failed:', error.message);
    console.log('\nPossible issues:');
    console.log('  - PostgreSQL server not running');
    console.log('  - Incorrect DATABASE_URL in .env');
    console.log('  - Database migrations not applied');
    console.log('\nCurrent DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();

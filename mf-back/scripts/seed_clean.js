/**
 * seed_clean.js
 * Resets the "Capital Foundry" persona to a clean state for Demo/Tests.
 * Enforces S2.2 Schema compliance.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting Clean Seed for Environment...');

    const DEMO_USER_ID = 'user-capital-foundry-demo';
    const PERSONA_ID = 'capital-foundry';

    try {
        // 1. Clean existing critical data for this user/persona
        console.log(`- Deleting progress for user: ${DEMO_USER_ID}`);

        // Delete Journey Progress
        await prisma.journeyProgress.deleteMany({
            where: { userId: DEMO_USER_ID, personaId: PERSONA_ID }
        });

        // Delete associated artifacts (Optional, if we want full wipe)
        // await prisma.artifact.deleteMany({ ... });

        // 2. Create/Ensure Demo User exists
        // Using upsert to be safe
        const user = await prisma.user.upsert({
            where: { walletAddress: 'demo-wallet-capital-foundry' },
            update: {},
            create: {
                id: DEMO_USER_ID,
                walletAddress: 'demo-wallet-capital-foundry',
                name: 'Demo Investor',
                role: 'INVESTOR',
                reputationScore: 100
            }
        });

        // 3. Seed Initial State (Starter)
        console.log('- Seeding Initial JourneyProgress...');
        await prisma.journeyProgress.create({
            data: {
                userId: user.id,
                personaId: PERSONA_ID,
                currentPhase: 0, // Start
                totalXP: 0,
                passLevel: 'STARTER',
                completedPhases: [],
                nfts: [],
                mfaiTokens: 100 // Welcome bonus
            }
        });

        console.log('✅ Seed Complete. Environment is Clean.');

    } catch (error) {
        console.error('❌ Seed Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

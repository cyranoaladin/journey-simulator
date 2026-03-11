/**
 * Audit de synchronisation DB - Vérification de la persistance Real Mode
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditDatabaseSync() {
  console.log('\n🔍 AUDIT DE SYNCHRONISATION DATABASE\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // 1. Vérifier les JourneyProgress existants
    console.log('📊 1. JOURNEY PROGRESS (Real Mode State)\n');
    const journeyCount = await prisma.journeyProgress.count();
    console.log(`   Total journeys: ${journeyCount}`);

    if (journeyCount > 0) {
      const recentJourneys = await prisma.journeyProgress.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          userId: true,
          personaId: true,
          currentPhase: true,
          completedPhases: true,
          totalXP: true,
          mfaiTokens: true,
          passLevel: true,
          updatedAt: true,
        },
      });

      console.log('\n   📌 Dernières progressions:');
      recentJourneys.forEach((j, i) => {
        console.log(`   ${i + 1}. Persona: ${j.personaId}`);
        console.log(`      User: ${j.userId.substring(0, 8)}...`);
        console.log(`      Phase: ${j.currentPhase} | Completed: ${j.completedPhases.join(', ')}`);
        console.log(`      XP: ${j.totalXP} | MFAI: ${j.mfaiTokens} | Pass: ${j.passLevel}`);
        console.log(`      Updated: ${j.updatedAt.toISOString()}`);
      });
    }

    // 2. Vérifier les AgentLogs
    console.log('\n\n📝 2. AGENT LOGS (Observability)\n');
    const logCount = await prisma.agentLog.count();
    console.log(`   Total logs: ${logCount}`);

    if (logCount > 0) {
      const recentLogs = await prisma.agentLog.findMany({
        take: 10,
        orderBy: { ts: 'desc' },
        select: {
          agent: true,
          action: true,
          journeyId: true,
          userId: true,
          latencyMs: true,
          status: true,
          ts: true,
        },
      });

      console.log('\n   📌 Derniers logs agents:');
      recentLogs.forEach((log, i) => {
        console.log(`   ${i + 1}. ${log.agent} → ${log.action}`);
        console.log(`      Journey: ${log.journeyId || 'N/A'} | User: ${log.userId?.substring(0, 8) || 'N/A'}`);
        console.log(`      Latency: ${log.latencyMs || 'N/A'}ms | Status: ${log.status}`);
        console.log(`      Time: ${log.ts.toISOString()}`);
      });
    }

    // 3. Vérifier les Artifacts
    console.log('\n\n📦 3. ARTIFACTS (Mission Deliverables)\n');
    const artifactCount = await prisma.artifact.count();
    console.log(`   Total artifacts: ${artifactCount}`);

    if (artifactCount > 0) {
      const recentArtifacts = await prisma.artifact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          title: true,
          type: true,
          userId: true,
          personaId: true,
          createdAt: true,
        },
      });

      console.log('\n   📌 Derniers artifacts:');
      recentArtifacts.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.title} (${a.artifactType})`);
        console.log(`      User: ${a.userId?.substring(0, 8) || 'N/A'} | Persona: ${a.personaId || 'N/A'}`);
        console.log(`      Created: ${a.createdAt.toISOString()}`);
      });
    }

    // 4. Analyser la distribution des personas
    console.log('\n\n📈 4. ANALYSE DISTRIBUTION PERSONAS\n');
    const personaStats = await prisma.journeyProgress.groupBy({
      by: ['personaId'],
      _count: { personaId: true },
      _avg: { totalXP: true },
      _sum: { mfaiTokens: true },
    });

    if (personaStats.length > 0) {
      console.log('   Persona                     | Journeys | Avg XP | Total MFAI');
      console.log('   ──────────────────────────────────────────────────────────────');
      personaStats.forEach((stat) => {
        const name = stat.personaId.padEnd(27);
        const count = String(stat._count.personaId).padStart(8);
        const avgXP = String(Math.round(stat._avg.totalXP || 0)).padStart(6);
        const totalMFAI = String(stat._sum.mfaiTokens || 0).padStart(10);
        console.log(`   ${name} | ${count} | ${avgXP} | ${totalMFAI}`);
      });
    }

    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('✅ AUDIT TERMINÉ\n');

    // Vérifier si Experience Studio est actif
    const experienceStudioCount = await prisma.journeyProgress.count({
      where: { personaId: 'experience-studio' },
    });

    if (experienceStudioCount === 0) {
      console.log('⚠️  AVERTISSEMENT: Aucun parcours "experience-studio" trouvé');
      console.log('   → Ce parcours NFT prioritaire n\'a pas encore été démarré\n');
    } else {
      console.log(`✅ Experience Studio: ${experienceStudioCount} journey(s) actif(s)\n`);
    }

  } catch (error) {
    console.error('\n❌ ERREUR AUDIT:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

auditDatabaseSync()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

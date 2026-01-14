#!/usr/bin/env node
/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */


const { orchestrateZyno } = require('./orchestration/zynoOrchestrator');
const { saveFeedback } = require('./memory/agent_metrics');

async function main() {
  const [, , agentArg = 'GuideAgent', ...promptParts] = process.argv;
  const agentName = agentArg;
  const prompt = promptParts.join(' ') || 'simulate onboarding experience';

  const user = { id: 'cli-user', name: 'CLI Runner' };
  const missionId = `mission-${Date.now()}`;

  const orchestrationResult = await orchestrateZyno(prompt, {
    user,
    userId: user.id,
    journey: { id: 'cli-journey', missionId },
    missionId,
    phase: 'Activate',
    input: prompt
  });

  const executedResults = orchestrationResult.results || {};
  const selectedAgentResult = executedResults[agentName] || Object.values(executedResults)[0] || {};
  const aepoScore = selectedAgentResult.metrics?.aepo ?? null;

  await saveFeedback({
    agent: agentName,
    userId: user.id,
    missionId,
    aepoScore,
    aecoFeedback: {
      clarity: 4,
      helpfulness: 4,
      satisfaction: 4,
      comment: `Auto-feedback for ${agentName} responding to "${prompt}".`
    }
  });

  console.log('Agent execution complete');
}

main().catch((error) => {
  console.error('Agent execution failed:', error);
  process.exit(1);
});

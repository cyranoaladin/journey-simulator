/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

process.env.LLM_MODEL_NAME = 'gpt-4o';
require('dotenv').config({ path: '../.env' });
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
const agentMemory = require('../memory/agent_memory');

async function setMemory() {
    console.log('[SET] Starting Session 1...');

    // 1. Reset Memory for clean slate
    agentMemory.reset();

    // 2. Interaction: Define a Key Fact
    // User says: "Le nom du projet est 'SkyNet_Protocol' et le token est $SKY."
    const userId = 'user-persistence-test';
    const input = "Le nom du projet est 'SkyNet_Protocol' et le token est $SKY.";

    console.log(`[SET] User Input: "${input}"`);

    const result = await orchestrateZyno(input, {
        userId: userId,
        phase: 'Build',
        mode: 'builder'
    });

    console.log(`[SET] Agent Response Summary: ${result.currentStep?.summary}`);
    console.log('[SET] Session 1 Complete. Data should be persisted to disk.');
}

setMemory();

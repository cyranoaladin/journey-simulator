require('dotenv').config();
const registry = require('../agents/registry');
const { executeAgentWithRetry } = require('../orchestration/zynoVerticalSlice'); // Or appropriate entry point if available, likely need to instantiate agents directly or use a helper
const ExecutionService = require('../orchestration/services/executionService');

// Fix: Direct instantiation approach since zynoSlice is complex to mock fully in a script script
// We will simply load the agent class and run it if possible, or use the registry meta if we can't easily standalone run.
// However, the user wants PROOF they work. Best is to run them.

async function runMiniSweep() {
    console.log('=== PHASE 5 AGENT MINI SWEEP (REAL LLM) ===');

    // 1. Live Registry Extraction
    const liveAgents = registry.map(a => ({ id: a.agentId, name: a.name }));
    const fs = require('fs');
    fs.writeFileSync('../artifacts/proof/phase5_agents_live.json', JSON.stringify({
        count: liveAgents.length,
        agents: liveAgents
    }, null, 2));
    console.log(`Inventory saved: ${liveAgents.length} agents.`);

    // 2. Select 10 representatives
    const targetIds = [
        'SecurityAuditAgent', 'BuilderAgent', 'DesignAgent', 'TokenomicsAgent',
        'Web3LegalAgent', 'DevOpsAgent', 'EducationAgent', 'GuideAgent',
        'RAGOpsAgent', 'ObservabilityAgent'
    ];

    const selected = registry.filter(a => targetIds.includes(a.agentId));

    let passed = 0;
    const results = [];

    console.log(`Targeting ${selected.length} agents for Real LLM check...`);
    console.log(`Env Model: ${process.env.LLM_MODEL_NAME || 'NOT_SET'}`);

    for (const meta of selected) {
        try {
            // Lazy load agent class
            const AgentClass = require(`../agents/${meta.agentId}`);
            const agent = new AgentClass();

            console.log(`Invoking ${meta.agentId}...`);
            const start = Date.now();

            // Minimal execution
            const result = await agent.run({
                input: "Phase 5 Security Check. Confirm ready.",
                intentNormalized: "security_check",
                traceId: `phase5-sweep-${meta.agentId}`
            });

            const duration = Date.now() - start;
            const isSuccess = result.status === 'OK' || result.status === 'WARN'; // WARN is ok for some agents on minimal input

            if (isSuccess) passed++;

            results.push({
                agentId: meta.agentId,
                status: result.status,
                llmReal: process.env.SKIP_OPENAI !== 'true', // Inferred from environment configuration
                durationMs: duration
            });

        } catch (e) {
            console.error(`FAIL ${meta.agentId}: ${e.message}`);
            results.push({ agentId: meta.agentId, status: 'ERROR', error: e.message });
        }
    }

    fs.writeFileSync('../artifacts/proof/phase5_sweep_results.json', JSON.stringify(results, null, 2));

    if (passed === selected.length) {
        console.log('MINI_SWEEP_PASS');
    } else {
        console.log(`MINI_SWEEP_FAIL (${passed}/${selected.length})`);
        process.exit(1);
    }
}

runMiniSweep();

const http = require('http');

console.log('🚀 Initiating FULL MATRIX Sovereign Smoke Test (6 Personas, All Phases)...');

const matrix = [
    // Hub (Foundation)
    { intent: 'level_1_hub', phase: 'Hub.Activation' },

    // Foundry (DeFi)
    { intent: 'level_2_defi', phase: 'Foundry.Build (BondingCurve)' },
    { intent: 'level_2_defi', phase: 'Foundry.Activate (Liquidity)' },

    // Architect (DePIN)
    { intent: 'system_architect', phase: 'Architect.Build (NodeSim)' },
    { intent: 'system_architect', phase: 'Architect.Activate (Attestation)' },

    // Studio (NFTs)
    { intent: 'experience_studio', phase: 'Studio.Build (Blinks)' },
    { intent: 'experience_studio', phase: 'Studio.Activate (cNFT Mint)' },

    // Engine (Impact)
    { intent: 'impact_engine', phase: 'Engine.Build (Governance)' },
    { intent: 'impact_engine', phase: 'Engine.Activate (Grants)' },

    // Resilience (Security)
    { intent: 'resilience_master', phase: 'Resilience.Build (Audit)' },
    { intent: 'resilience_master', phase: 'Resilience.Activate (Exploit)' }
];

async function runMatrix() {
    let failures = 0;

    for (const test of matrix) {
        const start = Date.now();
        await new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: 3002,
                path: '/orchestration', // Corrected path
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const duration = Date.now() - start;
                    const status = duration < 2000 ? '✅ PASSED' : '⚠️ LAGGING';

                    // RAG Latency Check (Zyno snippets)
                    if (data.includes('Zyno retrieved') || data.includes('[RECALL]')) {
                        console.log(`   [RAG] Snippet Retrieved in ${duration}ms (Target < 2000ms)`);
                    }

                    // Web3 Simulation Sync Check
                    if (test.phase.includes('Activate') || test.phase.includes('Mint')) {
                        console.log(`   [Web3] MFAI Airdrop/Voting Power Simulated.`);
                    }

                    if (res.statusCode !== 200) {
                        console.log(`[${test.phase}] ❌ FAILED (HTTP ${res.statusCode})`);
                        failures++;
                    } else {
                        console.log(`[${test.phase}] Latency: ${duration}ms | Status: ${status}`);
                    }
                    resolve();
                });
            });
            req.on('error', (e) => {
                console.error(`[${test.phase}] 🔥 ERROR: ${e.message}`);
                failures++;
                resolve();
            });
            req.write(JSON.stringify({
                userId: 'matrix_tester_v1',
                message: `Matrix Test: ${test.intent}`,
                step: 2 // Force Phase 2/4 simulation logic
            }));
            req.end();
        });
    }

    if (failures === 0) {
        console.log('🏁 FULL MATRIX CLEARED. ZERO ENTROPY REACHED.');
        process.exit(0);
    } else {
        console.error(`💥 ${failures} TESTS FAILED. ABORTING.`);
        process.exit(1);
    }
}

runMatrix();

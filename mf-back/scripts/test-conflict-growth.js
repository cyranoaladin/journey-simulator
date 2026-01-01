process.env.LLM_MODEL_NAME = 'gpt-4o';
require('dotenv').config({ path: '../.env' });
const GrowthAgent = require('../agents/GrowthAgent');

async function runConflictTest() {
    console.log('--- STARTING CONFLICT TEST: Extreme Growth Scenario ---');

    const agent = new GrowthAgent();

    // Scenario: 50k Supply, 0 Budget, 24h Sellout
    const input = 'Objectif : Sold out 50 000 NFTs en 24h. Budget marketing : 0$ (Organic only). Prix unitaire : 1 SOL.';
    const projectSpecs = {
        nft_collection: {
            supply: 50000,
            price: "1 SOL",
            utility: ["PFP"]
        }
    };

    console.log(`Input: "${input}"`);

    try {
        const response = await agent.run({
            traceId: 'conflict-test-001',
            input: input,
            context: {
                journey: { phaseId: 'growth' },
                orchestrationMode: 'AECO',
                projectSpecs: projectSpecs
            }
        });

        console.log('\n--- RAW OUTPUT START ---');
        console.log(JSON.stringify(response, null, 2));
        console.log('--- RAW OUTPUT END ---\n');

        const summary = response.summary || "";
        const status = response.status || "";

        // Check behavior
        if (status === 'ERROR' || status === 'RISK' || summary.includes('UNREALISTIC') || summary.includes('IMPOSSIBLE')) {
            console.log('✅ PASS: Agent refused the hallucination.');
            if (response.details && Object.keys(response.details).length > 0) {
                console.log('ℹ️  Details provided. Checking for "Realism Matrix" or similar analysis...');
                // We can manually inspect logic here or just rely on output
            }
        } else {
            console.error('❌ FAIL: Agent accepted the impossible task.');
        }

    } catch (error) {
        console.error('❌ Execution Failed:', error);
    }
}

runConflictTest();

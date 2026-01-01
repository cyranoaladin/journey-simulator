process.env.LLM_MODEL_NAME = 'gpt-4o';
require('dotenv').config({ path: '../.env' });
const NFTAgent = require('../agents/NFTAgent');
const GrowthAgent = require('../agents/GrowthAgent');

async function runChainOfTruth() {
    console.log('--- STARTING CHAIN OF TRUTH TEST: NFT -> Growth ---');

    // STEP 1: NFT AGENT (The Source of Truth)
    console.log('\n[1] Executing NFTAgent to define collection...');
    const nftAgent = new NFTAgent();

    const nftInput = 'Conçois une collection de 10 000 NFTs à un prix de 5 SOL. Le thème est "Cyber-Samurai".';

    const nftResponse = await nftAgent.run({
        traceId: 'chain-test-nft',
        input: nftInput,
        context: { journey: { phaseId: 'design' }, orchestrationMode: 'AECO' }
    });

    const nftStrategy = nftResponse.details;
    if (!nftStrategy || !nftStrategy.supply) {
        console.error('❌ NFTAgent failed to produce structured data.');
        process.exit(1);
    }

    console.log('✅ NFT Specs Generated:', JSON.stringify(nftStrategy, null, 2));


    // STEP 2: GROWTH AGENT (The Consumer)
    console.log('\n[2] Executing GrowthAgent with INHERITED CONTEXT...');
    const growthAgent = new GrowthAgent();

    const growthInput = 'Budget marketing total : 1000$ USD. Objectif : Sold out en 24h. Est-ce réaliste ?';

    // SIMULATING ORCHESTRATOR PASSING CONTEXT
    const contextData = {
        projectSpecs: {
            nft_collection: nftStrategy,
            market_assumptions: { sol_price_usd: 150 } // Injecting market data for logic check
        },
        journey: { phaseId: 'growth' },
        orchestrationMode: 'AECO'
    };

    const growthResponse = await growthAgent.run({
        traceId: 'chain-test-growth',
        input: growthInput,
        context: contextData
    });

    console.log('\n[3] GrowthAgent Analysis:');
    console.log('Summary:', growthResponse.summary);
    console.log('Details:', JSON.stringify(growthResponse.details, null, 2));

    // LOGIC CHECK
    const summaryLower = growthResponse.summary.toLowerCase();
    const successfulDetection = summaryLower.includes('impossible') || summaryLower.includes('unrealistic') || summaryLower.includes('not realistic') || summaryLower.includes('irréalisable');

    if (successfulDetection) {
        console.log('\n✅ TEST PASSED: GrowthAgent correctly identified the budget discrepancy (Chain of Truth respected).');
    } else {
        console.log('\n❌ TEST FAILED: GrowthAgent did not explicitly flag the budget issue as a blocker or impossibility.');
        console.log('Agent Output might be too soft. Check logs.');
    }
}

runChainOfTruth();

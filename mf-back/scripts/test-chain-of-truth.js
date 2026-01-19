/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

process.env.LLM_MODEL_NAME = 'gpt-4o';
require('dotenv').config({ path: '../.env' });
const NFTAgent = require('../agents/NFTAgent');
const GrowthAgent = require('../agents/GrowthAgent');

async function runChainOfTruth() {
    console.log('--- STARTING CHAIN OF TRUTH TEST: NFT -> Growth ---');

    // STEP 1: NFT AGENT (The Source of Truth)
    console.log('\n[1] Executing NFTAgent to define collection...');
    const nftAgent = new NFTAgent();

    const nftInput = 'Design a collection of 10,000 NFTs at a price of 5 SOL. The theme is "Cyber-Samurai".';

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

    const growthInput = 'Total marketing budget: $1000 USD. Goal: Sold out in 24h. Is this realistic?';

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
    const successfulDetection = summaryLower.includes('impossible') || summaryLower.includes('unrealistic') || summaryLower.includes('not realistic');

    if (successfulDetection) {
        console.log('\n✅ TEST PASSED: GrowthAgent correctly identified the budget discrepancy (Chain of Truth respected).');
    } else {
        console.log('\n❌ TEST FAILED: GrowthAgent did not explicitly flag the budget issue as a blocker or impossibility.');
        console.log('Agent Output might be too soft. Check logs.');
    }
}

runChainOfTruth();

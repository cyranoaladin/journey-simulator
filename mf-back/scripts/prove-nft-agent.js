/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

process.env.LLM_MODEL_NAME = 'gpt-4o'; // Enforce standard model
require('dotenv').config({ path: '../.env' });
const NFTAgent = require('../agents/NFTAgent');

async function runTest() {
    console.log('--- STARTING STRENGTH TEST: NFTAgent ---');

    const agent = new NFTAgent();
    const input = 'Design a collection of 5555 NFTs for a DePIN project on Solana, including trait structure and mint strategy on Candy Machine v3.';

    console.log(`Input: "${input}"`);

    try {
        const response = await agent.run({
            traceId: 'strength-test-001',
            input: input,
            context: {
                journey: { phaseId: 'design' },
                orchestrationMode: 'AEPO' // Individual mode for pure strength test
            }
        });

        console.log('\n--- RAW OUTPUT START ---');
        console.log(JSON.stringify(response, null, 2));
        console.log('--- RAW OUTPUT END ---\n');

        console.log('--- VERIFICATION ---');
        if (response.resources.diagram) console.log('✅ Mermaid Diagram Present');
        else console.error('❌ Missing Mermaid Diagram');

        if (response.resources.data) console.log('✅ Data JSON Present');
        else console.error('❌ Missing Data JSON');

        if (response.resources.documentation) console.log('✅ Markdown Documentation Present');
        else console.error('❌ Missing Markdown Documentation');

    } catch (error) {
        console.error('❌ Execution Failed:', error);
    }
}

runTest();

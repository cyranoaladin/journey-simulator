/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const TokenomicsAgent = require('../agents/TokenomicsAgent');

async function verifyTokenomics() {
    console.log("🔍 Verifying TokenomicsAgent...");
    const agent = new TokenomicsAgent();

    // Simulate input regarding a inflationary gaming token
    const input = "I am building a Play-to-Earn game. I want an inflationary token with a burn mechanism on marketplace transactions. 1 Billion supply.";

    const result = await agent.run({
        traceId: 'verify-tokenomics-1',
        input: input,
        context: {
            journey: { phaseId: 'design_tokenomics' }
        },
        rag: {
            chunks: [
                { id: 'doc1', title: 'Token Engineering 101', text: 'Inflationary models require sinks to offset emission. Marketplace fees are a common sink.', source: 'internal' }
            ]
        }
    });

    console.log("\n--- AGENT RESULT ---");
    console.log("Status:", result.status);
    console.log("Summary:", result.summary);
    if (result.details && typeof result.details === 'object') {
        console.log("Details (Model):", JSON.stringify(result.details, null, 2));
    } else {
        console.log("Details:", result.details);
    }

    // Validation
    const isMock = result.mock;
    const isRealLogic = !isMock && result.details && (typeof result.details === 'object' || result.details.length > 100);

    if (isRealLogic) {
        console.log("\n✅ SUCCESS: Agent produced REAL analysis (Not Mock).");
    } else {
        console.log("\n❌ FAILURE: Agent output looks hardcoded or empty.");
        process.exit(1);
    }
}

verifyTokenomics().catch(err => {
    console.error(err);
    process.exit(1);
});

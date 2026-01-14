/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */


const TokenomicsAgent = require('../mf-back/agents/TokenomicsAgent');

(async () => {
    console.log('Starting Tokenomics Resilience Audit...');
    const agent = new TokenomicsAgent();

    // 1. Negative Supply
    console.log('Test 1: Negative Supply Input');
    try {
        const res = await agent.run({
            traceId: 'audit-neg',
            input: 'Market Cap $10M, Supply of -100 tokens', // Regex should extract -100
            context: {}
        });

        // The implementation extracts numbers. "-100" might be parsed as 100 or -100 depending on regex.
        // Regex: /[^0-9.,-\s]/g remove chars. 
        // If it parses -100:
        // impliedPrice = 10M / -100 = -100000.
        // aberrationDetected shoud be true.

        if (res.status === 'ERROR') {
            console.log(`[PASS] Negative supply triggered structured ERROR: ${res.summary}`);
        } else {
            console.log(`[FAIL] Expected ERROR, got ${res.status}. Summary: ${res.summary}`);
            process.exit(1);
        }
    } catch (e) {
        console.error(`[FAIL] Agent CRASHED on negative supply: ${e.message}`);
        process.exit(1);
    }

    // 2. Massive Supply (1e18) -> Price < 1e-6
    console.log('Test 2: Massive Supply (Dust Price)');
    try {
        const res = await agent.run({
            traceId: 'audit-massive',
            input: 'Market Cap $1000, Supply of 1000000000000000000 tokens',
            context: {}
        });

        // Price = 1000 / 1e18 = 1e-15.
        // aberrationDetected should be true (impliedPrice < 1e-6).

        if (res.status === 'ERROR') {
            console.log(`[PASS] Massive supply triggered structured ERROR: ${res.summary}`);
        } else {
            console.log(`[FAIL] Expected ERROR, got ${res.status}. Summary: ${res.summary}`);
            // If it returns OK, it means it didn't trigger the check.
            // Maybe regex failed to parse the big number?
            // "1000000000000000000" matches regex.
            process.exit(1);
        }
    } catch (e) {
        console.error(`[FAIL] Agent CRASHED on massive supply: ${e.message}`);
        process.exit(1);
    }

    console.log('✅ Math Resilience Audit: PASSED (Structured Exceptions Validated)');
})();

/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

process.env.LLM_MODEL_NAME = 'gpt-4o'; // Enforce high-capability model for math checks
require('dotenv').config({ path: '../.env' });
const TokenomicsAgent = require('../agents/TokenomicsAgent');

async function valdiateTokenomicsLogic() {
    console.log('--- STARTING VALIDATION: Tokenomics Logic (Sum Check) ---');

    const agent = new TokenomicsAgent();

    // Input specifically designed to fail the 100% sum check (Sum = 105%)
    const input = 'Design a token distribution: Team 20%, Investors 30%, Treasury 30%, Community 25%. Also calculate sell pressure assuming $10M FDV.';

    console.log(`Input: "${input}"`);

    try {
        const response = await agent.run({
            traceId: 'validation-test-001',
            input: input,
            context: {
                journey: { phaseId: 'certificate' },
                orchestrationMode: 'AEPO'
            }
        });

        console.log('\n--- RAW OUTPUT START ---');
        console.log(JSON.stringify(response, null, 2));
        console.log('--- RAW OUTPUT END ---\n');

        console.log('--- VERIFICATION ---');

        // Check Status
        if (response.summary && response.summary.includes('TOTAL_ALLOCATION_MISMATCH')) {
            console.log('✅ ERROR DETECTED: Agent correctly identified the 105% allocation sum.');
        } else {
            console.error('❌ FAILURE: Agent did NOT report mismatch or report invalid status.');
        }

        // Check Sell Pressure Field (even if error, checking if the schema key exists in "token_model" if partial result returned)
        // Note: If it errors out completely, token_model might be empty or missing. 
        // If the agent is smart, it might return the error and NOT the model.
        // Use heuristic: Check if 'sell_pressure_at_cliff' is present in output text or details if valid.

        if (response.details && response.details.sell_pressure_at_cliff) {
            console.log('✅ Sell Pressure Logic found (in details).');
        } else if (response.status === 'ERROR') {
            console.log('ℹ️ Sell Pressure skipped due to Fatal Error (Expected behavior).');
        }

    } catch (error) {
        console.error('❌ Execution Failed:', error);
    }
}

valdiateTokenomicsLogic();

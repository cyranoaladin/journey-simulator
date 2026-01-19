/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */


const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEMORY_FILE = path.resolve(__dirname, '../mf-back/memory/agent_memory.json');

function getHistoryLength() {
    if (!fs.existsSync(MEMORY_FILE)) return 0;
    const content = fs.readFileSync(MEMORY_FILE, 'utf8');
    const json = JSON.parse(content || '{}');
    // Sum history length of all users? Or specific user 'cli-user'?
    // run_agent.js uses 'cli-user'.
    const userMem = json['cli-user'];
    return userMem && userMem.history ? userMem.history.length : 0;
}

function runAudit() {
    console.log('Auditing Agent Memory Growth...');

    // 1. Initial State
    const initialLen = getHistoryLength();
    console.log(`Initial History Length (cli-user): ${initialLen}`);

    // 2. Trigger Interaction
    console.log('Running agent interaction...');
    try {
        execSync('node mf-back/run_agent.js "EvaluationAgent" "assess memory growth"', {
            cwd: path.resolve(__dirname, '..'),
            stdio: 'inherit'
        });
    } catch (e) {
        console.error('Agent execution failed, cannot audit memory.');
        process.exit(1);
    }

    // 3. Final State
    const finalLen = getHistoryLength();
    console.log(`Final History Length (cli-user): ${finalLen}`);

    // 4. Assertion
    if (finalLen > initialLen) {
        console.log('[SUCCESS] Memory grew as expected.');
        process.exit(0);
    } else {
        console.error('[FAILURE] Memory did NOT grow.');
        process.exit(1);
    }
}

runAudit();

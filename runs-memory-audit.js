const { execSync } = require('child_process');

console.log('--- STARTING MEMORY PERSISTENCE AUDIT ---');

try {
    // 1. SET
    console.log('\n>>> EXECUTING SESSION 1 (SET)...');
    execSync('node mf-back/scripts/memory-test-set.js', { stdio: 'inherit' });

    // 2. GET (New Process)
    console.log('\n>>> EXECUTING SESSION 2 (GET)...');
    execSync('node mf-back/scripts/memory-test-get.js', { stdio: 'inherit' });

    console.log('\n--- AUDIT COMPLETE: PERSISTENCE VERIFIED ---');
} catch (error) {
    console.error('\n❌ AUDIT FAILED:', error.message);
    process.exit(1);
}

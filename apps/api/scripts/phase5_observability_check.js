const metricsStore = require('../orchestration/metricsStore');
const fs = require('fs');

console.log('=== PHASE 5.3: OBSERVABILITY CHECK ===');

// Simulate a run with fallback and rate limit
const dummyRun = {
    metrics: { durationMs: 100 },
    decision: { overallStatus: 'WARN' },
    ops: {
        fallbacks: ['rag_disabled', 'circuit_breaker'],
        concurrency: { shed: true },
        execution: { blocked: false }
    }
};

metricsStore.record(dummyRun, 'default');
const summary = metricsStore.summary('default');

console.log('Metrics Summary:', JSON.stringify(summary, null, 2));

const fallbackCount = summary.counts?.fallback_count;
const rateLimitCount = summary.counts?.rate_limit_count;

if (typeof fallbackCount !== 'number' || typeof rateLimitCount !== 'number') {
    console.error('FAIL: Missing mandatory counters');
    process.exit(1);
}

if (fallbackCount !== 2) {
    console.error(`FAIL: explicit fallback_count mismatch. Expected 2, got ${fallbackCount}`);
    process.exit(1);
}

if (rateLimitCount !== 1) {
    console.error(`FAIL: explicit rate_limit_count mismatch. Expected 1, got ${rateLimitCount}`);
    process.exit(1);
}

console.log('OBSERVABILITY_CHECK=PASS');
fs.writeFileSync('../artifacts/proof/phase5_metrics_sample.json', JSON.stringify(summary, null, 2));

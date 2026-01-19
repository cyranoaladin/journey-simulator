#!/usr/bin/env node
/**
 * Parse Playwright JSON report and extract test counts
 * Usage: node parse_playwright_json_counts.js <json_file>
 */

const fs = require('fs');
const path = require('path');

const jsonFile = process.argv[2];

if (!jsonFile) {
    console.error('Usage: node parse_playwright_json_counts.js <json_file>');
    process.exit(1);
}

try {
    const content = fs.readFileSync(jsonFile, 'utf8');
    const report = JSON.parse(content);

    if (report.stats) {
        console.log('=== Playwright Test Counts (Auto-Parsed) ===');
        console.log(`    "expected": ${report.stats.expected},`);
        console.log(`    "skipped": ${report.stats.skipped},`);
        console.log(`    "unexpected": ${report.stats.unexpected},`);
        console.log(`    "flaky": ${report.stats.flaky || 0}`);

        // Check for timeout/interrupted
        const timedOut = report.stats.timedOut || 0;
        const interrupted = report.stats.interrupted || 0;

        if (timedOut > 0) console.log(`    "timedOut": ${timedOut}`);
        if (interrupted > 0) console.log(`    "interrupted": ${interrupted}`);

        console.log('');
        console.log('VERDICT:');
        if (report.stats.unexpected === 0 && report.stats.skipped === 0 &&
            report.stats.flaky === 0 && timedOut === 0 && interrupted === 0) {
            console.log('✅ ALL TESTS PASSED (zero unexpected, zero skipped, zero flaky, zero timeout)');
        } else {
            console.log('⚠️ ISSUES DETECTED:');
            if (report.stats.unexpected > 0) console.log(`  - unexpected (failures): ${report.stats.unexpected}`);
            if (report.stats.skipped > 0) console.log(`  - skipped: ${report.stats.skipped}`);
            if (report.stats.flaky > 0) console.log(`  - flaky: ${report.stats.flaky}`);
            if (timedOut > 0) console.log(`  - timedOut: ${timedOut}`);
            if (interrupted > 0) console.log(`  - interrupted: ${interrupted}`);
        }
    } else {
        console.error('ERROR: No stats object found in JSON report');
        process.exit(1);
    }
} catch (error) {
    console.error(`ERROR parsing JSON: ${error.message}`);
    process.exit(1);
}

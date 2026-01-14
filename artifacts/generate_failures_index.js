#!/usr/bin/env node
/**
 * Generate Failures Index from Playwright JSON Report
 * Categorizes failures into 4 buckets as per R1.3 Audit
 */

const fs = require('fs');
const jsonFile = process.argv[2];

if (!jsonFile) {
    console.error('Usage: node generate_failures_index.js <json_file>');
    process.exit(1);
}

try {
    const report = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const failures = [];

    function traverse(suite) {
        if (suite.suites) suite.suites.forEach(traverse);
        if (suite.specs) {
            suite.specs.forEach(spec => {
                spec.tests.forEach(test => {
                    test.results.forEach((res, index) => {
                        if (res.status === 'failed' || res.status === 'timedOut' || res.status === 'interrupted' || (test.status === 'unexpected' && res.status !== 'passed' && res.status !== 'skipped')) {
                            const errorMsg = res.error ? (res.error.message || res.error.value || 'No error message') : 'Unknown error';
                            const stack = res.error ? (res.error.stack || '') : '';
                            failures.push({
                                spec: spec.title,
                                file: spec.file,
                                project: test.projectName,
                                errorType: res.status,
                                message: errorMsg,
                                stack: stack,
                                fullTitle: `${spec.title} > ${test.title}` // Approximate
                            });
                        }
                    });
                });
            });
        }
    }

    if (report.suites) {
        report.suites.forEach(traverse);
    }

    // Bucketing Logic
    const buckets = {
        'Console/Font/Network': [], // Google Fonts, NS_ERROR, 500, etc
        'Timeout/Navigation': [],   // Timeout 30000ms, Timed out
        'DOM/Layout': [],           // element not visible, click intercepted
        'Data/Store': [],           // Auth, Token, invalid data
        'Other': []
    };

    failures.forEach(f => {
        const m = (f.message + f.stack).toLowerCase();
        if (m.includes('font') || m.includes('ns_error') || m.includes('connection refused') || m.includes('console.')) {
            buckets['Console/Font/Network'].push(f);
        } else if (m.includes('timeout') || m.includes('timed out')) {
            buckets['Timeout/Navigation'].push(f);
        } else if (m.includes('visible') || m.includes('attached') || m.includes('intercepted') || m.includes('target closed') || m.includes('detached')) {
            buckets['DOM/Layout'].push(f);
        } else if (m.includes('auth') || m.includes('token') || m.includes('store') || m.includes('match') || m.includes('expect(')) {
            // assertions often fall here, treat as Data mismatch by default if not layout
            buckets['Data/Store'].push(f);
        } else {
            buckets['Other'].push(f);
        }
    });

    // Generate Markdown
    console.log('# Failures Index (Auto-Generated)\n');
    Object.keys(buckets).forEach(cat => {
        const items = buckets[cat];
        if (items.length > 0) {
            console.log(`## ${cat} (${items.length})\n`);
            items.forEach((item, idx) => {
                console.log(`### ${idx + 1}. ${item.spec}`);
                console.log(`- **Project**: ${item.project}`);
                console.log(`- **File**: \`${item.file}\``);
                console.log(`- **Error**: \`${item.message.split('\n')[0].substring(0, 150)}\``);
                if (item.stack) {
                    const stackLines = item.stack.split('\n').slice(0, 5).join('\n');
                    console.log('```text\n' + stackLines + '\n```');
                }
                console.log('\n');
            });
        }
    });

    if (failures.length === 0) {
        console.log('✅ No Failures Found');
    } else {
        console.log(`\n**Total Failures:** ${failures.length}`);
    }

} catch (e) {
    console.error('Error generating failures index:', e);
    process.exit(1);
}

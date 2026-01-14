const fs = require('fs');

const logPath = 'artifacts/proof/lead15_full/e2e_console_full.log';
const content = fs.readFileSync(logPath, 'utf8');

// Regex to capture "Error: ..." or "Expected: ..." or test names associated with failures
// Playwright console reporter usually prints:
//   1) [browser] › file.spec.ts:line:col › test title
//     Error: ...
// or "x failed" at the end.

// Simpler approach: Look for "unexpected" blocks if we had the JSON, but we have a text log.
// We'll look for lines starting with "  1) " etc or "❌"/ "Start of failure" indicators if customized.
// Given the previous log output, standard Playwright text reporter was used (mixed with json reporter stdout?).
// Actually the previous tool output showed JSON at the end, but also standard text? 
// No, the user said "npx playwright test ... --reporter=json". 
// If ONLY json reporter was used, the console log IS just JSON.
// IF console log is just JSON, we can try to parse it again closer to the end.

// Let's try to find the MAIN JSON object again.
// It starts with `{` and ends with `}` and contains `"config":`.
// It is likely the last large JSON block.

function extractJSON() {
    const lines = content.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    // Search from end for the stats object which is near the end of the JSON report
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('"stats": {')) {
            // Found stats, now look backwards for the matching opening brace of the root object
            // This is heuristic.
            // Better: Look for top-level keys like "config", "suites", "errors".
        }
    }

    // Alternative: regex find the largest { ... } block? No, too slow/memory heavy.
    // Let's try to isolate the line that starts with `{` and looks like the report.
    // Or maybe the whole file IS the json if no other output? 
    // The logs showed "Starting Backend..." etc, so it's mixed.

    // Find line starting with { that contains "config"
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('{') && lines[i].includes('"config":')) {
            startIndex = i;
            break;
        }
    }

    if (startIndex !== -1) {
        // Assume it goes to the end or find the matching }
        // For now, let's take from startIndex to end and try to parse/clean.
        const potentialJson = lines.slice(startIndex).join('\n');
        try {
            return JSON.parse(potentialJson);
        } catch (e) {
            // Try formatting?
            // console.log("Direct parse failed, trying to find end");
        }
    }
    return null;
}

const report = extractJSON();
const failures = [];

if (report) {
    report.suites.forEach(project => {
        project.suites.forEach(fileSuite => {
            // Recursively find tests
            function processSuite(suite) {
                if (suite.tests) {
                    suite.tests.forEach(test => {
                        if (test.status === 'unexpected') {
                            failures.push({
                                file: fileSuite.file,
                                title: test.title,
                                project: project.title || fileSuite.title, // logic depends on structure
                                error: test.results.find(r => r.status === 'failed')?.error?.message || 'Unknown error'
                            });
                        }
                    });
                }
                if (suite.suites) {
                    suite.suites.forEach(processSuite);
                }
            }
            processSuite(fileSuite);
        });
    });
} else {
    // Fallback: Parsing text log for "Error:" patterns if JSON extraction fails
    // This is a stub for now.
    console.log("Could not extract JSON. Manual analysis required.");
}

// Generate Index
let md = '# Failures Index\n\n';
failures.forEach((f, i) => {
    md += `## ${i + 1}. ${f.title}\n`;
    md += `- **File**: \`${f.file}\`\n`;
    md += `- **Error**: \`${f.error.replace(/\n/g, ' ')}\`\n\n`;
});

fs.writeFileSync('artifacts/proof/lead15_full/failures_index.md', md);
fs.writeFileSync('artifacts/proof/lead15_full/failures_by_category.json', JSON.stringify(failures, null, 2));
console.log(`Generated index for ${failures.length} failures.`);

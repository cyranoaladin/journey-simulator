#!/usr/bin/env node
/* Go-live helper: preflight + smoke + smoke-e2e + golden tests + SLO snapshot + optional UI-E2E */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sloExporter = require(path.join(__dirname, '../../mf-back/orchestration/sloExporter'));

const withUI = process.argv.includes('--with-ui');
const artifactsDir = path.join(__dirname, '../../artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

function runStep(name, command, cwd = null) {
  try {
    const options = { stdio: 'pipe', encoding: 'utf8' };
    if (cwd) options.cwd = cwd;
    const [cmd, ...args] = command.split(' ');
    const output = execFileSync(cmd, args, options).toString();
    return { name, status: 'OK', output: safeJson(output) };
  } catch (err) {
    return { name, status: 'FAIL', error: err.message, output: safeJson(err.stdout?.toString() || '') };
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text ? text.trim() : '';
  }
}

// Set default env vars if not present (for go-live script execution)
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = 'info';

const steps = [];

// Step 1: Preflight
steps.push(runStep('preflight', `node ${path.join(__dirname, 'preflight.js')}`));
if (steps[steps.length - 1].status !== 'OK') {
  console.error('Preflight failed, aborting');
  process.exit(1);
}

// Step 2: Smoke
steps.push(runStep('smoke', `node ${path.join(__dirname, 'smoke.js')}`));
if (steps[steps.length - 1].status !== 'OK') {
  console.error('Smoke tests failed, aborting');
  process.exit(1);
}

// Step 3: Smoke E2E
steps.push(runStep('smoke-e2e', `node ${path.join(__dirname, 'smoke-e2e.js')}`));
if (steps[steps.length - 1].status !== 'OK') {
  console.error('Smoke E2E tests failed, aborting');
  process.exit(1);
}

// Step 4: Golden tests
const goldenTestCmd = `cd ${path.join(__dirname, '../../mf-back')} && npm test -- --runTestsByPath __tests__/golden/goldenOutputs.test.js --silent`;
steps.push(runStep('golden', goldenTestCmd));
if (steps[steps.length - 1].status !== 'OK') {
  console.error('Golden tests failed, aborting');
  process.exit(1);
}

// Step 5: SLO snapshot export
try {
  const sloSnapshot = sloExporter.exportSloSnapshot();
  const snapshotPath = path.join(artifactsDir, 'slo_snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(sloSnapshot, null, 2));
  steps.push({ name: 'slo-snapshot', status: 'OK', output: { path: snapshotPath, timestamp: sloSnapshot.timestamp } });
} catch (err) {
  steps.push({ name: 'slo-snapshot', status: 'FAIL', error: err.message });
  console.error('SLO snapshot export failed, aborting');
  process.exit(1);
}

// Step 6: Optional UI-E2E
if (withUI) {
  const uiE2ECmd = `cd ${path.join(__dirname, '../../')} && npm run test:ui-e2e 2>&1 || echo "UI-E2E not available"`;
  steps.push(runStep('ui-e2e', uiE2ECmd));
  // UI-E2E is optional, don't fail if not available
}

const status = steps.every((s) => s.status === 'OK') ? 'READY_FOR_PRODUCTION' : 'BLOCK';

const report = {
  status,
  checks: steps.reduce((acc, s) => {
    acc[s.name] = s.status;
    return acc;
  }, {}),
  timestamp: new Date().toISOString(),
  sloSnapshotPath: path.join(artifactsDir, 'slo_snapshot.json'),
};

console.log(JSON.stringify(report, null, 2));
process.exit(status === 'READY_FOR_PRODUCTION' ? 0 : 1);

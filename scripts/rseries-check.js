/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
/**
 * R-Series checks (R1/R2/R3) — Phase 1 gates
 * - R1: non-ASCII (non-English) scan on journey-simulator/src and mf-back/agents
 * - R2: Guide completeness (NFT Certificates, Staking, DAO Governance, Simulation Mode)
 * - R3: E2E mocks ratio (spec files using "mock" in tests/e2e)
 *
 * Outputs artifacts/rseries-check.json and exits non-zero on failure.
 */

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts');
const OUTPUT = path.join(ARTIFACTS_DIR, 'rseries-check.json');

const R1_PATHS = [
  path.join(ROOT, 'journey-simulator', 'src'),
  path.join(ROOT, 'mf-back', 'agents'),
];
const GUIDE_PAGE = path.join(ROOT, 'journey-simulator', 'src', 'pages', 'GuidePage.tsx');
const E2E_DIR = path.join(ROOT, 'journey-simulator', 'tests', 'e2e');

function isAscii(str) {
  return !/[^\x00-\x7F]/.test(str);
}

async function walkFiles(dir, filterExt = ['.ts', '.tsx', '.js', '.jsx']) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(full, filterExt));
    } else if (filterExt.includes(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

async function checkR1() {
  const matches = [];
  for (const base of R1_PATHS) {
    const files = await walkFiles(base);
    for (const file of files) {
      const content = await fsp.readFile(file, 'utf8');
      if (!isAscii(content)) {
        matches.push(file);
      }
    }
  }
  return {
    status: matches.length === 0 ? 'PASS' : 'FAIL',
    nonAsciiFiles: matches,
  };
}

async function checkR2() {
  const required = ['NFT Certificates', 'Staking', 'DAO Governance', 'Simulation Mode'];
  const present = {};
  const content = await fsp.readFile(GUIDE_PAGE, 'utf8');
  for (const key of required) {
    present[key] = content.includes(key);
  }
  const missing = Object.entries(present).filter(([, ok]) => !ok).map(([k]) => k);
  return {
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    missing,
    present,
  };
}

async function checkR3() {
  const specFiles = (await walkFiles(E2E_DIR, ['.ts', '.tsx'])).filter((f) => f.endsWith('.spec.ts') || f.endsWith('.spec.tsx'));
  let mockCount = 0;
  for (const file of specFiles) {
    const content = await fsp.readFile(file, 'utf8');
    if (content.toLowerCase().includes('mock')) mockCount += 1;
  }
  const ratio = specFiles.length === 0 ? 0 : mockCount / specFiles.length;
  return {
    status: ratio > 0.2 ? 'FAIL' : 'PASS',
    totalSpecs: specFiles.length,
    mockSpecs: mockCount,
    ratio,
  };
}

async function main() {
  await fsp.mkdir(ARTIFACTS_DIR, { recursive: true });
  const r1 = await checkR1();
  const r2 = await checkR2();
  const r3 = await checkR3();
  const result = { r1, r2, r3, timestamp: new Date().toISOString() };
  await fsp.writeFile(OUTPUT, JSON.stringify(result, null, 2));
  const failed = [r1, r2, r3].some((r) => r.status !== 'PASS');
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('[rseries-check] failed', err);
  process.exit(1);
});

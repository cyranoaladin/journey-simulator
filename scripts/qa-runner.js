/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
/**
 * QA Runner Attempt 8d (prod-like)
 * - Lit AUDIT.md et écrit audit_read_proof.log
 * - Seed user via modèle (pre-save hash) : test@mfai.app / MFAITest2026!
 * - Lance Playwright strict avec reporter JSON vers fichier déterministe
 * - Post-steps exécutés même en cas d'échec : counts, index des failures, routes, zero-byte, sha256, verdict
 */

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'proof', 'lead15_strict');
const JSON_REPORT = path.join(ARTIFACT_DIR, 'playwright_report_full_attempt8d.json');
const COUNTS_PATH = path.join(ARTIFACT_DIR, 'e2e_json_counts_attempt8d.txt');
const FAIL_INDEX_PATH = path.join(ARTIFACT_DIR, 'failures_index_attempt8d.md');
const ROUTES_PATH = path.join(ARTIFACT_DIR, 'routes_visited_attempt8d.txt');
const ROUTES_STATS_PATH = path.join(ARTIFACT_DIR, 'routes_visited_stats_attempt8d.txt');
const ZERO_BYTE_PATH = path.join(ARTIFACT_DIR, 'zero_byte_scan_attempt8d.txt');
const SHA_PATH = path.join(ARTIFACT_DIR, 'sha256_attempt8d.txt');
const VERDICT_PATH = path.join(ARTIFACT_DIR, 'verdict_attempt8d.txt');
const AUDIT_PROOF = path.join(ROOT, 'audit_read_proof.log');

const JSIM_DIR = path.join(ROOT, 'journey-simulator');
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_HOST ||
  'mongodb://mfai-mongo:27017/journey';
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3002';

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function markAuditRead() {
  try {
    const auditPath = path.join(ROOT, 'AUDIT.md');
    await fsp.readFile(auditPath, 'utf8');
    const stamp = `AUDIT_MD_READ=1 ${new Date().toISOString()}\n`;
    await fsp.writeFile(AUDIT_PROOF, stamp, { flag: 'w' });
  } catch (err) {
    await fsp.writeFile(AUDIT_PROOF, `AUDIT_MD_READ=0 ${err.message}\n`, { flag: 'w' });
  }
}

function runCmd(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: opts.stdio || 'inherit',
    cwd: opts.cwd || ROOT,
    env: { ...process.env, ...opts.env },
  });
  return res.status ?? 1;
}

async function seedUser() {
  return runCmd('npm', ['run', 'seed:test-user'], {
    env: { MONGO_URI },
  });
}

async function runPlaywright() {
  ensureDir(ARTIFACT_DIR);
  const args = [
    'run',
    'test:full-audit',
    '--',
    '--reporter=list,json',
    '--retries=0',
    '--forbid-only',
  ];
  return runCmd('npm', args, { cwd: JSIM_DIR, env: { PLAYWRIGHT_JSON_OUTPUT_NAME: JSON_REPORT } });
}

function parseCounts(jsonObj) {
  const stats = jsonObj?.stats || {};
  return {
    expected: stats.expected ?? 0,
    unexpected: stats.unexpected ?? 0,
    skipped: stats.skipped ?? 0,
    flaky: stats.flaky ?? 0,
    timedOut: stats.timedOut ?? 0,
    interrupted: stats.interrupted ?? 0,
  };
}

async function writeCounts(jsonObj) {
  const counts = parseCounts(jsonObj);
  const lines = Object.entries(counts).map(([k, v]) => `${k}=${v}`);
  await fsp.writeFile(COUNTS_PATH, lines.join('\n') + '\n', 'utf8');
}

function collectFailures(jsonObj) {
  const failures = [];
  const walkSuite = (suite, projectName) => {
    if (!suite) return;
    if (suite.suites) suite.suites.forEach((s) => walkSuite(s, projectName || suite.projectName || s.projectName));
    if (suite.tests) {
      suite.tests.forEach((t) => {
        const proj = t.projectName || projectName || 'unknown';
        const results = t.results || [];
        results.forEach((r) => {
          if (r.status && r.status !== 'passed') {
            failures.push({
              project: proj,
              title: t.titlePath ? t.titlePath.join(' > ') : t.title,
              location: t.location ? `${t.location.file}:${t.location.line}` : 'unknown',
              error: r.error ? (r.error.stack || r.error.message || JSON.stringify(r.error)) : 'unknown',
              status: r.status,
            });
          }
        });
      });
    }
  };
  (jsonObj.suites || []).forEach((s) => walkSuite(s, s.projectName));
  return failures;
}

async function writeFailureIndex(jsonObj) {
  const failures = collectFailures(jsonObj);
  let md = '# Failures Index Attempt 8d\n\n';
  if (!failures.length) {
    md += 'Aucune défaillance\n';
  } else {
    failures.forEach((f, idx) => {
      md += `## ${idx + 1}. ${f.title}\n`;
      md += `- project: ${f.project}\n`;
      md += `- location: ${f.location}\n`;
      md += `- status: ${f.status}\n`;
      md += `- error:\n\n\`\`\`\n${String(f.error).split('\n').slice(0, 20).join('\n')}\n\`\`\`\n\n`;
    });
  }
  await fsp.writeFile(FAIL_INDEX_PATH, md, 'utf8');
}

async function handleRoutes() {
  const candidates = [
    path.join(JSIM_DIR, 'test-results', 'routes_visited.txt'),
    path.join(JSIM_DIR, 'test-results', 'routes_visited_attempt8d.txt'),
  ];
  let found = false;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      const data = await fsp.readFile(c, 'utf8');
      if (data.trim()) {
        await fsp.writeFile(ROUTES_PATH, data, 'utf8');
        found = true;
        break;
      }
    }
  }
  if (!found) {
    await fsp.writeFile(ROUTES_PATH, 'ROUTE_VISIT: unavailable\n', 'utf8');
  }
  const content = await fsp.readFile(ROUTES_PATH, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim().startsWith('ROUTE_VISIT'));
  const unique = Array.from(new Set(lines));
  const stats = `events=${lines.length}\nunique=${unique.length}\n`;
  await fsp.writeFile(ROUTES_STATS_PATH, stats, 'utf8');
}

async function zeroByteScan() {
  const targets = [path.join(JSIM_DIR, 'test-results'), ARTIFACT_DIR];
  const zero = [];
  for (const base of targets) {
    if (!fs.existsSync(base)) continue;
    const stack = [base];
    while (stack.length) {
      const p = stack.pop();
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        fs.readdirSync(p).forEach((f) => stack.push(path.join(p, f)));
      } else if (st.size === 0) {
        zero.push(path.relative(ROOT, p));
      }
    }
  }
  if (zero.length === 0) {
    await fsp.writeFile(ZERO_BYTE_PATH, 'ZERO_BYTE_FILES_FOUND=0\n', 'utf8');
  } else {
    await fsp.writeFile(ZERO_BYTE_PATH, zero.join('\n') + '\n', 'utf8');
  }
}

async function writeSha() {
  const files = [JSON_REPORT, COUNTS_PATH, FAIL_INDEX_PATH, ROUTES_PATH, ROUTES_STATS_PATH, ZERO_BYTE_PATH];
  const lines = [];
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const buf = fs.readFileSync(f);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    lines.push(`${hash}  ${path.relative(ROOT, f)}`);
  }
  await fsp.writeFile(SHA_PATH, lines.join('\n') + '\n', 'utf8');
}

async function main() {
  ensureDir(ARTIFACT_DIR);
  await markAuditRead();

  console.log('[QA] Seeding user (prod-like)...');
  const seedCode = await seedUser();
  console.log(`[QA] Seed exit code: ${seedCode}`);

  console.log('[QA] Running Playwright attempt8d...');
  const pwCode = await runPlaywright();
  console.log(`[QA] Playwright exit code: ${pwCode}`);

  if (!fs.existsSync(JSON_REPORT)) {
    await fsp.writeFile(JSON_REPORT, JSON.stringify({ stats: {}, suites: [], errors: ['missing report'] }, null, 2));
  }
  const jsonObj = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
  await writeCounts(jsonObj);
  await writeFailureIndex(jsonObj);
  await handleRoutes();
  await zeroByteScan();
  await writeSha();

  const verdictLines = [
    `PLAYWRIGHT_EXIT=${pwCode}`,
    `SEED_EXIT=${seedCode}`,
    `JSON_REPORT=${path.relative(ROOT, JSON_REPORT)}`,
    `COUNTS=${path.relative(ROOT, COUNTS_PATH)}`,
    `FAIL_INDEX=${path.relative(ROOT, FAIL_INDEX_PATH)}`,
  ];
  await fsp.writeFile(VERDICT_PATH, verdictLines.join('\n') + '\n', 'utf8');

  process.exit(pwCode);
}

main().catch(async (err) => {
  console.error('[QA] runner failed', err);
  try {
    await fsp.writeFile(VERDICT_PATH, `RUNNER_ERROR=${err.message}\n`);
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});

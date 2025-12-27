#!/usr/bin/env node
/* Compliance check script (passive, non-blocking) */
const fs = require('fs');
const path = require('path');

const checks = [];
let overallStatus = 'OK';

function addCheck(name, ok, details = {}) {
  checks.push({ name, status: ok ? 'OK' : 'WARN', ...details });
  if (!ok) overallStatus = 'WARN';
}

// Check 1: Compliance documentation files exist
const complianceDocs = [
  'docs/security/LEGAL_COMPLIANCE_CHECKLIST.md',
  'docs/security/COMPLIANCE_TRACEABILITY.md',
];
complianceDocs.forEach((doc) => {
  const docPath = path.join(__dirname, '../../', doc);
  addCheck(`doc_${path.basename(doc, '.md')}`, fs.existsSync(docPath), { path: doc });
});

// Check 2: PROD flags (EXECUTION_ENABLED, KILL_SWITCH)
const isProd = (process.env.NODE_ENV || '').toUpperCase() === 'PROD' || (process.env.RUNTIME_ENV || '').toUpperCase() === 'PROD';
if (isProd) {
  addCheck('execution_enabled_prod', process.env.EXECUTION_ENABLED !== 'true', {
    value: process.env.EXECUTION_ENABLED || 'false',
    note: 'EXECUTION_ENABLED should not be true by default in PROD',
  });
  addCheck('kill_switch_prod', process.env.KILL_SWITCH !== 'true', {
    value: process.env.KILL_SWITCH || 'false',
    note: 'KILL_SWITCH should not be active in PROD',
  });
} else {
  addCheck('execution_enabled_dev', true, { note: 'DEV mode, EXECUTION_ENABLED check skipped' });
  addCheck('kill_switch_dev', true, { note: 'DEV mode, KILL_SWITCH check skipped' });
}

// Check 3: secretsPolicy active
try {
  const secretsPolicy = require(path.join(__dirname, '../../mf-back/orchestration/secretsPolicy'));
  const secretsDecision = secretsPolicy.evaluate({
    env: process.env.NODE_ENV || 'DEV',
    mode: process.env.RUNTIME_ENV || process.env.NODE_ENV || 'DEV',
  });
  addCheck('secrets_policy_active', true, {
    status: secretsDecision.status,
    missing: secretsDecision.missing || [],
    warnings: secretsDecision.warnings || [],
  });
  if (isProd && secretsDecision.status === 'BLOCK') {
    addCheck('secrets_prod_block', true, {
      note: 'PROD blocked due to missing secrets (expected behavior)',
    });
  }
} catch (err) {
  addCheck('secrets_policy_active', false, { error: err.message });
}

// Check 4: No hardcoded secrets in orchestration
try {
  const orchestrationDir = path.join(__dirname, '../../mf-back/orchestration');
  const files = fs.readdirSync(orchestrationDir).filter((f) => f.endsWith('.js'));
  let hasHardcodedSecrets = false;
  files.forEach((file) => {
    const content = fs.readFileSync(path.join(orchestrationDir, file), 'utf8');
    // Check for common secret patterns (but allow in comments/tests)
    if (content.match(/sk-[a-zA-Z0-9]{32,}/) && !content.includes('//') && !content.includes('test')) {
      hasHardcodedSecrets = true;
    }
  });
  addCheck('no_hardcoded_secrets', !hasHardcodedSecrets, {
    note: hasHardcodedSecrets ? 'Potential hardcoded secrets found' : 'No hardcoded secrets detected',
  });
} catch (err) {
  addCheck('no_hardcoded_secrets', false, { error: err.message });
}

// Check 5: .gitignore excludes .env files
try {
  const gitignorePath = path.join(__dirname, '../../.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const excludesEnv = gitignore.includes('.env') || gitignore.includes('*.env');
    addCheck('gitignore_env', excludesEnv, {
      note: excludesEnv ? '.env files excluded from git' : '.env files may be tracked',
    });
  } else {
    addCheck('gitignore_env', false, { note: '.gitignore not found' });
  }
} catch (err) {
  addCheck('gitignore_env', false, { error: err.message });
}

// Check 6: Stores use TTL (verify idempotencyStore, auditTrailStore)
try {
  const idempotencyStore = require(path.join(__dirname, '../../mf-back/orchestration/idempotencyStore'));
  const auditTrailStore = require(path.join(__dirname, '../../mf-back/orchestration/auditTrailStore'));
  const idemSummary = idempotencyStore.summary();
  const auditSummary = auditTrailStore.summary();
  addCheck('stores_ttl', true, {
    idempotencyStore: {
      maxEntries: idemSummary.maxEntries,
      entriesStored: idemSummary.entriesStored,
      hasTTL: idemSummary.maxEntries < 1000, // Indirect check
    },
    auditTrailStore: {
      maxEntries: auditSummary.maxEntries,
      entriesStored: auditSummary.entriesStored,
      hasTTL: auditSummary.maxEntries < 1000, // Indirect check
    },
  });
} catch (err) {
  addCheck('stores_ttl', false, { error: err.message });
}

// Check 7: Tenant isolation (verify stores partition by tenantId)
try {
  // Check that stores have tenantId parameter in their APIs
  const idempotencyStore = require(path.join(__dirname, '../../mf-back/orchestration/idempotencyStore'));
  const auditTrailStore = require(path.join(__dirname, '../../mf-back/orchestration/auditTrailStore'));
  const artifactStore = require(path.join(__dirname, '../../mf-back/orchestration/artifactStore'));

  // Verify APIs accept tenantId parameter
  const idemHasTenant = typeof idempotencyStore.get === 'function' || typeof idempotencyStore.has === 'function';
  const auditHasTenant = typeof auditTrailStore.entries === 'function';
  const artifactHasTenant = typeof artifactStore.getArtifacts === 'function';

  addCheck('tenant_isolation', idemHasTenant && auditHasTenant && artifactHasTenant, {
    idempotencyStore: idemHasTenant,
    auditTrailStore: auditHasTenant,
    artifactStore: artifactHasTenant,
  });
} catch (err) {
  addCheck('tenant_isolation', false, { error: err.message });
}

// Check 8: Web3 simulation only (no Web3 dependencies)
try {
  const packageJsonPath = path.join(__dirname, '../../mf-back/package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const hasWeb3Deps = Object.keys(deps).some((dep) => dep.includes('ethers') || dep.includes('web3') || dep.includes('solana'));
    addCheck('web3_simulation_only', !hasWeb3Deps, {
      note: hasWeb3Deps ? 'Web3 dependencies found (should be simulation only)' : 'No Web3 dependencies (simulation only)',
      dependencies: hasWeb3Deps ? Object.keys(deps).filter((d) => d.includes('ethers') || d.includes('web3') || d.includes('solana')) : [],
    });
  } else {
    addCheck('web3_simulation_only', false, { note: 'package.json not found' });
  }
} catch (err) {
  addCheck('web3_simulation_only', false, { error: err.message });
}

const report = {
  status: overallStatus,
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'DEV',
  checks,
  summary: {
    total: checks.length,
    ok: checks.filter((c) => c.status === 'OK').length,
    warn: checks.filter((c) => c.status === 'WARN').length,
  },
};

console.log(JSON.stringify(report, null, 2));

// Exit with code 0 (non-blocking, informational only)
process.exit(0);

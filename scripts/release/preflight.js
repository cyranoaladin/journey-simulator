/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

#!/usr/bin/env node
/* Preflight release checks (read-only, no side effects) */
const path = require('path');
const registry = require(path.join(__dirname, '../../mf-back/agents/registry'));
const web3Guards = require(path.join(__dirname, '../../mf-back/orchestration/web3Guards'));
const auditTrailStore = require(path.join(__dirname, '../../mf-back/orchestration/auditTrailStore'));
const idempotencyStore = require(path.join(__dirname, '../../mf-back/orchestration/idempotencyStore'));

const checks = [];

const addCheck = (name, ok, info = {}) => {
  checks.push({ name, status: ok ? 'OK' : 'BLOCK', ...info });
  return ok;
};

// Env vars critiques
const envVars = ['NODE_ENV', 'LOG_LEVEL'];
const envMissing = envVars.filter((v) => !process.env[v]);
addCheck('env_vars', envMissing.length === 0, { missing: envMissing });

// Kill switch off
addCheck('kill_switch', process.env.KILL_SWITCH !== 'true', { value: process.env.KILL_SWITCH || 'false' });

// Execution real par défaut bloqué
addCheck('execution_enabled_default', process.env.EXECUTION_ENABLED !== 'true', { value: process.env.EXECUTION_ENABLED || 'false' });

// Agents critiques
const criticalAgents = ['SecurityAuditAgent'];
const missingCritical = criticalAgents.filter((id) => !registry.find((a) => a.agentId === id && a.enabled !== false));
addCheck('critical_agents', missingCritical.length === 0, { missing: missingCritical });

// web3 guard nominal
const web3Eval = web3Guards.evaluate({ request: {}, payload: {}, executionPlan: [] });
addCheck('web3_guard', web3Eval.level !== 'BLOCK', { level: web3Eval.level, reasons: web3Eval.reasons });

// Stores sous seuil
const idemSummary = idempotencyStore.summary();
const auditSummary = auditTrailStore.summary();
addCheck('idempotency_store', idemSummary.entriesStored < idemSummary.maxEntries, idemSummary);
addCheck('audit_trail_store', auditSummary.entriesStored < auditSummary.maxEntries, auditSummary);

const status = checks.some((c) => c.status === 'BLOCK') ? 'BLOCK' : 'OK';
const output = { status, checks };
console.log(JSON.stringify(output, null, 2));
process.exit(status === 'OK' ? 0 : 1);

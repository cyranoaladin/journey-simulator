/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const DEFAULTS = {
  manual: {
    enabled: process.env.KILL_SWITCH === 'true',
    reason: process.env.KILL_SWITCH ? 'env_kill_switch' : null,
    scope: process.env.KILL_SWITCH_SCOPE === 'ALL' ? 'ALL' : 'REAL_ONLY', // default REAL_ONLY
  },
  thresholds: {
    maxAgentFailures: 2,
    maxTimeouts: 1,
    criticalAgents: ['SecurityAuditAgent'],
    maxContradictions: 2,
    maxIdempotentReplays: 3,
    auditMaxEntries: 95, // close to 100 hard cap
    web3BlockMax: 2,
  },
};

function evaluate({ ops = {}, runs = [], contradictions = [], idempotentReplays = 0, auditSummary = { entriesStored: 0, maxEntries: 100 }, web3 = {} }) {
  const reasons = [];
  let active = false;
  let scope = 'REAL_ONLY';
  let triggeredBy = null;

  // Manual
  const manualEnabled = process.env.KILL_SWITCH === 'true' || DEFAULTS.manual.enabled;
  const manualScope = process.env.KILL_SWITCH_SCOPE === 'ALL' ? 'ALL' : DEFAULTS.manual.scope;
  const manualReason = process.env.KILL_SWITCH ? 'env_kill_switch' : DEFAULTS.manual.reason;
  if (manualEnabled) {
    active = true;
    scope = manualScope || 'REAL_ONLY';
    triggeredBy = 'manual';
    if (manualReason) reasons.push(manualReason);
  }

  // Automatic thresholds
  const failCount = runs.filter((r) => r.status === 'FAIL').length;
  const timeoutCount = runs.filter((r) => r.status === 'TIMEOUT').length;
  const criticalFailed = runs.some((r) => DEFAULTS.thresholds.criticalAgents.includes(r.agentId) && r.status === 'FAIL');
  const contradictionsCount = contradictions.length;
  const web3Block = Array.isArray(web3.reasons) && web3.reasons.some((r) => r.includes('web3_') && web3.level === 'BLOCK');

  if (failCount >= DEFAULTS.thresholds.maxAgentFailures) reasons.push('too_many_agent_failures');
  if (timeoutCount >= DEFAULTS.thresholds.maxTimeouts) reasons.push('too_many_timeouts');
  if (criticalFailed) reasons.push('critical_agent_failed');
  if (contradictionsCount > DEFAULTS.thresholds.maxContradictions) reasons.push('too_many_contradictions');
  if (idempotentReplays >= DEFAULTS.thresholds.maxIdempotentReplays) reasons.push('idempotent_replay_storm');
  if (auditSummary.entriesStored >= DEFAULTS.thresholds.auditMaxEntries) reasons.push('audit_trail_near_capacity');
  if (web3Block) reasons.push('web3_block_repeated');

  if (reasons.length > 0 && !active) {
    active = true;
    triggeredBy = 'automatic';
    scope = 'REAL_ONLY';
  }

  return {
    active,
    scope,
    triggeredBy,
    reasons,
  };
}

module.exports = {
  evaluate,
  DEFAULTS,
};

const DEFAULT_QUOTAS = {
  default: {
    maxRunsPerWindow: 50,
    windowSizeMs: 10 * 60 * 1000,
    maxLLMCallsPerRun: 30,
    budgetUsdPerWindow: 2,
    maxAgentsPerRun: 20,
  },
};

const testOverrides = new Map();

function getQuota(tenantId = 'default') {
  const key = tenantId || 'default';
  if (testOverrides.has(key)) return testOverrides.get(key);
  return DEFAULT_QUOTAS[key] || DEFAULT_QUOTAS.default;
}

function evaluateQuota(tenantId, snapshot = {}) {
  const quota = getQuota(tenantId);
  const reasons = [];
  let status = 'OK';

  const near = (val, limit) => limit && val >= 0.8 * limit;
  const over = (val, limit) => limit && val > limit;

  if (near(snapshot.runsInWindow || 0, quota.maxRunsPerWindow)) reasons.push('quota_runs_warn');
  if (near(snapshot.llmCallsPerRun || 0, quota.maxLLMCallsPerRun)) reasons.push('quota_llm_warn');
  if (near(snapshot.costWindowUsd || 0, quota.budgetUsdPerWindow)) reasons.push('quota_budget_warn');
  if (near(snapshot.agentsPerRun || 0, quota.maxAgentsPerRun)) reasons.push('quota_agents_warn');

  if (over(snapshot.runsInWindow || 0, quota.maxRunsPerWindow)) reasons.push('quota_runs_block');
  if (over(snapshot.llmCallsPerRun || 0, quota.maxLLMCallsPerRun)) reasons.push('quota_llm_block');
  if (over(snapshot.costWindowUsd || 0, quota.budgetUsdPerWindow)) reasons.push('quota_budget_block');
  if (over(snapshot.agentsPerRun || 0, quota.maxAgentsPerRun)) reasons.push('quota_agents_block');

  if (reasons.some((r) => r.endsWith('block'))) status = 'BLOCK';
  else if (reasons.length) status = 'WARN';

  return { status, reasons, quota };
}

function setTestQuota(tenantId, quota) {
  testOverrides.set(tenantId || 'default', quota);
}

function resetTestQuotas() {
  testOverrides.clear();
}

module.exports = {
  getQuota,
  evaluateQuota,
  setTestQuota,
  resetTestQuotas,
};

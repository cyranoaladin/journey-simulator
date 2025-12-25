const CRITICAL_INTENT_AGENT = {
  security_audit: 'SecurityAuditAgent',
};

const TIMEOUT_THRESHOLD = 1;
const FAIL_THRESHOLD = 2;

function evaluateProductionGuards({ executionEnabled, gateApproved, contradictions = [], runs = [], intents = [], agentsMeta = {} }) {
  const reasons = [];

  if (!executionEnabled) reasons.push('execution_disabled');
  if (!gateApproved) reasons.push('gate_not_approved');
  if ((contradictions || []).length > 0) reasons.push('contradictions_present');

  const timeouts = runs.filter((r) => r.status === 'TIMEOUT');
  const fails = runs.filter((r) => r.status === 'FAIL');
  if (timeouts.length >= TIMEOUT_THRESHOLD) reasons.push('timeouts_present');
  if (fails.length >= FAIL_THRESHOLD) reasons.push('too_many_failures');

  const normalizedIntents = Array.isArray(intents) ? intents.map((i) => (i || '').toLowerCase()) : [];
  Object.entries(CRITICAL_INTENT_AGENT).forEach(([intentKey, agentId]) => {
    if (normalizedIntents.some((i) => i.includes(intentKey))) {
      const agentActive = (agentsMeta.enabled || []).includes(agentId);
      const agentRan = runs.some((r) => r.agentId === agentId);
      if (!agentActive || !agentRan) reasons.push(`critical_agent_missing:${agentId}`);
    }
  });

  return { realExecutionAllowed: reasons.length === 0, reasons };
}

module.exports = {
  evaluateProductionGuards,
  constants: { CRITICAL_INTENT_AGENT, TIMEOUT_THRESHOLD, FAIL_THRESHOLD },
};

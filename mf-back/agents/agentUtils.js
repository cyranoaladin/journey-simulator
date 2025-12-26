function mkFinding(item, status = 'info', severity = 'low', detail = '') {
  return { item, status, severity, detail };
}

function mkAction(action) {
  if (typeof action === 'string') return action;
  if (action == null) return '';
  return String(action);
}

function estimateConfidence({ inputPresent, ragHits = 0, hasFindings }) {
  let score = 0.55;
  if (inputPresent) score += 0.15;
  if (ragHits > 0) score += Math.min(0.2, ragHits * 0.05);
  if (hasFindings) score += 0.1;
  return Math.max(0.4, Math.min(0.92, score));
}

function safeRun(agentId, fn) {
  const started = Date.now();
  try {
    const res = fn();
    const base = {
      agentId,
      status: res.status || 'OK',
      summary: res.summary || `${agentId} completed`,
      findings: res.findings || [],
      actions: res.actions || [],
      citations: res.citations || [],
      confidence: typeof res.confidence === 'number' ? res.confidence : undefined,
      assumptions: res.assumptions || [],
      limits: res.limits || [],
      errors: res.errors || [],
      metrics: {
        latencyMs: Date.now() - started,
        ragHits: res.metrics?.ragHits || 0,
        tokens: res.metrics?.tokens,
      },
      traceId: res.traceId,
      details: res.details,
    };
    return base;
  } catch (error) {
    return {
      agentId,
      status: 'FAIL',
      summary: `${agentId} failed`,
      actions: [],
      citations: [],
      findings: [],
      confidence: 0.2,
      assumptions: ['Execution guard: exception caught'],
      limits: [],
      metrics: { latencyMs: Date.now() - started, ragHits: 0 },
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

module.exports = {
  mkFinding,
  mkAction,
  estimateConfidence,
  safeRun,
};

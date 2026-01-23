/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const LogicCheckService = require('./logicCheckService');

function buildOpsRag(ops, ragContext, ragDomains) {
  let ragMode = 'disabled';
  if (ragContext) {
    const sourceStr = String(ragContext.source || '');
    ragMode = sourceStr.includes('remote') ? 'remote' : 'local';
  }
  ops.rag = {
    mode: ragMode,
    domain: ragDomains || null,
    hits: Array.isArray(ragContext?.chunks) ? ragContext.chunks.length : 0,
  };
}

function collectAgentMetrics(runsWithScores, ops, selected, registryIndex) {
  ops.llm.calls = runsWithScores.length;
  ops.llm.cacheHits = 0;
  ops.llm.deduplicatedCalls = 0;

  const agentsMeta = {
    enabled: selected.map((a) => a.agentId),
    disabled: [],
  };

  const agentsStatus = selected.reduce((acc, sel) => {
    const meta = registryIndex[sel.agentId] || {};
    const enabled = meta.enabled !== false;
    acc[sel.agentId] = { enabled, mode: enabled ? 'REAL_CAPABLE' : 'DISABLED' };
    return acc;
  }, {});

  return { agentsMeta, agentsStatus };
}

function summarizeFindings(runsWithScores, topFindings) {
  const flattenedFindings = runsWithScores
    .flatMap((r) => Array.isArray(r.findings) ? r.findings.map((f) => ({ ...f, agentId: r.agentId })) : [])
    .filter((f) => f && (f.item || f.detail));

  const keyFindings = (flattenedFindings.length
    ? flattenedFindings.map((f) => f.detail || f.item).filter(Boolean)
    : topFindings.map((f) => f.summary)
  ).slice(0, 5);

  const topRisks = flattenedFindings
    .filter((f) => f.severity)
    .slice(0, 3)
    .map((f) => ({ risk: f.item || f.detail || 'risk', severity: f.severity }));

  return { keyFindings, topRisks };
}

function buildExecutiveSummary(overallStatus, keyFindings, topRisks, recommendedNextSteps, aggregatedDecision) {
  return {
    headline: overallStatus === 'OK' ? 'Key improvements identified' : 'Risks identified, action required',
    keyFindings,
    topRisks,
    recommendedNextSteps,
    confidence: aggregatedDecision.confidence,
  };
}

function computeHumanPlan(actionPlanSteps, contradictions) {
  return {
    objective: 'Execute the prioritized improvements',
    steps: actionPlanSteps.slice(0, 10).map((s, idx) => {
      let priority = 'LOW';
      if (idx < 3) {
        priority = 'HIGH';
      } else if (idx < 6) {
        priority = 'MEDIUM';
      }
      return {
        step: idx + 1,
        action: s.action,
        owner: s.sourceAgent || 'unassigned',
        priority,
      };
    }),
    warnings: contradictions.length ? ['Conflicting agent recommendations present'] : [],
  };
}

function dedupeActions(recommendedActions, previousActions, contradictions) {
  const currentActionEntries = recommendedActions.map((r) => ({
    action: r.action,
    agentId: r.agentId,
    score: r.score,
    conflict: contradictions.some((c) => c.agents.includes(r.agentId)),
  }));

  const previousActionEntries = (previousActions || []).map((r) => ({
    action: r.action,
    agentId: r.agentId,
    score: r.score || 0,
    conflict: contradictions.some((c) => c.agents.includes(r.agentId)),
    fromMemory: true,
  }));

  const mergedActions = [...currentActionEntries, ...previousActionEntries];
  const dedup = new Map();
  for (const item of mergedActions) {
    const key = String(item.action || '').toLowerCase().trim();
    if (!key) continue;
    if (!dedup.has(key) || (dedup.get(key)?.score || 0) < (item.score || 0)) {
      dedup.set(key, item);
    }
  }

  const stepsOrdered = Array.from(dedup.values()).sort((a, b) => {
    if (a.conflict !== b.conflict) return a.conflict ? 1 : -1;
    return (b.score || 0) - (a.score || 0);
  });

  return stepsOrdered.map((s, idx) => ({
    action: s.action,
    sourceAgent: s.agentId,
    score: s.score,
    priority: idx + 1,
    conflict: Boolean(s.conflict),
    fromMemory: Boolean(s.fromMemory),
  }));
}

function computeAggregates({
  runs,
  registryIndex,
  computeScores,
  detectContradictions,
  payload,
  req,
  routed,
  agentsMeta,
  previous,
  learningMap,
  selected,
  budget,
  registryIndexFull,
  phasesExecuted,
  currentPhase,
  preset,
  ragContext,
  startedAll,
  getTraceId,
}) {
  let runsWithScores = LogicCheckService.computeScoresForRuns(runs, registryIndexFull, computeScores);
  runsWithScores = LogicCheckService.applyRagPolicyToRuns(runsWithScores);

  const summary = LogicCheckService.generateSummary(runsWithScores);
  const actions = LogicCheckService.collectActions(runsWithScores);
  const contradictions = LogicCheckService.detectContradictionsInRuns(runsWithScores, detectContradictions);
  const web3Actions = require('../web3Utils').detectWeb3Actions(actions, payload); // keep local util if exists
  const overallStatus = LogicCheckService.computeOverallStatus(runsWithScores);
  const topFindings = LogicCheckService.extractTopFindings(runsWithScores, 5);
  const recommendedActions = LogicCheckService.extractRecommendedActions(runsWithScores, 10);

  const aggregatedDecision = {
    overallStatus,
    topFindings,
    recommendedActions,
    rationale: `Selected actions from highest weighted agents. Contradictions detected: ${contradictions.length}.`,
    confidence: LogicCheckService.computeConfidence(runsWithScores),
  };

  const steps = dedupeActions(recommendedActions, previous?.decision?.recommendedActions, contradictions);

  const { keyFindings, topRisks } = summarizeFindings(runsWithScores, topFindings);
  const executiveSummary = buildExecutiveSummary(overallStatus, keyFindings, topRisks, steps.slice(0, 5).map((s) => s.action), aggregatedDecision);
  const humanPlan = computeHumanPlan(steps, contradictions);

  const aggregated = require('../aggregatedBuilder').buildInitialAggregated({
    req,
    payload,
    routed,
    intentsDeduped: [],
    intentsCombined: [],
    workflowIntents: [],
    runsWithScores,
    summary,
    actions,
    contradictions,
    aggregatedDecision,
    previous,
    learningMap,
    selected,
    registryIndex: registryIndexFull,
    budget,
    agentsMeta,
    phasesExecuted,
    currentPhase,
    preset,
    ragContext,
    startedAll,
    getTraceId,
  });

  return {
    aggregated,
    runsWithScores,
    contradictions,
    recommendedActions,
    aggregatedDecision,
    steps,
    executiveSummary,
    humanPlan,
    web3Actions,
  };
}

module.exports = {
  buildOpsRag,
  collectAgentMetrics,
  computeAggregates,
  summarizeFindings,
  buildExecutiveSummary,
  computeHumanPlan,
  dedupeActions,
};

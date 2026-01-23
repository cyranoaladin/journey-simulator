/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { applyRagPolicy } = require('../ragPolicy');

// These functions are defined in zynoVerticalSlice.js - we need to pass them as parameters
// For now, we'll keep the service methods that don't depend on them

/**
 * Logic verification service for orchestration
 * Reduces cognitive complexity by isolating detection and scoring logic
 */
class LogicCheckService {
  /**
   * Calculates scores for agent runs
   * Note: computeScores must be passed as a parameter from zynoVerticalSlice.js
   */
  static computeScoresForRuns(runs, registryIndex, computeScoresFn) {
    return runs.map((r) => {
      if (!r) {
        return {
          agentId: 'unknown',
          status: 'FAIL',
          summary: 'Execution returned no result (null/undefined)',
          actions: [],
          scores: { raw: 0, weighted: 0 },
        };
      }
      if (r.scores) return r;
      const meta = registryIndex[r.agentId] || {};
      return { ...r, scores: computeScoresFn(r, meta) };
    });
  }

  /**
   * Calculates the score for an individual run (Restored)
   */
  static computeScore(run, learningData = {}, meta = {}) {
    let score = 0;
    if (run.status === 'OK') score = 100;
    else if (run.status === 'WARN') score = 50;
    else if (run.status === 'FAIL') score = 0;

    const learningAdjustment = learningData?.score || 0;
    const confidence = meta.confidenceWeight || 1.0;
    const weighted = score * confidence + learningAdjustment;

    return {
      raw: score,
      weighted: Math.max(0, Math.min(100, weighted)),
    };
  }

  /**
   * Applies RAG policy to runs
   */
  static applyRagPolicyToRuns(runsWithScores) {
    return applyRagPolicy(applyRagPolicy(runsWithScores));
  }

  /**
   * Detects contradictions between runs
   * Note: detectContradictions must be passed as a parameter from zynoVerticalSlice.js
   */
  static detectContradictionsInRuns(runsWithScores, detectContradictionsFn) {
    return detectContradictionsFn(runsWithScores);
  }

  /**
   * Calculates overall status from runs
   */
  static computeOverallStatus(runsWithScores) {
    const severity = { FAIL: 3, TIMEOUT: 2, WARN: 1, OK: 0 };
    const hasFailOrTimeout = runsWithScores.some((r) => r.status === 'FAIL' || r.status === 'TIMEOUT');
    const hasWarn = runsWithScores.some((r) => r.status === 'WARN');
    const hasOk = runsWithScores.some((r) => r.status === 'OK');

    // If no FAIL/TIMEOUT but at least one WARN, return WARN even if there are OKs
    if (!hasFailOrTimeout && hasWarn) {
      return 'WARN';
    }

    if (hasOk && !hasFailOrTimeout && !hasWarn) {
      return 'OK';
    }

    return runsWithScores.reduce((worst, r) => {
      const currentSeverity = severity[r.status] ?? 0;
      const worstSeverity = severity[worst] ?? 0;
      return currentSeverity > worstSeverity ? r.status : worst;
    }, 'OK');
  }

  /**
   * Extracts top findings from runs
   */
  static extractTopFindings(runsWithScores, limit = 5) {
    return runsWithScores
      .slice()
      .sort((a, b) => (b.scores?.weighted || 0) - (a.scores?.weighted || 0))
      .slice(0, limit)
      .map((r) => ({
        agentId: r.agentId,
        summary: r.summary || r.status,
        score: r.scores?.weighted || 0,
      }));
  }

  /**
   * Extracts recommended actions from runs
   */
  static extractRecommendedActions(runsWithScores, limit = 10) {
    return runsWithScores
      .slice()
      .sort((a, b) => (b.scores?.weighted || 0) - (a.scores?.weighted || 0))
      .flatMap((r) =>
        (Array.isArray(r.actions) ? r.actions : []).map((action) => ({
          agentId: r.agentId,
          action,
          score: r.scores?.weighted || 0,
        }))
      )
      .slice(0, limit);
  }

  /**
   * Calculates confidence from scores
   */
  static computeConfidence(runsWithScores) {
    const confs = runsWithScores.map((r) => (typeof r.confidence === 'number' ? r.confidence : null)).filter((v) => v !== null);
    const divisor = runsWithScores.length || 1;
    const scoreAvg = runsWithScores.reduce((acc, r) => acc + (r.scores?.weighted || 0), 0) / divisor;
    const base = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0.55;
    return Math.max(0, Math.min(0.95, base + Math.min(scoreAvg, 1) * 0.1));
  }

  /**
   * Collects actions from all runs
   */
  static collectActions(runsWithScores) {
    return runsWithScores.flatMap((r) => (Array.isArray(r.actions) ? r.actions : []));
  }

  /**
   * Generates a textual summary of runs
   */
  static generateSummary(runsWithScores) {
    return runsWithScores
      .map((r) => r.summary || r.details || r.status || r.agentId)
      .filter(Boolean)
      .join(' | ');
  }

  /**
   * Creates the definitive action plan by merging current and previous actions,
   * handling deduplication, scoring, and conflict marking.
   */
  static createActionPlan(recommendedActions, previousRecommendedActions = [], contradictions = []) {
    const currentActionEntries = recommendedActions.map((r) => ({
      action: r.action,
      agentId: r.agentId,
      score: r.score,
      conflict: contradictions.some((c) => c.agents.includes(r.agentId))
    }));

    const previousActionEntries = previousRecommendedActions.map((r) => ({
      action: r.action,
      agentId: r.agentId,
      score: r.score || 0,
      conflict: contradictions.some((c) => c.agents.includes(r.agentId)),
      fromMemory: true
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
      // Prioritize non-conflicting actions
      if (a.conflict !== b.conflict) return a.conflict ? 1 : -1;
      // Then score
      return (b.score || 0) - (a.score || 0);
    });

    return stepsOrdered.map((s, idx) => ({
      action: s.action,
      sourceAgent: s.agentId,
      score: s.score,
      priority: idx + 1,
      conflict: Boolean(s.conflict),
      fromMemory: Boolean(s.fromMemory)
    }));
  }

  /**
   * Creates the human-readable plan.
   */
  static createHumanPlan(actionPlanSteps, contradictions = []) {
    return {
      objective: 'Execute the prioritized improvements',
      steps: actionPlanSteps.slice(0, 10).map((s, idx) => ({
        step: idx + 1,
        action: s.action,
        owner: s.sourceAgent || 'unassigned',
        priority: idx < 3 ? 'HIGH' : idx < 6 ? 'MEDIUM' : 'LOW'
      })),
      warnings: contradictions.length > 0 ? ['Conflicting agent recommendations present'] : [],
    };
  }
}

module.exports = LogicCheckService;

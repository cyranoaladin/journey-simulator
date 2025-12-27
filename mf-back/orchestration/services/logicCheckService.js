const { applyRagPolicy } = require('../ragPolicy');

// These functions are defined in zynoVerticalSlice.js - we need to pass them as parameters
// For now, we'll keep the service methods that don't depend on them

/**
 * Service de vérification logique pour l'orchestration
 * Réduit la complexité cognitive en isolant la logique de détection et de scoring
 */
class LogicCheckService {
  /**
   * Calcule les scores pour les runs d'agents
   * Note: computeScores doit être passé en paramètre depuis zynoVerticalSlice.js
   */
  static computeScoresForRuns(runs, registryIndex, computeScoresFn) {
    return runs.map((r) => {
      if (r.scores) return r;
      const meta = registryIndex[r.agentId] || {};
      return { ...r, scores: computeScoresFn(r, meta) };
    });
  }

  /**
   * Applique la politique RAG aux runs
   */
  static applyRagPolicyToRuns(runsWithScores) {
    return applyRagPolicy(applyRagPolicy(runsWithScores));
  }

  /**
   * Détecte les contradictions entre les runs
   * Note: detectContradictions doit être passé en paramètre depuis zynoVerticalSlice.js
   */
  static detectContradictionsInRuns(runsWithScores, detectContradictionsFn) {
    return detectContradictionsFn(runsWithScores);
  }

  /**
   * Calcule le statut global à partir des runs
   */
  static computeOverallStatus(runsWithScores) {
    const severity = { FAIL: 3, TIMEOUT: 2, WARN: 1, OK: 0 };
    const hasFailOrTimeout = runsWithScores.some((r) => r.status === 'FAIL' || r.status === 'TIMEOUT');
    const hasWarn = runsWithScores.some((r) => r.status === 'WARN');
    const hasOk = runsWithScores.some((r) => r.status === 'OK');

    // Si aucun FAIL/TIMEOUT mais au moins un WARN, retourner WARN même s'il y a des OK
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
   * Extrait les top findings des runs
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
   * Extrait les actions recommandées des runs
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
   * Calcule la confiance à partir des scores
   */
  static computeConfidence(runsWithScores) {
    const confs = runsWithScores.map((r) => (typeof r.confidence === 'number' ? r.confidence : null)).filter((v) => v !== null);
    const divisor = runsWithScores.length || 1;
    const scoreAvg = runsWithScores.reduce((acc, r) => acc + (r.scores?.weighted || 0), 0) / divisor;
    const base = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0.55;
    return Math.max(0, Math.min(0.95, base + Math.min(scoreAvg, 1) * 0.1));
  }

  /**
   * Collecte les actions de tous les runs
   */
  static collectActions(runsWithScores) {
    return runsWithScores.flatMap((r) => (Array.isArray(r.actions) ? r.actions : []));
  }

  /**
   * Génère un résumé textuel des runs
   */
  static generateSummary(runsWithScores) {
    return runsWithScores
      .map((r) => r.summary || r.details || r.status || r.agentId)
      .filter(Boolean)
      .join(' | ');
  }
}

module.exports = LogicCheckService;


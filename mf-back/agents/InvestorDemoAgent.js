const { mkFinding, mkAction, estimateConfidence, safeRun } = require('./agentUtils');

class InvestorDemoAgent {
  async run(request = {}) {
    const { traceId, input = '', context = {} } = request;
    const journey = context?.journey || {};
    const inputPresent = Boolean(input && input.trim());

    return safeRun('InvestorDemoAgent', () => {
      const findings = [
        mkFinding('value_prop', 'ok', 'medium', 'Clarified value proposition for target segment'),
        mkFinding('market', 'ok', 'medium', 'Market size and ICP identified'),
        mkFinding('traction', 'warn', 'medium', 'Need concrete metrics (MRR, growth, retention)'),
        mkFinding('risks', 'warn', 'high', 'Key risks documented (product, go-to-market, compliance)'),
        mkFinding('ask', 'ok', 'low', 'Funding ask and runway assumptions outlined'),
      ];

      const actions = [
        mkAction('Draft one-slide pitch with value prop and ICP'),
        mkAction('Define KPI dashboard (MRR, CAC, retention)'),
        mkAction('List top 5 risks with mitigations'),
        mkAction('Prepare investor FAQ and objections handling'),
        mkAction('Outline 3 milestones for next 90 days'),
      ];

      const confidence = estimateConfidence({
        inputPresent,
        ragHits: 0,
        hasFindings: findings.length > 0,
      });

      const status = inputPresent ? 'OK' : 'WARN';
      const summary = inputPresent
        ? 'Investor pitch pack drafted'
        : 'Investor pitch pack drafted with limited input';

      const assumptions = inputPresent ? [] : ['Input succinct, compléter ICP/metrics pour affiner'];
      const limits = ['Simulation only, aucun envoi réel', 'Données financières non vérifiées'];

      return {
        status,
        summary,
        findings,
        actions,
        confidence,
        assumptions,
        limits,
        citations: [],
        metrics: { ragHits: 0 },
        traceId,
        details: {
          journeyType: journey?.journeyType || 'generic',
          phaseId: journey?.phaseId || journey?.phases?.[0] || 'pitch',
          inputLength: input?.length || 0,
        },
      };
    });
  }
}

module.exports = InvestorDemoAgent;

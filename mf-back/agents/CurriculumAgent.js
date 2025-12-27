const { mkFinding, mkAction, estimateConfidence, safeRun } = require('./agentUtils');

class CurriculumAgent {
  async run(request = {}) {
    const { traceId, input = '', context = {} } = request;
    const inputPresent = Boolean(input && input.trim());

    return safeRun('CurriculumAgent', () => {
      const findings = [
        mkFinding('modules', 'ok', 'medium', 'Modules structurés (intro, sécurité, web3, anchor)'),
        mkFinding('prerequisites', 'warn', 'low', 'Prerequis à clarifier (JS/TS, wallets, CLI)'),
        mkFinding('timeline', 'ok', 'low', 'Timeline 4-6 semaines proposée'),
        mkFinding('assessment', 'warn', 'medium', 'Rubrique d’évaluation à valider'),
      ];

      const actions = [
        mkAction('Create module 1: Foundations & threat model'),
        mkAction('Create module 2: Wallet auth + nonce flow lab'),
        mkAction('Add exercises and quizzes per module'),
        mkAction('Define evaluation rubric and success criteria'),
      ];

      const confidence = estimateConfidence({
        inputPresent,
        ragHits: 0,
        hasFindings: findings.length > 0,
      });

      const status = inputPresent ? 'OK' : 'WARN';
      const summary = inputPresent ? 'Curriculum drafted' : 'Curriculum drafted with limited input';
      const assumptions = inputPresent ? [] : ['Pas de détails sur audience; utiliser parcours générique'];
      const limits = ['Aucune délivrance de contenu réel ici', 'RAG non utilisé (déterministe)'];

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
          journeyType: context?.journey?.journeyType || 'learning',
        },
      };
    });
  }
}

module.exports = CurriculumAgent;

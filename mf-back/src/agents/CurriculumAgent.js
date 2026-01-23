/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { mkFinding, mkAction, estimateConfidence, safeRun } = require('./agentUtils');

class CurriculumAgent {
  async run(request = {}) {
    const { traceId, input = '', context = {} } = request;
    const inputPresent = Boolean(input && input.trim());

    return safeRun('CurriculumAgent', () => {
      const findings = [
        mkFinding('modules', 'ok', 'medium', 'Structured modules (intro, security, web3, anchor)'),
        mkFinding('prerequisites', 'warn', 'low', 'Prerequisites to clarify (JS/TS, wallets, CLI)'),
        mkFinding('timeline', 'ok', 'low', 'Timeline 4-6 weeks proposed'),
        mkFinding('assessment', 'warn', 'medium', 'Assessment rubric to validate'),
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
      const assumptions = inputPresent ? [] : ['No audience details; use generic path'];
      const limits = ['No real content delivery here', 'RAG not used (deterministic)'];

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

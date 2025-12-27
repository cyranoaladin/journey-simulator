const { mkFinding, mkAction, estimateConfidence, safeRun } = require('./agentUtils');

class SolanaAnchorAgent {
  async run(request = {}) {
    const { traceId, input = '', context = {} } = request;
    const inputPresent = Boolean(input && input.trim());

    return safeRun('SolanaAnchorAgent', () => {
      const findings = [
        mkFinding('idl', 'ok', 'medium', 'IDL required and versioned alongside program'),
        mkFinding('program', 'warn', 'medium', 'Program ID/config must be locked per env'),
        mkFinding('tests', 'ok', 'low', 'Anchor build/test pipeline needed'),
        mkFinding('deploy', 'warn', 'high', 'Deploy only to testnet with guardrails'),
      ];

      const actions = [
        mkAction('Add anchor build + test pipeline (testnet only)'),
        mkAction('Verify IDL compatibility and publish artifact'),
        mkAction('Pin program ID per environment and document'),
        mkAction('Add simulation step with mock validator before deploy'),
      ];

      const confidence = estimateConfidence({
        inputPresent,
        ragHits: 0,
        hasFindings: findings.length > 0,
      });

      const status = inputPresent ? 'OK' : 'WARN';
      const summary = inputPresent ? 'Solana Anchor readiness plan' : 'Anchor plan drafted with defaults';
      const assumptions = inputPresent ? [] : ['Pas de program ID fourni, usage testnet par défaut'];
      const limits = ['Aucun appel on-chain (simulation only)', 'Depends on web3Guards to block unsafe'];

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
          journeyType: context?.journey?.journeyType || 'web3_anchor',
        },
      };
    });
  }
}

module.exports = SolanaAnchorAgent;

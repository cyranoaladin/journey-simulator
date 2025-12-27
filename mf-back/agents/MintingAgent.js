const { mkFinding, mkAction, estimateConfidence, safeRun } = require('./agentUtils');

class MintingAgent {
  async run(request = {}) {
    const { traceId, input = '', context = {} } = request;
    const inputPresent = Boolean(input && input.trim());

    return safeRun('MintingAgent', () => {
      const findings = [
        mkFinding('preconditions', 'ok', 'medium', 'Proof/anchor status required before mint'),
        mkFinding('idempotency', 'ok', 'medium', 'Idempotency key per mint request'),
        mkFinding('supply', 'warn', 'medium', 'Supply cap and policy not specified'),
        mkFinding('audit', 'ok', 'low', 'Audit trail and replay guard needed'),
      ];

      const actions = [
        mkAction('Add mint request schema with proofId + nonce'),
        mkAction('Implement double-mint guard using idempotency key'),
        mkAction('Record audit trail entries for mint attempts'),
        mkAction('Provide dry-run / preview endpoint before real mint'),
      ];

      const confidence = estimateConfidence({
        inputPresent,
        ragHits: 0,
        hasFindings: findings.length > 0,
      });

      const status = inputPresent ? 'OK' : 'WARN';
      const summary = inputPresent ? 'Mint pipeline simulated and guarded' : 'Mint plan drafted with defaults';
      const assumptions = inputPresent ? [] : ['Proof/anchor details manquants, testnet only'];
      const limits = ['Simulation only, aucun mint on-chain', 'Depends on web3Guards + kill switch'];

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
          journeyType: context?.journey?.journeyType || 'mint',
        },
      };
    });
  }
}

module.exports = MintingAgent;

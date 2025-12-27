const { mkFinding, mkAction, estimateConfidence, safeRun } = require('./agentUtils');

class WalletAuthAgent {
  async run(request = {}) {
    const { traceId, input = '' } = request;
    const inputPresent = Boolean(input && input.trim());

    return safeRun('WalletAuthAgent', () => {
      const findings = [
        mkFinding('nonce', 'ok', 'medium', 'Nonce challenge required per session'),
        mkFinding('signature', 'ok', 'medium', 'Verify signature and chain/account binding'),
        mkFinding('session', 'warn', 'medium', 'Session persistence + expiry needed'),
        mkFinding('replay_guard', 'warn', 'high', 'Replay protection and audit logging required'),
      ];

      const actions = [
        mkAction('Implement nonce challenge endpoint with TTL'),
        mkAction('Persist signed session with expiry and device fingerprint'),
        mkAction('Disable legacy connect-wallet in prod environments'),
        mkAction('Add replay guard and signature verification logs'),
      ];

      const confidence = estimateConfidence({
        inputPresent,
        ragHits: 0,
        hasFindings: findings.length > 0,
      });

      const status = inputPresent ? 'OK' : 'WARN';
      const summary = inputPresent ? 'Wallet auth plan ready' : 'Wallet auth plan drafted with defaults';
      const assumptions = inputPresent ? [] : ['Chaîne cible non précisée, utiliser testnet'];
      const limits = ['Aucune connexion réelle effectuée (plan only)'];

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
      };
    });
  }
}

module.exports = WalletAuthAgent;

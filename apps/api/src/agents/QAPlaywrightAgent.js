/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const fs = require('node:fs');
const path = require('node:path');
const { mkFinding, mkAction, estimateConfidence, safeRun } = require('./agentUtils');

class QAPlaywrightAgent {
  async run(request = {}) {
    const { traceId, input = '' } = request;
    const inputPresent = Boolean(input && input.trim());
    const uiE2eExists = fs.existsSync(path.join(__dirname, '../ui-e2e/index.html'));

    return safeRun('QAPlaywrightAgent', () => {
      const findings = [
        mkFinding('coverage', 'warn', 'medium', 'Critical flows need E2E coverage (auth, vslice, preset)'),
        mkFinding('selectors', uiE2eExists ? 'ok' : 'warn', 'low', uiE2eExists ? 'ui-e2e/index.html present' : 'Selectors to define'),
        mkFinding('data', 'warn', 'medium', 'Test data/reset strategy required'),
        mkFinding('ci', 'ok', 'low', 'Add CI step with headless mode and artifacts'),
      ];

      const actions = [
        mkAction('Add Playwright test for /orchestration/vslice happy path'),
        mkAction('Create login/connect-wallet flow test with nonce challenge'),
        mkAction('Add CI step to run Playwright headless and upload traces'),
        mkAction('Define fixtures for test users and data reset'),
      ];

      const confidence = estimateConfidence({
        inputPresent,
        ragHits: 0,
        hasFindings: findings.length > 0,
      });

      const status = 'OK';
      const summary = 'Playwright E2E test plan generated';
      const assumptions = inputPresent ? [] : ['Limited input, scenarios based on defaults'];
      const limits = ['No real browser execution here (plan only)'];

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
        details: { uiE2eExists },
      };
    });
  }
}

module.exports = QAPlaywrightAgent;

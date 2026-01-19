/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

#!/usr/bin/env node
/* Smoke S0 orchestrateur (local, sans HTTP) */
const path = require('path');
const { orchestrateVerticalSlice } = require(path.join(__dirname, '../../mf-back/orchestration/zynoVerticalSlice'));

const cases = [];

async function runCase(name, payload, assertions = []) {
  try {
    const res = await orchestrateVerticalSlice(payload);
    const baseOk =
      res &&
      res.systemStatus &&
      res.ops &&
      res.decision &&
      res.ops.execution &&
      res.ops.execution.mode !== 'REAL';
    const extraOk = assertions.every((fn) => fn(res));
    const ok = baseOk && extraOk;
    cases.push({ name, status: ok ? 'PASS' : 'FAIL' });
    return ok;
  } catch (err) {
    cases.push({ name, status: 'FAIL', error: err.message });
    return false;
  }
}

(async () => {
  const ok =
    (await runCase('simple', { traceId: 's0-simple', runId: 's0-simple', intent: 'security.audit', input: 'smoke' })) &&
    (await runCase('composite', { traceId: 's0-comp', runId: 's0-comp', intent: 'security.audit+product.spec', input: 'smoke2' })) &&
    (await runCase('invalid', { traceId: 's0-invalid', runId: 's0-invalid', intent: 123, input: 42 }, [(r) => r.ops.warnings.includes('invalid_input_schema')])) &&
    (await runCase('disabled_agent', { traceId: 's0-disabled', runId: 's0-disabled', intent: 'risk.fraud', input: 'disabled' }, [(r) => r.agents.every((a) => a.agentId !== 'RiskFraudAgent')])) &&
    (await runCase(
      'idempotent_replay',
      { traceId: 's0-idem', runId: 's0-idem', intent: 'security.audit', input: 'idem' },
      []
    ) &&
      (await runCase(
        'idempotent_replay_again',
        { traceId: 's0-idem', runId: 's0-idem', intent: 'security.audit', input: 'idem' },
        [(r) => r.systemStatus.idempotent === true || (r.ops.fallbacks || []).includes('idempotent_replay')]
      )));

  const status = ok ? 'PASS' : 'FAIL';
  console.log(JSON.stringify({ status, cases }, null, 2));
  process.exit(ok ? 0 : 1);
})();

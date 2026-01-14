#!/usr/bin/env node
/**
 * Orchestrator HTTP smoke test.
 * Verifies /orchestration/vslice responds and returns basic payload.
 */

const { setTimeout: delay } = require('node:timers/promises');

const BASE_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3002';
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 12000);

const result = [];

const withTimeout = (ms = TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const clear = () => clearTimeout(timer);
  return { signal: controller.signal, clear };
};

async function checkHealth() {
  const { signal, clear } = withTimeout(5000);
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal });
    const ok = res.ok;
    const body = ok ? await res.json().catch(() => ({})) : {};
    result.push({ step: 'health', status: ok ? 'PASS' : 'FAIL', body });
    return ok;
  } catch (err) {
    result.push({ step: 'health', status: 'FAIL', error: err.message });
    return false;
  } finally {
    clear();
  }
}

async function checkVslice() {
  const { signal, clear } = withTimeout();
  try {
    const paths = [
      '/api/orchestration/vslice',
      '/orchestration/vslice'
    ];
    const payload = {
      traceId: 'smoke-http',
      runId: 'smoke-http',
      intent: 'security.audit',
      input: 'http smoke',
      preset: 'audit-dao',
      web3: { action: 'proof' }
    };
    let res;
    let body = {};
    let ok = false;
    let usedPath = null;

    for (const path of paths) {
      usedPath = path;
      res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'smoke-tenant'
        },
        body: JSON.stringify(payload),
        signal
      });
      body = await res.json().catch(() => ({}));
      ok = res.ok && Array.isArray(body.agents) && body.systemStatus;
      if (ok) break;
    }

    result.push({
      step: 'vslice',
      status: ok ? 'PASS' : 'FAIL',
      httpStatus: res?.status,
      pathTried: usedPath,
      summary: {
        mode: body.mode,
        phase: body.systemStatus?.journey?.phase,
        web3State: body.systemStatus?.web3Pipeline?.state
      }
    });
    return ok;
  } catch (err) {
    result.push({ step: 'vslice', status: 'FAIL', error: err.message });
    return false;
  } finally {
    clear();
  }
}

async function main() {
  const healthOk = await checkHealth();
  // Small delay to avoid hitting server too fast on cold start
  await delay(200);
  const vsliceOk = await checkVslice();

  const status = healthOk && vsliceOk ? 'PASS' : 'FAIL';
  console.log(JSON.stringify({ status, steps: result }, null, 2));
  process.exit(status === 'PASS' ? 0 : 1);
}

main();

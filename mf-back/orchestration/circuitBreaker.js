const DEFAULTS = {
  failureThreshold: 2,
  halfOpenAfterMs: 30_000,
  cooldownMs: 60_000,
};

const domains = ['llm', 'rag', 'execution'];
const breakers = new Map(); // tenant -> domain -> state

const now = () => Date.now();

function ensureTenant(tenantId = 'default') {
  const t = tenantId || 'default';
  if (!breakers.has(t)) {
    const init = {};
    domains.forEach((d) => {
      init[d] = { state: 'CLOSED', failures: 0, lastTrip: null, lastCheck: null };
    });
    breakers.set(t, init);
  }
  return breakers.get(t);
}

function current(tenantId, domain) {
  const b = ensureTenant(tenantId)[domain];
  const elapsed = b.lastTrip ? now() - b.lastTrip : null;
  if (b.state === 'OPEN' && elapsed !== null && elapsed >= DEFAULTS.halfOpenAfterMs) {
    b.state = 'HALF_OPEN';
  }
  return b;
}

function trip(tenantId, domain, reason = 'failure') {
  const b = ensureTenant(tenantId)[domain];
  b.state = 'OPEN';
  b.lastTrip = now();
  b.failures += 1;
  b.reason = reason;
}

function reset(tenantId, domain) {
  const b = ensureTenant(tenantId)[domain];
  b.state = 'CLOSED';
  b.failures = 0;
  b.reason = null;
}

function recordFailure(tenantId, domain, reason = 'failure') {
  const b = ensureTenant(tenantId)[domain];
  b.failures += 1;
  if (b.failures >= DEFAULTS.failureThreshold) {
    trip(tenantId, domain, reason);
  }
}

function recordSuccess(tenantId, domain) {
  const b = current(tenantId, domain);
  if (b.state === 'HALF_OPEN' || b.state === 'OPEN') {
    reset(tenantId, domain);
  } else {
    b.failures = 0;
  }
}

function canProceed(tenantId, domain) {
  const b = current(tenantId, domain);
  return b.state !== 'OPEN';
}

function summary(tenantId = null) {
  if (tenantId) {
    const t = ensureTenant(tenantId);
    return { [tenantId]: t };
  }
  const res = {};
  breakers.forEach((v, k) => {
    res[k] = v;
  });
  return res;
}

function coldReset() {
  breakers.clear();
}

module.exports = {
  canProceed,
  recordFailure,
  recordSuccess,
  trip,
  reset,
  summary,
  coldReset,
};

const { randomUUID } = require('crypto');

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 50;

class ExecutionGate {
  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = DEFAULT_MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.store = new Map(); // gateId -> { data, ts, status }
  }

  prune() {
    const now = Date.now();
    for (const [gateId, entry] of this.store.entries()) {
      if (now - entry.ts > this.ttlMs) {
        entry.status = 'EXPIRED';
        this.store.set(gateId, entry);
      }
    }
    while (this.store.size > this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
  }

  submit(plan) {
    this.prune();
    const gateId = randomUUID();
    this.store.set(gateId, {
      data: plan,
      ts: Date.now(),
      status: 'PENDING',
    });
    this.prune();
    return gateId;
  }

  review(gateId, { approve, overrides } = {}) {
    this.prune();
    const entry = this.store.get(gateId);
    if (!entry) return null;
    if (entry.status === 'EXPIRED') return { gateId, status: 'EXPIRED' };
    entry.status = approve ? 'APPROVED' : 'REJECTED';
    if (overrides) entry.data = { ...entry.data, overrides };
    this.store.set(gateId, entry);
    return { gateId, status: entry.status };
  }

  get(gateId) {
    this.prune();
    const entry = this.store.get(gateId);
    if (!entry) return null;
    return {
      gateId,
      status: entry.status,
      data: entry.data,
    };
  }

  _debugForceExpire(gateId) {
    if (process.env.NODE_ENV !== 'test') return;
    const entry = this.store.get(gateId);
    if (!entry) return;
    entry.ts = Date.now() - this.ttlMs - 1000;
    this.store.set(gateId, entry);
  }

  clear() {
    if (process.env.NODE_ENV !== 'test') return;
    this.store.clear();
  }
}

module.exports = new ExecutionGate();

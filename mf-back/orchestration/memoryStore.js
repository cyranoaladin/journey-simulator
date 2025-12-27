/**
 * In-memory store (volatile) for recent orchestration runs.
 * - Indexed by runId
 * - TTL-based eviction (default 10 minutes)
 * - Simple size cap FIFO (default 50)
 */
const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 50;

class MemoryStore {
  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = DEFAULT_MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.tenants = new Map(); // tenantId -> { store: Map, order: [] }
    this.evictions = 0;
  }

  ensureTenant(tenantId) {
    const key = tenantId || 'default';
    if (!this.tenants.has(key)) {
      this.tenants.set(key, { store: new Map(), order: [] });
    }
    return this.tenants.get(key);
  }

  pruneTenant(tenantId) {
    const tenant = this.ensureTenant(tenantId);
    const now = Date.now();
    const { store, order } = tenant;
    while (order.length > 0) {
      const runId = order[0];
      const entry = store.get(runId);
      if (!entry || now - entry.ts > this.ttlMs) {
        order.shift();
        store.delete(runId);
        this.evictions += 1;
      } else {
        break;
      }
    }
    while (order.length > this.maxEntries) {
      const oldestKey = order.shift();
      store.delete(oldestKey);
      this.evictions += 1;
    }
  }

  get(runId, tenantId) {
    if (!runId) return null;
    const tenant = this.ensureTenant(tenantId);
    this.pruneTenant(tenantId);
    const entry = tenant.store.get(runId);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.ttlMs) {
      tenant.store.delete(runId);
      this.evictions += 1;
      return null;
    }
    return entry.data;
  }

  save(runId, data, tenantId) {
    if (!runId) return;
    const tenant = this.ensureTenant(tenantId);
    const { store, order } = tenant;
    if (!store.has(runId)) order.push(runId);
    store.set(runId, { data, ts: Date.now() });
    this.pruneTenant(tenantId);
  }

  values(tenantId) {
    this.pruneTenant(tenantId);
    const tenant = this.ensureTenant(tenantId);
    return Array.from(tenant.store.values());
  }

  summary() {
    const byTenant = {};
    this.tenants.forEach((tenant, id) => {
      this.pruneTenant(id);
      byTenant[id] = tenant.store.size;
    });
    const entries = Object.values(byTenant).reduce((a, b) => a + b, 0);
    return {
      entries,
      byTenant,
      ttlMs: this.ttlMs,
      maxEntries: this.maxEntries,
      evictions: this.evictions,
    };
  }

  clear() {
    this.tenants.clear();
    this.evictions = 0;
  }
}

module.exports = new MemoryStore();

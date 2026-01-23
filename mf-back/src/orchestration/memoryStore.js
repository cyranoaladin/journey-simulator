/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * In-memory store (volatile) for recent orchestration runs.
 * - Indexed by runId
 * - TTL-based eviction (default 10 minutes)
 * - Simple size cap FIFO (default 50)
 */
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 50;
const PERSIST_PATH = path.resolve(__dirname, '../memory/memoryStore.json');

class MemoryStore {
  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = DEFAULT_MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.tenants = new Map(); // tenantId -> { store: Map, order: [] }
    this.evictions = 0;
    this.loadFromDisk();
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
    this.persist();
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
    this.persist();
  }

  persist() {
    try {
      const payload = {};
      this.tenants.forEach((tenant, id) => {
        payload[id] = {
          order: tenant.order,
          entries: Array.from(tenant.store.entries()).map(([runId, value]) => [runId, value]),
        };
      });
      fs.mkdirSync(path.dirname(PERSIST_PATH), { recursive: true });
      fs.writeFileSync(PERSIST_PATH, JSON.stringify(payload), 'utf8');
    } catch (err) {
      // silent failure; non-blocking
    }
  }

  loadFromDisk() {
    try {
      if (!fs.existsSync(PERSIST_PATH)) return;
      const raw = fs.readFileSync(PERSIST_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      Object.entries(parsed || {}).forEach(([tenantId, data]) => {
        const store = new Map(data.entries || []);
        const order = Array.isArray(data.order) ? data.order : [];
        this.tenants.set(tenantId, { store, order });
      });
    } catch (err) {
      // ignore load errors
    }
  }
}

module.exports = new MemoryStore();

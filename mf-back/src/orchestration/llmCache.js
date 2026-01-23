/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const crypto = require('node:crypto');

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 200;

class LLMCache {
  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.tenants = new Map(); // tenantId -> { store: Map, order: [] }
    this.evictions = 0;
  }

  tenantKey(tenantId) {
    return tenantId || 'default';
  }

  ensureTenant(tenantId) {
    const key = this.tenantKey(tenantId);
    if (!this.tenants.has(key)) {
      this.tenants.set(key, { store: new Map(), order: [] });
    }
    return this.tenants.get(key);
  }

  static stableHash(obj) {
    const json = JSON.stringify(obj, Object.keys(obj).sort());
    return crypto.createHash('sha256').update(json).digest('hex');
  }

  makeKey({ agentId, intent, prompt, constraints, ragSignature, journeySignature, preset }) {
    const base = {
      agentId,
      intent,
      constraints: constraints || {},
      rag: ragSignature || null,
      journey: journeySignature || null,
      preset: preset || null,
      prompt,
    };
    return LLMCache.stableHash(base);
  }

  pruneTenant(tenantId) {
    const tenant = this.ensureTenant(tenantId);
    const now = Date.now();
    while (tenant.order.length > 0) {
      const key = tenant.order[0];
      const entry = tenant.store.get(key);
      if (!entry || now - entry.ts > this.ttlMs) {
        tenant.order.shift();
        tenant.store.delete(key);
        this.evictions += 1;
      } else {
        break;
      }
    }
    while (tenant.order.length > this.maxEntries) {
      const oldest = tenant.order.shift();
      tenant.store.delete(oldest);
      this.evictions += 1;
    }
  }

  get(key, tenantId) {
    const tenant = this.ensureTenant(tenantId);
    this.pruneTenant(tenantId);
    const entry = tenant.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.ttlMs) {
      tenant.store.delete(key);
      this.evictions += 1;
      return null;
    }
    return entry.value;
  }

  set(key, value, { ttlMs, tenantId } = {}) {
    const tenant = this.ensureTenant(tenantId);
    const ts = Date.now();
    const ttl = ttlMs || this.ttlMs;
    if (!tenant.store.has(key)) tenant.order.push(key);
    tenant.store.set(key, { value, ts, ttl });
    this.pruneTenant(tenantId);
  }

  summary() {
    const byTenant = {};
    this.tenants.forEach((tenantData, tenantId) => {
      this.pruneTenant(tenantId);
      byTenant[tenantId] = tenantData.store.size;
    });
    const entries = Object.values(byTenant).reduce((a, b) => a + b, 0);
    return { entries, ttlMs: this.ttlMs, maxEntries: this.maxEntries, byTenant, evictions: this.evictions };
  }

  reset() {
    this.tenants.clear();
    this.evictions = 0;
  }
}

module.exports = new LLMCache();

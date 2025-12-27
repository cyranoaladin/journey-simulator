const crypto = require('node:crypto');

const DEFAULT_TTL_MS = Number(process.env.IDEMPOTENCY_TTL_MS || 10 * 60 * 1000);
const DEFAULT_MAX = Number(process.env.IDEMPOTENCY_MAX_ENTRIES || 100);

let TTL_MS = DEFAULT_TTL_MS;
let MAX_ENTRIES = DEFAULT_MAX;

const tenants = new Map(); // tenantId -> { store: Map, order: [] }
let evictions = 0;

const now = () => Date.now();

const ensureTenant = (tenantId = 'default') => {
  const key = tenantId || 'default';
  if (!tenants.has(key)) tenants.set(key, { store: new Map(), order: [] });
  return tenants.get(key);
};

function pruneTenant(tenantId = 'default') {
  const tenant = ensureTenant(tenantId);
  const cutoff = now() - TTL_MS;
  while (tenant.order.length > 0) {
    const key = tenant.order[0];
    const entry = tenant.store.get(key);
    if (!entry || entry.ts < cutoff) {
      tenant.order.shift();
      tenant.store.delete(key);
      evictions += 1;
    } else {
      break;
    }
  }
  while (tenant.order.length > MAX_ENTRIES) {
    const oldest = tenant.order.shift();
    tenant.store.delete(oldest);
    evictions += 1;
  }
}

function set(key, value, tenantId = 'default') {
  pruneTenant(tenantId);
  const tenant = ensureTenant(tenantId);
  if (!tenant.store.has(key)) {
    tenant.order.push(key);
  }
  tenant.store.set(key, { value, ts: now() });
  pruneTenant(tenantId);
}

function get(key, tenantId = 'default') {
  pruneTenant(tenantId);
  const tenant = ensureTenant(tenantId);
  const entry = tenant.store.get(key);
  if (!entry) return undefined;
  return entry.value;
}

function has(key, tenantId = 'default') {
  pruneTenant(tenantId);
  const tenant = ensureTenant(tenantId);
  return tenant.store.has(key);
}

function clear() {
  tenants.clear();
  evictions = 0;
}

function stableHash(payload) {
  const visit = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') return val;
    if (Array.isArray(val)) return val.map(visit);
    if (typeof val === 'object') {
      const keys = Object.keys(val).sort();
      const obj = {};
      keys.forEach((k) => {
        if (['timestamp', 'ts', 'latencyMs'].includes(k)) return;
        obj[k] = visit(val[k]);
      });
      return obj;
    }
    return String(val);
  };
  const normalized = visit(payload);
  const serialized = JSON.stringify(normalized);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

function _debugSetTTL(ms) {
  TTL_MS = ms;
}

function _debugSetMax(n) {
  MAX_ENTRIES = n;
}

function summary() {
  const byTenant = {};
  tenants.forEach((t, id) => {
    pruneTenant(id);
    byTenant[id] = t.order.length;
  });
  const entriesStored = Object.values(byTenant).reduce((a, b) => a + b, 0);
  return { entriesStored, maxEntries: MAX_ENTRIES, byTenant, evictions };
}

module.exports = {
  set,
  get,
  has,
  clear,
  stableHash,
  _debugSetTTL,
  _debugSetMax,
  summary,
};

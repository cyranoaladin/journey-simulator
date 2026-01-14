/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const MAX_ENTRIES = 100;
const TTL_MS = 1000 * 60 * 60; // 1h TTL simple in-memory

const tenants = new Map(); // tenantId -> array
let evictions = 0;
let totalEntries = 0;

function ensureTenant(tenantId = 'default') {
  const key = tenantId || 'default';
  if (!tenants.has(key)) tenants.set(key, []);
  return tenants.get(key);
}

function prune(tenantId = 'default', now = Date.now()) {
  const store = ensureTenant(tenantId);
  const filtered = store.filter((entry) => now - entry.ts <= TTL_MS);
  evictions += store.length - filtered.length;
  let result = filtered;
  if (filtered.length > MAX_ENTRIES) {
    evictions += filtered.length - MAX_ENTRIES;
    result = filtered.slice(filtered.length - MAX_ENTRIES);
  }
  tenants.set(tenantId || 'default', result);
}

function add(entry, tenantId = 'default') {
  const now = Date.now();
  const store = ensureTenant(tenantId);
  prune(tenantId, now);
  store.push({ ...entry, ts: entry.timestamp || entry.ts || now, tenantId });
  prune(tenantId, now);
  totalEntries += 1;
}

function entries(tenantId = null) {
  if (tenantId) {
    prune(tenantId);
    return ensureTenant(tenantId).slice();
  }
  // all tenants
  const all = [];
  tenants.forEach((store, id) => {
    prune(id);
    all.push(...store);
  });
  return all;
}

function clear() {
  tenants.clear();
  evictions = 0;
  totalEntries = 0;
}

function summary() {
  const byTenant = {};
  tenants.forEach((store, id) => {
    prune(id);
    byTenant[id] = store.length;
  });
  const entriesStored = Math.max(totalEntries, entries().length);
  return { enabled: true, entriesStored, maxEntries: MAX_ENTRIES, byTenant, evictions };
}

module.exports = {
  add,
  entries,
  clear,
  summary,
  MAX_ENTRIES,
  TTL_MS,
};

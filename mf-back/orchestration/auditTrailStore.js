const MAX_ENTRIES = 100;
const TTL_MS = 1000 * 60 * 60; // 1h TTL simple in-memory

let store = [];

function prune(now = Date.now()) {
  store = store.filter((entry) => now - entry.ts <= TTL_MS);
  if (store.length > MAX_ENTRIES) {
    store = store.slice(store.length - MAX_ENTRIES);
  }
}

function add(entry) {
  const now = Date.now();
  prune(now);
  store.push({ ...entry, ts: entry.timestamp || entry.ts || now });
  prune(now);
}

function entries() {
  prune();
  return store.slice();
}

function clear() {
  store = [];
}

function summary() {
  prune();
  return { enabled: true, entriesStored: store.length, maxEntries: MAX_ENTRIES };
}

module.exports = {
  add,
  entries,
  clear,
  summary,
  MAX_ENTRIES,
  TTL_MS,
};

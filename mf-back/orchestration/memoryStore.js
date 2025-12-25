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
    this.store = new Map(); // runId -> { data, ts }
  }

  prune() {
    const now = Date.now();
    for (const [runId, entry] of this.store.entries()) {
      if (now - entry.ts > this.ttlMs) {
        this.store.delete(runId);
      }
    }
    while (this.store.size > this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
  }

  get(runId) {
    if (!runId) return null;
    this.prune();
    const entry = this.store.get(runId);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.ttlMs) {
      this.store.delete(runId);
      return null;
    }
    return entry.data;
  }

  save(runId, data) {
    if (!runId) return;
    this.store.set(runId, { data, ts: Date.now() });
    this.prune();
  }
}

module.exports = new MemoryStore();

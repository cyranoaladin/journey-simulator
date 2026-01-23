/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const MAX_WINDOW = 100;

class MetricsStore {
  constructor(maxWindow = MAX_WINDOW) {
    this.maxWindow = maxWindow;
    this.tenants = new Map(); // tenantId -> entries[]
    this.evictions = 0;
  }

  ensureTenant(tenantId = 'default') {
    const key = tenantId || 'default';
    if (!this.tenants.has(key)) this.tenants.set(key, []);
    return this.tenants.get(key);
  }

  computeDisabledRate(runResult) {
    const enabled = runResult?.agentsMeta?.enabled?.length || 0;
    const disabled = runResult?.agentsMeta?.disabled?.length || 0;
    const total = enabled + disabled;
    if (total === 0) return 0;
    return disabled / total;
  }

  record(runResult, tenantId = 'default') {
    if (!runResult) return;
    const entry = {
      durationMs: runResult.metrics?.durationMs || 0,
      status: runResult.decision?.overallStatus || 'WARN',
      idempotent: Boolean(runResult.systemStatus?.idempotent),
      dryRun: runResult.ops?.execution?.mode !== 'REAL',
      ragUsed: runResult.metrics?.ragUsed || false,
      llmReal: runResult.ops?.llm?.mode === 'openai',
      realBlocked: runResult.ops?.execution?.blocked || false,
      llmCacheHits: runResult.productMetrics?.llmCacheHits || 0,
      llmCalls: runResult.ops?.llm?.calls || 0,
      llmDedup: runResult.ops?.llm?.deduplicatedCalls || 0,
      costUsd: runResult.ops?.costs?.estimatedUsd || 0,
      agentsDisabledRate: this.computeDisabledRate(runResult),
      timestamp: Date.now(),
      preset: runResult.presetMeta?.name || null,
      tenantId: tenantId || 'default',
      cbOpen: Object.values(runResult.systemStatus?.circuitBreakers || {}).some((c) => c?.state && c.state !== 'CLOSED'),
      queueQueued: runResult.ops?.concurrency?.queued || 0,
      queueShed: Boolean(runResult.ops?.concurrency?.shed),
      coldStart: Boolean(runResult.systemStatus?.runtime?.coldStart),
      fallbackCount: (runResult.ops?.fallbacks || []).length,
      rateLimitCount: (runResult.ops?.concurrency?.shed ? 1 : 0) + (runResult.ops?.execution?.blocked ? 1 : 0),
    };
    const bucket = this.ensureTenant(tenantId);
    bucket.push(entry);
    if (bucket.length > this.maxWindow) {
      bucket.shift();
      this.evictions += 1;
    }
  }

  computeAggregate(items) {
    const count = items.length || 1;
    const percentile = (arr, p) => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
      return sorted[idx];
    };
    const durations = items.map((e) => e.durationMs);
    const statusCounts = items.reduce(
      (acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      },
      { OK: 0, WARN: 0, FAIL: 0, TIMEOUT: 0 }
    );
    const idempotentCount = items.filter((e) => e.idempotent).length;
    const dryRunCount = items.filter((e) => e.dryRun).length;
    const ragCount = items.filter((e) => e.ragUsed).length;
    const llmRealCount = items.filter((e) => e.llmReal).length;
    const realBlockedCount = items.filter((e) => e.realBlocked).length;
    const llmCacheHits = items.reduce((acc, e) => acc + (e.llmCacheHits || 0), 0);
    const llmCalls = items.reduce((acc, e) => acc + (e.llmCalls || 0), 0);
    const llmDedup = items.reduce((acc, e) => acc + (e.llmDedup || 0), 0);
    const costTotal = items.reduce((acc, e) => acc + (e.costUsd || 0), 0);
    const cbOpenCount = items.filter((e) => e.cbOpen).length;
    const queueQueuedAvg = items.reduce((acc, e) => acc + (e.queueQueued || 0), 0) / count;
    const queueShedCount = items.filter((e) => e.queueShed).length;
    const coldStartCount = items.filter((e) => e.coldStart).length;
    const agentsDisabledRateAvg =
      items.reduce((acc, e) => acc + (e.agentsDisabledRate || 0), 0) / count;
    const fallbackCountTotal = items.reduce((acc, e) => acc + (e.fallbackCount || 0), 0);
    const rateLimitCountTotal = items.reduce((acc, e) => acc + (e.rateLimitCount || 0), 0);
    const presetUsage = items.reduce((acc, e) => {
      if (e.preset) acc[e.preset] = (acc[e.preset] || 0) + 1;
      return acc;
    }, {});

    return {
      window: items.length,
      latency: {
        p95: percentile(durations, 95),
        p99: percentile(durations, 99),
      },
      rates: {
        warn: statusCounts.WARN / count,
        failTimeout: (statusCounts.FAIL + statusCounts.TIMEOUT) / count,
        idempotent: idempotentCount / count,
        dryRun: dryRunCount / count,
        rag: ragCount / count,
        llmReal: llmRealCount / count,
        realBlocked: realBlockedCount / count,
        agentsDisabled: agentsDisabledRateAvg,
        cbOpen: cbOpenCount / count,
        cbOpen: cbOpenCount / count,
        queueShed: queueShedCount / count,
      },
      counts: {
        fallback_count: fallbackCountTotal,
        rate_limit_count: rateLimitCountTotal,
        timeout_count: statusCounts.TIMEOUT,
      },
      llm: {
        cacheHitRate: llmCalls > 0 ? llmCacheHits / llmCalls : 0,
        dedupCount: llmDedup,
        calls: llmCalls,
        costTotal,
      },
      concurrency: {
        queueAvg: queueQueuedAvg,
        shedRate: queueShedCount / count,
      },
      runtime: {
        coldStartRate: coldStartCount / count,
      },
      statusCounts,
      presetUsage,
    };
  }

  summary(tenantId = null) {
    if (tenantId) {
      const items = this.ensureTenant(tenantId).slice(-this.maxWindow);
      return { tenantId, ...this.computeAggregate(items) };
    }
    // all tenants combined
    const combined = [];
    this.tenants.forEach((entries) => combined.push(...entries.slice(-this.maxWindow)));
    return { tenantId: 'all', ...this.computeAggregate(combined) };
  }

  summaryByTenant() {
    const res = {};
    this.tenants.forEach((_, id) => {
      res[id] = this.summary(id);
    });
    return res;
  }

  memoryPressure() {
    const total = Array.from(this.tenants.values()).reduce((acc, e) => acc + e.length, 0);
    const pressureRatio = total / (this.maxWindow * Math.max(this.tenants.size || 1, 1));
    if (pressureRatio > 0.9) return 'HIGH';
    if (pressureRatio > 0.6) return 'MEDIUM';
    return 'LOW';
  }

  reset() {
    this.tenants.clear();
    this.evictions = 0;
  }
}

module.exports = new MetricsStore();

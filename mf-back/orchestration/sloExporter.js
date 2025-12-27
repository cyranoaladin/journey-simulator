const metricsStore = require('./metricsStore');
const { listSLOs } = require('./sloRegistry');
const alertingEngine = require('./alertingEngine');

/**
 * Export a stable JSON snapshot of SLOs, metrics, and alerts.
 * Used for go-live validation and audit trails.
 */
function exportSloSnapshot() {
  const timestamp = new Date().toISOString();
  const metricsSummaryAll = metricsStore.summary();
  const metricsByTenant = metricsStore.summaryByTenant();
  const slos = listSLOs();
  const alertsAll = alertingEngine.evaluate({ ...metricsSummaryAll, tenantId: 'all' });
  const recentAlerts = alertingEngine.recentAlerts(10);

  // Build tenant-specific summaries
  const tenants = {};
  Object.entries(metricsByTenant).forEach(([tenantId, ms]) => {
    const tenantAlerts = alertingEngine.evaluate({ ...ms, tenantId });
    tenants[tenantId] = {
      runs: ms.window || 0,
      latency: {
        p50: ms.latency?.p50 || 0,
        p95: ms.latency?.p95 || 0,
        p99: ms.latency?.p99 || 0,
      },
      rates: {
        warn: ms.rates?.warn || 0,
        fail: ms.rates?.fail || 0,
        timeout: ms.rates?.timeout || 0,
        idempotent: ms.rates?.idempotent || 0,
        dryRun: ms.rates?.dryRun || 0,
        realBlocked: ms.rates?.realBlocked || 0,
      },
      statusCounts: ms.statusCounts || {},
      alerts: tenantAlerts.map((a) => ({
        level: a.level,
        sloId: a.sloId,
        message: a.message,
        currentValue: a.currentValue,
        target: a.target,
      })),
    };
  });

  // Aggregate cost metrics if available
  const costMetrics = {
    usd: 0,
    budget: 'OK',
  };
  if (metricsSummaryAll.cost) {
    costMetrics.usd = metricsSummaryAll.cost.estimatedUsd || 0;
    costMetrics.budget = metricsSummaryAll.cost.status || 'OK';
  }

  // LLM metrics
  const llmCache = require('./llmCache');
  const llmCacheSummary = llmCache.summary();
  const llmMetrics = {
    calls: metricsSummaryAll.llmCalls || 0,
    cacheHitRate: llmCacheSummary.hitRate || 0,
    cacheSize: llmCacheSummary.size || 0,
  };

  const snapshot = {
    timestamp,
    window: metricsSummaryAll.window || 0,
    latency: {
      p50: metricsSummaryAll.latency?.p50 || 0,
      p95: metricsSummaryAll.latency?.p95 || 0,
      p99: metricsSummaryAll.latency?.p99 || 0,
    },
    rates: {
      warn: metricsSummaryAll.rates?.warn || 0,
      fail: metricsSummaryAll.rates?.fail || 0,
      timeout: metricsSummaryAll.rates?.timeout || 0,
      idempotent: metricsSummaryAll.rates?.idempotent || 0,
      dryRun: metricsSummaryAll.rates?.dryRun || 0,
      realBlocked: metricsSummaryAll.rates?.realBlocked || 0,
    },
    cost: costMetrics,
    llm: llmMetrics,
    statusCounts: metricsSummaryAll.statusCounts || {},
    slos: slos.map((slo) => ({
      id: slo.id,
      description: slo.description,
      target: slo.target,
      severity: slo.severity,
    })),
    alerts: {
      recent: recentAlerts.map((a) => ({
        level: a.level,
        sloId: a.sloId,
        message: a.message,
        currentValue: a.currentValue,
        target: a.target,
        timestamp: a.timestamp,
      })),
      active: alertsAll.map((a) => ({
        level: a.level,
        sloId: a.sloId,
        message: a.message,
        currentValue: a.currentValue,
        target: a.target,
      })),
    },
    tenants,
  };

  return snapshot;
}

module.exports = {
  exportSloSnapshot,
};

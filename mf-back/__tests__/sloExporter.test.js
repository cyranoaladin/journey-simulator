const { exportSloSnapshot } = require('../orchestration/sloExporter');
const metricsStore = require('../orchestration/metricsStore');
const alertingEngine = require('../orchestration/alertingEngine');

describe('sloExporter', () => {
  beforeEach(() => {
    metricsStore.reset();
    alertingEngine.reset();
  });

  it('exports SLO snapshot with all required fields', () => {
    const snapshot = exportSloSnapshot();

    expect(snapshot).toBeDefined();
    expect(snapshot.timestamp).toBeDefined();
    expect(typeof snapshot.timestamp).toBe('string');
    expect(snapshot.window).toBeGreaterThanOrEqual(0);
    expect(snapshot.latency).toBeDefined();
    expect(snapshot.latency.p50).toBeGreaterThanOrEqual(0);
    expect(snapshot.latency.p95).toBeGreaterThanOrEqual(0);
    expect(snapshot.latency.p99).toBeGreaterThanOrEqual(0);
    expect(snapshot.rates).toBeDefined();
    expect(typeof snapshot.rates.warn).toBe('number');
    expect(typeof snapshot.rates.fail).toBe('number');
    expect(snapshot.cost).toBeDefined();
    expect(snapshot.cost.usd).toBeGreaterThanOrEqual(0);
    expect(snapshot.cost.budget).toBeDefined();
    expect(snapshot.llm).toBeDefined();
    expect(snapshot.llm.calls).toBeGreaterThanOrEqual(0);
    expect(snapshot.llm.cacheHitRate).toBeGreaterThanOrEqual(0);
    expect(snapshot.slos).toBeDefined();
    expect(Array.isArray(snapshot.slos)).toBe(true);
    expect(snapshot.alerts).toBeDefined();
    expect(snapshot.alerts.recent).toBeDefined();
    expect(snapshot.alerts.active).toBeDefined();
    expect(snapshot.tenants).toBeDefined();
    expect(typeof snapshot.tenants).toBe('object');
  });

  it('includes tenant-specific data in snapshot', () => {
    // Record some metrics for a tenant
    metricsStore.record({
      decision: { overallStatus: 'OK' },
      metrics: { durationMs: 100 },
      ops: { execution: { mode: 'DRY_RUN' } },
      systemStatus: { idempotent: false },
    }, 'test-tenant');

    const snapshot = exportSloSnapshot();

    expect(snapshot.tenants['test-tenant']).toBeDefined();
    expect(snapshot.tenants['test-tenant'].runs).toBeGreaterThan(0);
    expect(snapshot.tenants['test-tenant'].latency).toBeDefined();
    expect(snapshot.tenants['test-tenant'].rates).toBeDefined();
    expect(snapshot.tenants['test-tenant'].alerts).toBeDefined();
  });

  it('produces stable JSON structure', () => {
    const snapshot1 = exportSloSnapshot();
    const snapshot2 = exportSloSnapshot();

    // Structure should be consistent
    expect(Object.keys(snapshot1)).toEqual(Object.keys(snapshot2));
    expect(snapshot1.slos.length).toBe(snapshot2.slos.length);
  });
});

/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { listSLOs } = require('./sloRegistry');

const MAX_ALERTS = 50;

class AlertingEngine {
  constructor() {
    this.history = [];
    this.slos = listSLOs();
  }

  evaluate(metricsSummary) {
    if (!metricsSummary || !metricsSummary.rates || !metricsSummary.latency) return [];
    const alerts = [];
    const sloMap = Object.fromEntries(this.slos.map((s) => [s.id, s]));

    const pushIfExceeds = (id, value) => {
      const slo = sloMap[id];
      if (!slo) return;
      if (value > slo.target) {
        alerts.push({
          level: slo.severity,
          sloId: id,
          message: `${id} exceeded target`,
          currentValue: value,
          target: slo.target,
          tenantId: metricsSummary.tenantId || 'all',
        });
      }
    };

    pushIfExceeds('orchestration_latency_p95', metricsSummary.latency.p95);
    pushIfExceeds('status_warn_rate', metricsSummary.rates.warn);
    pushIfExceeds('status_fail_timeout_rate', metricsSummary.rates.failTimeout);
    pushIfExceeds('idempotent_replay_rate', metricsSummary.rates.idempotent);
    pushIfExceeds('dry_run_rate', metricsSummary.rates.dryRun);
    pushIfExceeds('agents_disabled_rate', metricsSummary.rates.agentsDisabled);
    if (metricsSummary.rates.rag < 0.5) {
      pushIfExceeds('rag_usage_rate', 1); // triggers if RAG is low
    }
    // llm_usage_rate: alerts if no real LLM used
    if (metricsSummary.rates.llmReal === 0) {
      pushIfExceeds('llm_usage_rate', 1);
    }
    pushIfExceeds('real_block_rate', metricsSummary.rates.realBlocked);
    if (metricsSummary.llm?.costTotal && metricsSummary.llm.costTotal > 0.05) {
      alerts.push({
        level: 'WARN',
        sloId: 'llm_cost_per_run',
        message: 'LLM cost total high over window',
        currentValue: metricsSummary.llm.costTotal,
        target: 0.05,
        tenantId: metricsSummary.tenantId || 'all',
      });
    }
    if (metricsSummary.llm?.calls && metricsSummary.llm.calls > 10) {
      alerts.push({
        level: 'INFO',
        sloId: 'llm_calls_per_run',
        message: 'LLM calls per run high',
        currentValue: metricsSummary.llm.calls,
        target: 10,
        tenantId: metricsSummary.tenantId || 'all',
      });
    }
    if (metricsSummary.rates.cbOpen > 0.1) {
      alerts.push({
        level: 'WARN',
        sloId: 'circuit_breaker_open_rate',
        message: 'Circuit breaker open too often',
        currentValue: metricsSummary.rates.cbOpen,
        target: 0.1,
        tenantId: metricsSummary.tenantId || 'all',
      });
    }
    if (metricsSummary.concurrency?.shedRate > 0.05) {
      alerts.push({
        level: 'WARN',
        sloId: 'queue_shed_rate',
        message: 'Concurrency shedding detected',
        currentValue: metricsSummary.concurrency.shedRate,
        target: 0.05,
        tenantId: metricsSummary.tenantId || 'all',
      });
    }
    if (metricsSummary.runtime?.coldStartRate > 0.2) {
      alerts.push({
        level: 'INFO',
        sloId: 'cold_start_rate',
        message: 'Cold start frequent',
        currentValue: metricsSummary.runtime.coldStartRate,
        target: 0.2,
        tenantId: metricsSummary.tenantId || 'all',
      });
    }

    alerts.forEach((a) => this.pushAlert(a));
    return alerts;
  }

  pushAlert(alert) {
    this.history.push({ ...alert, timestamp: Date.now() });
    if (this.history.length > MAX_ALERTS) this.history.shift();
  }

  recentAlerts(limit = 10) {
    return this.history.slice(-limit);
  }

  reset() {
    this.history = [];
  }
}

module.exports = new AlertingEngine();

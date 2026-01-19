<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Metrics Model

## Overview

This document defines the metrics model for the Money Factory AI orchestration layer, based on the `metricsStore`, `sloRegistry`, and `alertingEngine` implementations.

**Purpose**: Provide a clear reference for SREs and observability engineers to understand available metrics and their mapping to Grafana dashboards.

**Last Updated**: 2025-12-26

---

## Metrics Categories

### 1. Latency Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `latency.p50` | 50th percentile latency | milliseconds | `metricsStore.summary().latency.p50` | - |
| `latency.p95` | 95th percentile latency | milliseconds | `metricsStore.summary().latency.p95` | < 500 ms |
| `latency.p99` | 99th percentile latency | milliseconds | `metricsStore.summary().latency.p99` | - |

**Grafana Query** (simulated Prometheus):

```
# Latency p95
mfai_orchestration_latency_p95{tenant="$tenant",env="$env"}

# Latency p99
mfai_orchestration_latency_p99{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (computeAggregate, percentile calculation)

---

### 2. Status Rate Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `rates.warn` | Rate of runs with WARN status | ratio (0-1) | `metricsStore.summary().rates.warn` | < 0.2 (20%) |
| `rates.fail` | Rate of runs with FAIL status | ratio (0-1) | `metricsStore.summary().rates.fail` | < 0.05 (5%) |
| `rates.timeout` | Rate of runs with TIMEOUT status | ratio (0-1) | `metricsStore.summary().rates.timeout` | < 0.05 (5%) |
| `rates.failTimeout` | Combined FAIL + TIMEOUT rate | ratio (0-1) | `metricsStore.summary().rates.failTimeout` | < 0.05 (5%) |

**Grafana Query**:

```
# WARN rate
mfai_orchestration_status_rate{status="WARN",tenant="$tenant",env="$env"}

# FAIL rate
mfai_orchestration_status_rate{status="FAIL",tenant="$tenant",env="$env"}

# TIMEOUT rate
mfai_orchestration_status_rate{status="TIMEOUT",tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (statusCounts aggregation)

---

### 3. Idempotent Replay Rate

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `rates.idempotent` | Rate of idempotent replays | ratio (0-1) | `metricsStore.summary().rates.idempotent` | < 0.1 (10%) |

**Grafana Query**:

```
mfai_orchestration_idempotent_replay_rate{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (idempotentCount / count)

---

### 4. Execution Mode Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `rates.dryRun` | Rate of DRY_RUN executions | ratio (0-1) | `metricsStore.summary().rates.dryRun` | > 0.95 (95%) |
| `rates.realBlocked` | Rate of REAL executions blocked | ratio (0-1) | `metricsStore.summary().rates.realBlocked` | < 0.1 (10%) |

**Grafana Query**:

```
# DRY_RUN rate
mfai_orchestration_execution_mode_rate{mode="DRY_RUN",tenant="$tenant",env="$env"}

# REAL blocked rate
mfai_orchestration_real_blocked_rate{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (dryRunCount, realBlockedCount)

---

### 5. Cost Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `cost.usd` | Estimated cost per run | USD | `metricsStore.summary().llm.costTotal / window` | < 0.05 USD |
| `cost.budget` | Budget status | string | `ops.costs.status` | OK / WARN / BLOCK |

**Grafana Query**:

```
# Cost per run
mfai_orchestration_cost_usd_per_run{tenant="$tenant",env="$env"}

# Total cost
sum(mfai_orchestration_cost_usd_per_run{tenant="$tenant",env="$env"}) by (tenant)
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (costTotal aggregation), `mf-back/orchestration/costModel.js`

---

### 6. LLM Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `llm.calls` | Total LLM calls | count | `metricsStore.summary().llm.calls` | < 10 per run |
| `llm.cacheHitRate` | LLM cache hit rate | ratio (0-1) | `metricsStore.summary().llm.cacheHitRate` | > 0.5 (50%) |
| `llm.dedupCount` | Deduplicated LLM calls | count | `metricsStore.summary().llm.dedupCount` | - |
| `rates.llmReal` | Rate of runs with real LLM (non-mock) | ratio (0-1) | `metricsStore.summary().rates.llmReal` | < 0.5 (50%) |

**Grafana Query**:

```
# LLM calls
mfai_orchestration_llm_calls_total{tenant="$tenant",env="$env"}

# Cache hit rate
mfai_orchestration_llm_cache_hit_rate{tenant="$tenant",env="$env"}

# LLM real usage rate
mfai_orchestration_llm_real_rate{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (llmCalls, llmCacheHits), `mf-back/orchestration/llmCache.js`

---

### 7. Quota Metrics (per Tenant)

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `quotas.runsInWindow` | Runs in current window | count | `tenantQuotaRegistry.evaluateQuota().snapshot.runsInWindow` | < maxRunsPerWindow |
| `quotas.llmCallsPerRun` | LLM calls per run | count | `tenantQuotaRegistry.evaluateQuota().snapshot.llmCallsPerRun` | < maxLLMCallsPerRun |
| `quotas.costWindowUsd` | Cost in current window | USD | `tenantQuotaRegistry.evaluateQuota().snapshot.costWindowUsd` | < budgetUsdPerWindow |

**Grafana Query**:

```
# Quota usage
mfai_orchestration_quota_usage{tenant="$tenant",quota="runs",env="$env"}

# Quota limit
mfai_orchestration_quota_limit{tenant="$tenant",quota="runs",env="$env"}
```

**Code Reference**: `mf-back/orchestration/tenantQuotaRegistry.js`

---

### 8. Web3 Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `web3.blockRate` | Rate of Web3 actions blocked | ratio (0-1) | `systemStatus.web3.level === 'BLOCK'` | - |
| `web3.pipeline.state` | Current Web3 pipeline state | string | `systemStatus.web3Pipeline.state` | - |

**Grafana Query**:

```
# Web3 block rate
mfai_orchestration_web3_block_rate{tenant="$tenant",env="$env"}

# Web3 pipeline state
mfai_orchestration_web3_pipeline_state{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/web3Guards.js`, `mf-back/orchestration/web3Pipeline.js`

---

### 9. Kill Switch Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `killSwitch.activations` | Kill switch activation count | count | `systemStatus.killSwitch.active === true` | 0 (should not activate) |
| `killSwitch.triggeredBy` | Kill switch trigger source | string | `systemStatus.killSwitch.triggeredBy` | - |

**Grafana Query**:

```
# Kill switch activations
mfai_orchestration_kill_switch_activations_total{tenant="$tenant",env="$env"}

# Kill switch active
mfai_orchestration_kill_switch_active{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/killSwitch.js`

---

### 10. Agent Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `rates.agentsDisabled` | Rate of disabled agents | ratio (0-1) | `metricsStore.summary().rates.agentsDisabled` | < 0.2 (20%) |
| `agents.count` | Number of agents executed | count | `agents.length` | - |

**Grafana Query**:

```
# Agents disabled rate
mfai_orchestration_agents_disabled_rate{tenant="$tenant",env="$env"}

# Agents count
mfai_orchestration_agents_count{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (computeDisabledRate)

---

### 11. RAG Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `rates.rag` | Rate of runs with RAG active | ratio (0-1) | `metricsStore.summary().rates.rag` | > 0.5 (50%) |

**Grafana Query**:

```
mfai_orchestration_rag_usage_rate{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (ragCount)

---

### 12. Circuit Breaker Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `rates.cbOpen` | Rate of runs with circuit breaker open | ratio (0-1) | `metricsStore.summary().rates.cbOpen` | < 0.1 (10%) |

**Grafana Query**:

```
mfai_orchestration_circuit_breaker_open_rate{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (cbOpenCount)

---

### 13. Concurrency Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `concurrency.queueAvg` | Average queue depth | count | `metricsStore.summary().concurrency.queueAvg` | - |
| `concurrency.shedRate` | Rate of load shedding | ratio (0-1) | `metricsStore.summary().concurrency.shedRate` | < 0.05 (5%) |

**Grafana Query**:

```
# Queue depth
mfai_orchestration_concurrency_queue_avg{tenant="$tenant",env="$env"}

# Shed rate
mfai_orchestration_concurrency_shed_rate{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (queueQueuedAvg, queueShedCount)

---

### 14. Runtime Metrics

| Metric | Description | Unit | Source | SLO Target |
|--------|-------------|------|--------|------------|
| `runtime.coldStartRate` | Rate of cold starts | ratio (0-1) | `metricsStore.summary().runtime.coldStartRate` | < 0.2 (20%) |

**Grafana Query**:

```
mfai_orchestration_cold_start_rate{tenant="$tenant",env="$env"}
```

**Code Reference**: `mf-back/orchestration/metricsStore.js` (coldStartCount)

---

## Metrics Aggregation

### By Tenant

All metrics can be filtered by `tenant` variable:

- `tenant="default"` (default tenant)
- `tenant="tenant-A"` (specific tenant)
- `tenant="all"` (aggregate across all tenants)

### By Preset

Metrics can be filtered by `preset` variable:

- `preset="audit-dao"`
- `preset="product-onboarding"`
- `preset="investor-diligence"`

### By Environment

Metrics can be filtered by `env` variable:

- `env="DEV"`
- `env="STAGING"`
- `env="PROD"`

---

## Data Source

**Current Implementation**: In-memory `metricsStore` with sliding window (100 runs by default).

**Grafana Integration**:

- **Option 1**: Export metrics to Prometheus via `/metrics` endpoint (to be implemented)
- **Option 2**: Use JSON datasource with `sloExporter.exportSloSnapshot()` output
- **Option 3**: Simulated Prometheus queries (for template purposes)

**Note**: The Grafana dashboard template uses simulated Prometheus queries. In production, these should be replaced with actual Prometheus queries or JSON datasource queries.

---

## SLO Targets Summary

| SLO ID | Target | Severity |
|--------|--------|----------|
| `orchestration_latency_p95` | < 500 ms | WARN |
| `status_warn_rate` | < 0.2 (20%) | INFO |
| `status_fail_timeout_rate` | < 0.05 (5%) | CRITICAL |
| `idempotent_replay_rate` | < 0.1 (10%) | INFO |
| `dry_run_rate` | > 0.95 (95%) | INFO |
| `real_block_rate` | < 0.1 (10%) | WARN |
| `llm_cost_per_run` | < 0.05 USD | WARN |
| `llm_calls_per_run` | < 10 | INFO |
| `circuit_breaker_open_rate` | < 0.1 (10%) | WARN |
| `queue_shed_rate` | < 0.05 (5%) | WARN |
| `cold_start_rate` | < 0.2 (20%) | INFO |

**Code Reference**: `mf-back/orchestration/sloRegistry.js`

---

## Code Mapping

| Metric Category | Primary File | Secondary Files |
|-----------------|-------------|-----------------|
| Latency | `metricsStore.js` | `zynoVerticalSlice.js` |
| Status Rates | `metricsStore.js` | `zynoVerticalSlice.js` |
| Cost | `metricsStore.js`, `costModel.js` | `zynoVerticalSlice.js` |
| LLM | `metricsStore.js`, `llmCache.js` | `llmClient.js` |
| Quotas | `tenantQuotaRegistry.js` | `zynoVerticalSlice.js` |
| Web3 | `web3Guards.js`, `web3Pipeline.js` | `zynoVerticalSlice.js` |
| Kill Switch | `killSwitch.js` | `zynoVerticalSlice.js` |
| Circuit Breaker | `circuitBreaker.js` | `metricsStore.js` |
| Concurrency | `concurrencyManager.js` | `metricsStore.js` |

---

## Next Steps

1. Implement Prometheus exporter endpoint (`/metrics`) for real-time metrics
2. Configure Prometheus to scrape the endpoint
3. Import Grafana dashboard template
4. Configure alerting rules based on SLO targets
5. Set up dashboards per tenant for multi-tenant visibility

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

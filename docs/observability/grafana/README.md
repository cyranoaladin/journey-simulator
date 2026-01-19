<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Grafana Dashboard - Money Factory AI Orchestration

## Overview

This directory contains a Grafana dashboard template for monitoring the Money Factory AI orchestration layer metrics and SLOs.

**Dashboard UID**: `mfai-orchestration`
**Schema Version**: 38
**Last Updated**: 2025-12-26

---

## Import Instructions

### Method 1: Grafana UI Import

1. Open Grafana (typically `http://localhost:3000` or your Grafana instance URL)
2. Navigate to **Dashboards** → **Import**
3. Click **Upload JSON file** or paste the contents of `GRAFANA_DASHBOARD.json`
4. Review the dashboard settings:
   - **Name**: "Money Factory AI - Orchestration Metrics"
   - **UID**: `mfai-orchestration` (or leave empty for auto-generation)
   - **Folder**: Choose a folder (e.g., "MF AI" or "Observability")
5. Click **Import**

### Method 2: Grafana API Import

```bash
# Using curl
curl -X POST \
  http://localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d @GRAFANA_DASHBOARD.json
```

### Method 3: Grafana Provisioning

Add to `grafana/provisioning/dashboards/dashboards.yml`:

```yaml
apiVersion: 1
providers:
  - name: 'mfai'
    orgId: 1
    folder: 'MF AI'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /path/to/docs/observability/grafana
```

---

## Data Source Configuration

### Current Status: Simulated Prometheus Queries

The dashboard template uses **simulated Prometheus queries** (e.g., `mfai_orchestration_latency_p95`). These queries are placeholders and will not work until:

1. **Prometheus exporter is implemented** (endpoint `/metrics` exposing Prometheus format)
2. **Prometheus is configured** to scrape the endpoint
3. **Grafana datasource** is configured to point to Prometheus

### Alternative: JSON Datasource

If Prometheus is not available, you can use a JSON datasource:

1. Install **JSON API Datasource** plugin in Grafana
2. Configure datasource to point to `sloExporter.exportSloSnapshot()` endpoint (to be implemented)
3. Update dashboard queries to use JSON datasource instead of Prometheus

### Metric Naming Convention

All metrics follow the pattern: `mfai_orchestration_<metric_name>{tenant="...",env="...",preset="..."}`

Examples:

- `mfai_orchestration_latency_p95`
- `mfai_orchestration_status_rate{status="WARN"}`
- `mfai_orchestration_llm_calls_total`
- `mfai_orchestration_cost_usd_per_run`

---

## Dashboard Panels

### 1. Latency (p95, p99) - Time Series

**Panel Type**: Time Series
**Metrics**:

- `mfai_orchestration_latency_p95{tenant=~"$tenant",env="$env"}`
- `mfai_orchestration_latency_p99{tenant=~"$tenant",env="$env"}`
- SLO Target line at 500ms

**Code Mapping**: `metricsStore.summary().latency.p95`, `metricsStore.summary().latency.p99`

**SLO**: `orchestration_latency_p95` < 500ms (WARN)

---

### 2. Error Rate (WARN / FAIL / TIMEOUT) - Stat

**Panel Type**: Stat
**Metrics**:

- `mfai_orchestration_status_rate{status="WARN"}`
- `mfai_orchestration_status_rate{status="FAIL"}`
- `mfai_orchestration_status_rate{status="TIMEOUT"}`

**Code Mapping**: `metricsStore.summary().rates.warn`, `metricsStore.summary().rates.fail`, `metricsStore.summary().rates.timeout`

**SLO**: `status_fail_timeout_rate` < 0.05 (5%) (CRITICAL)

---

### 3. Cost per Run (USD) - Bar Chart

**Panel Type**: Bar Chart
**Metrics**:

- `mfai_orchestration_cost_usd_per_run{tenant=~"$tenant",env="$env"}`

**Code Mapping**: `metricsStore.summary().llm.costTotal / window`, `ops.costs.estimatedUsd`

**SLO**: `llm_cost_per_run` < 0.05 USD (WARN)

---

### 4. LLM Calls & Cache Hit Rate - Time Series

**Panel Type**: Time Series
**Metrics**:

- `mfai_orchestration_llm_calls_total{tenant=~"$tenant",env="$env"}`
- `mfai_orchestration_llm_cache_hit_rate{tenant=~"$tenant",env="$env"} * 100`

**Code Mapping**: `metricsStore.summary().llm.calls`, `metricsStore.summary().llm.cacheHitRate`

**SLO**: `llm_calls_per_run` < 10 (INFO), cache hit rate > 0.5 (50%)

---

### 5. Tenant Activity - Table

**Panel Type**: Table
**Metrics**:

- `sum(mfai_orchestration_runs_total) by (tenant)`
- `avg(mfai_orchestration_latency_p95) by (tenant)`
- `avg(mfai_orchestration_status_rate{status="WARN"}) by (tenant)`

**Code Mapping**: `metricsStore.summaryByTenant()`

**Purpose**: Multi-tenant visibility and comparison

---

### 6. Alerts Timeline - Logs

**Panel Type**: Logs
**Metrics**:

- `mfai_orchestration_alerts{level=~"WARN|CRITICAL"}`

**Code Mapping**: `alertingEngine.recentAlerts()`, `systemStatus.alerts`

**Purpose**: Timeline of SLO violations and alerts

---

### 7. Idempotent Replay Rate - Stat

**Panel Type**: Stat
**Metrics**:

- `mfai_orchestration_idempotent_replay_rate{tenant=~"$tenant",env="$env"}`

**Code Mapping**: `metricsStore.summary().rates.idempotent`

**SLO**: `idempotent_replay_rate` < 0.1 (10%) (INFO)

---

### 8. DRY_RUN Rate - Stat

**Panel Type**: Stat
**Metrics**:

- `mfai_orchestration_execution_mode_rate{mode="DRY_RUN",tenant=~"$tenant",env="$env"}`

**Code Mapping**: `metricsStore.summary().rates.dryRun`

**SLO**: `dry_run_rate` > 0.95 (95%) (INFO) - Expected high by default

---

### 9. Web3 BLOCK Rate - Stat

**Panel Type**: Stat
**Metrics**:

- `mfai_orchestration_web3_block_rate{tenant=~"$tenant",env="$env"}`

**Code Mapping**: `systemStatus.web3.level === 'BLOCK'`, `web3Guards.evaluate()`

**Purpose**: Monitor Web3 guard blocking rate

---

### 10. Kill Switch Activations - Stat

**Panel Type**: Stat
**Metrics**:

- `mfai_orchestration_kill_switch_activations_total{tenant=~"$tenant",env="$env"}`

**Code Mapping**: `systemStatus.killSwitch.active === true`, `killSwitch.evaluate()`

**Purpose**: Monitor kill switch usage (should be 0 in normal operation)

---

### 11. Circuit Breaker Open Rate - Stat

**Panel Type**: Stat
**Metrics**:

- `mfai_orchestration_circuit_breaker_open_rate{tenant=~"$tenant",env="$env"}`

**Code Mapping**: `metricsStore.summary().rates.cbOpen`

**SLO**: `circuit_breaker_open_rate` < 0.1 (10%) (WARN)

---

### 12. Quota Usage (Runs) - Stat

**Panel Type**: Stat
**Metrics**:

- `mfai_orchestration_quota_usage{quota="runs"} / mfai_orchestration_quota_limit{quota="runs"} * 100`

**Code Mapping**: `tenantQuotaRegistry.evaluateQuota().snapshot.runsInWindow / quota.maxRunsPerWindow`

**Purpose**: Monitor tenant quota usage (warning at 80%, critical at 100%)

---

## Dashboard Variables

### Tenant

- **Type**: Query variable
- **Query**: `label_values(mfai_orchestration_runs_total, tenant)`
- **Multi-select**: Yes
- **Include All**: Yes
- **Default**: All

**Usage**: Filter metrics by tenant (e.g., `tenant="default"`, `tenant="tenant-A"`)

---

### Preset

- **Type**: Query variable
- **Query**: `label_values(mfai_orchestration_runs_total, preset)`
- **Multi-select**: Yes
- **Include All**: Yes
- **Default**: All

**Usage**: Filter metrics by preset (e.g., `preset="audit-dao"`, `preset="product-onboarding"`)

---

### Environment

- **Type**: Query variable
- **Query**: `label_values(mfai_orchestration_runs_total, env)`
- **Multi-select**: No
- **Default**: PROD

**Usage**: Filter metrics by environment (DEV, STAGING, PROD)

---

## Metric Mapping to Code

| Grafana Metric | Code Source | File |
|----------------|-------------|------|
| `mfai_orchestration_latency_p95` | `metricsStore.summary().latency.p95` | `metricsStore.js` |
| `mfai_orchestration_status_rate{status="WARN"}` | `metricsStore.summary().rates.warn` | `metricsStore.js` |
| `mfai_orchestration_cost_usd_per_run` | `metricsStore.summary().llm.costTotal / window` | `metricsStore.js`, `costModel.js` |
| `mfai_orchestration_llm_calls_total` | `metricsStore.summary().llm.calls` | `metricsStore.js` |
| `mfai_orchestration_llm_cache_hit_rate` | `metricsStore.summary().llm.cacheHitRate` | `metricsStore.js`, `llmCache.js` |
| `mfai_orchestration_idempotent_replay_rate` | `metricsStore.summary().rates.idempotent` | `metricsStore.js` |
| `mfai_orchestration_execution_mode_rate{mode="DRY_RUN"}` | `metricsStore.summary().rates.dryRun` | `metricsStore.js` |
| `mfai_orchestration_web3_block_rate` | `systemStatus.web3.level === 'BLOCK'` | `web3Guards.js` |
| `mfai_orchestration_kill_switch_activations_total` | `systemStatus.killSwitch.active === true` | `killSwitch.js` |
| `mfai_orchestration_circuit_breaker_open_rate` | `metricsStore.summary().rates.cbOpen` | `metricsStore.js`, `circuitBreaker.js` |
| `mfai_orchestration_quota_usage` | `tenantQuotaRegistry.evaluateQuota().snapshot` | `tenantQuotaRegistry.js` |

**Full Reference**: See `METRICS_MODEL.md` for complete metric definitions and code mappings.

---

## Screenshots / Descriptions

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Latency (p95, p99)        │  Error Rate (WARN/FAIL/TIMEOUT) │
├─────────────────────────────────────────────────────────────┤
│  Cost per Run (USD)        │  LLM Calls & Cache Hit Rate     │
├─────────────────────────────────────────────────────────────┤
│  Tenant Activity (Table)   │  Alerts Timeline (Logs)         │
├─────────────────────────────────────────────────────────────┤
│  Idempotent Replay │ DRY_RUN Rate │ Web3 BLOCK Rate          │
├─────────────────────────────────────────────────────────────┤
│  Kill Switch │ Circuit Breaker │ Quota Usage                 │
└─────────────────────────────────────────────────────────────┘
```

### Panel Descriptions

1. **Latency Panel**: Line chart showing p95 and p99 latency over time, with SLO target line at 500ms. Green/yellow/red thresholds indicate health status.

2. **Error Rate Panel**: Stat panel showing WARN, FAIL, and TIMEOUT rates as percentages. Color-coded thresholds (green < 10%, yellow 10-20%, red > 20%).

3. **Cost Panel**: Bar chart showing cost per run in USD, grouped by tenant. Thresholds: green < $0.03, yellow $0.03-$0.05, red > $0.05.

4. **LLM Panel**: Dual-axis time series showing LLM calls (left axis) and cache hit rate percentage (right axis).

5. **Tenant Activity Panel**: Table showing runs count, average latency p95, and WARN rate per tenant, sorted by runs (descending).

6. **Alerts Panel**: Logs panel showing SLO violations and alerts with timestamps, filtered to WARN and CRITICAL levels.

7-12. **Stat Panels**: Single-value panels with color-coded thresholds showing key operational metrics.

---

## Implementation Notes

### Current State

- **Metrics Source**: In-memory `metricsStore` with sliding window (100 runs)
- **Export Format**: JSON snapshot via `sloExporter.exportSloSnapshot()`
- **Grafana Integration**: Template ready, requires Prometheus exporter or JSON datasource

### Future Enhancements

1. **Prometheus Exporter**: Implement `/metrics` endpoint exposing Prometheus format
2. **Real-time Metrics**: Replace in-memory store with Prometheus push gateway or direct scraping
3. **Alerting Rules**: Configure Grafana alerting rules based on SLO targets
4. **Multi-tenant Dashboards**: Create per-tenant dashboards for isolation
5. **Preset Dashboards**: Create preset-specific dashboards for business metrics

---

## Troubleshooting

### Dashboard Shows "No Data"

**Cause**: Prometheus queries are simulated and not connected to real data source.

**Solution**:

1. Implement Prometheus exporter endpoint
2. Configure Prometheus to scrape the endpoint
3. Verify Grafana datasource is configured correctly
4. Check that metrics are being exported with correct labels

### Variables Not Populating

**Cause**: Query variables depend on metrics existing in Prometheus.

**Solution**:

1. Ensure metrics are being exported with `tenant`, `preset`, `env` labels
2. Verify Prometheus is scraping and storing metrics
3. Check Grafana datasource connection

### Thresholds Not Working

**Cause**: Threshold values may need adjustment based on actual SLO targets.

**Solution**:

1. Review SLO targets in `sloRegistry.js`
2. Update panel thresholds in dashboard JSON
3. Re-import dashboard

---

## Related Documentation

- **Metrics Model**: `METRICS_MODEL.md` - Complete metric definitions
- **SLO Registry**: `mf-back/orchestration/sloRegistry.js` - SLO targets
- **Metrics Store**: `mf-back/orchestration/metricsStore.js` - Metrics aggregation
- **SLO Exporter**: `mf-back/orchestration/sloExporter.js` - Snapshot export

---

## Support

For questions or issues:

1. Review `METRICS_MODEL.md` for metric definitions
2. Check code references in metric mapping table
3. Verify Prometheus/Grafana configuration
4. Consult SRE team for production setup

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

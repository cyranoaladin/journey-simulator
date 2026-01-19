<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Load Test Plan

## Overview

This document defines load testing scenarios for the Money Factory AI orchestration layer, focusing on **robustness**, **controlled degradation**, and **safety guards**.

**Scope**: Simulation-based load testing (no real high-load infrastructure required).

**Purpose**: Validate that the system maintains stability, never crashes, and applies degradation policies correctly under various load conditions.

**Last Updated**: 2025-12-26

---

## Test Scenarios

### 1. Progressive Ramp-Up (1 → 100 RPS simulated)

**Objective**: Validate system behavior under gradually increasing load.

**Description**:

- Start with 1 request per second
- Gradually increase to 100 requests per second over 5 minutes
- Monitor latency, error rates, and degradation triggers

**Signals Observed**:

- Latency p95 should remain < 500ms (SLO target)
- Error rate (FAIL/TIMEOUT) should remain < 5%
- Memory evictions should increase as stores fill
- Circuit breaker may open if LLM/RAG fail repeatedly

**Guards Expected**:

- `degradationPolicy` applies in order: quota → cost → slo → circuit → kill_switch
- `circuitBreaker` opens if failure rate exceeds threshold
- `concurrencyManager` sheds load if queue depth exceeds limit
- `killSwitch` activates if too many failures detected

**Expected Output**:

- All requests return structured responses (never throw)
- `ops.execution.mode` = DRY_RUN (default)
- `ops.fallbacks` includes degradation signals (e.g., `circuit_breaker_llm`, `load_shed`)
- `systemStatus.degradation` shows applied policies

**Code References**:

- `mf-back/orchestration/degradationPolicy.js`
- `mf-back/orchestration/circuitBreaker.js`
- `mf-back/orchestration/concurrencyManager.js`
- `mf-back/orchestration/killSwitch.js`

---

### 2. Burst Load

**Objective**: Validate system behavior under sudden spike in traffic.

**Description**:

- Normal load: 10 RPS
- Burst: 200 requests in 10 seconds (20 RPS peak)
- Return to normal: 10 RPS

**Signals Observed**:

- Latency spike during burst (acceptable if < 1s)
- Queue depth increases
- Load shedding may trigger
- Memory evictions increase

**Guards Expected**:

- `concurrencyManager` queues requests
- `concurrencyManager` sheds load if queue full
- `circuitBreaker` may open if failures spike
- Stores evict oldest entries (FIFO)

**Expected Output**:

- All requests complete (no crashes)
- Some requests may have `ops.fallbacks` including `load_shed`
- Latency returns to normal after burst
- No memory leaks (evictions working)

**Code References**:

- `mf-back/orchestration/concurrencyManager.js`
- `mf-back/orchestration/memoryStore.js` (evictions)

---

### 3. Concurrent Tenants

**Objective**: Validate tenant isolation and fairness under concurrent load.

**Description**:

- 10 tenants simultaneously
- Each tenant: 10 RPS
- Total: 100 RPS across tenants
- Run for 5 minutes

**Signals Observed**:

- Each tenant's metrics isolated
- Quotas enforced per tenant
- No data leakage between tenants
- Fair resource allocation

**Guards Expected**:

- `tenantQuotaRegistry` enforces quotas per tenant
- Stores partition by `tenantId`
- Quota exhaustion triggers `load_shed` for affected tenant only
- Other tenants unaffected

**Expected Output**:

- All tenants receive responses
- Quota warnings/blocks per tenant (not global)
- `systemStatus.tenant` shows per-tenant metrics
- No cross-tenant data access

**Code References**:

- `mf-back/orchestration/tenantQuotaRegistry.js`
- `mf-back/orchestration/metricsStore.js` (partition by tenantId)
- `mf-back/orchestration/idempotencyStore.js` (partition by tenantId)

---

### 4. Heavy Presets

**Objective**: Validate system behavior with resource-intensive presets.

**Description**:

- Use presets with multiple agents (e.g., `audit-dao`, `product-onboarding`)
- 20 RPS with heavy presets
- Monitor LLM calls, RAG usage, cost

**Signals Observed**:

- Higher LLM call count per request
- Higher cost per run
- Longer latency (more agents)
- Cache hit rate may decrease (more unique requests)

**Guards Expected**:

- `costModel` tracks cost per preset
- `llmCache` deduplicates identical prompts
- `degradationPolicy` applies cost guards if budget exceeded
- `circuitBreaker` may open if LLM fails repeatedly

**Expected Output**:

- All requests complete
- `ops.costs.estimatedUsd` shows higher cost for heavy presets
- `ops.llm.deduplicatedCalls` shows deduplication working
- `ops.fallbacks` may include `cost_warn` or `cost_block` if budget exceeded

**Code References**:

- `mf-back/orchestration/costModel.js`
- `mf-back/orchestration/llmCache.js`
- `mf-back/orchestration/degradationPolicy.js`

---

### 5. Cache Hot vs Cold

**Objective**: Validate cache effectiveness and cold start behavior.

**Description**:

- **Cold**: Fresh start, empty cache, 50 requests with unique intents
- **Hot**: Same 50 requests repeated (cache hits expected)
- Compare latency, LLM calls, cost

**Signals Observed**:

- Cold: Higher latency, more LLM calls, higher cost
- Hot: Lower latency, fewer LLM calls (cache hits), lower cost
- Cache hit rate: 0% (cold) → >50% (hot)

**Guards Expected**:

- `llmCache` stores responses with TTL
- Cache hits reduce LLM calls
- Deduplication works across agents

**Expected Output**:

- Cold: `ops.llm.cacheHitRate` ≈ 0, `ops.llm.calls` = high
- Hot: `ops.llm.cacheHitRate` > 0.5, `ops.llm.calls` = lower
- Cost reduction in hot scenario

**Code References**:

- `mf-back/orchestration/llmCache.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (deduplication)

---

### 6. Quota Exhaustion

**Objective**: Validate quota enforcement and load shedding.

**Description**:

- Single tenant: 100 requests in 1 minute
- Quota: 50 runs per 10-minute window
- Observe behavior as quota approaches and exceeds limit

**Signals Observed**:

- Quota usage increases
- Warnings at 80% quota
- Blocks at 100% quota
- Load shedding triggers

**Guards Expected**:

- `tenantQuotaRegistry.evaluateQuota()` returns WARN at 80%, BLOCK at 100%
- `productionGuards` blocks REAL execution if quota exceeded
- `degradationPolicy` applies `quota_warn` or `quota_block`
- Load shedding prevents further requests

**Expected Output**:

- First 50 requests: OK
- Requests 51-60: WARN (`ops.fallbacks` includes `quota_warn`)
- Requests 61+: BLOCK (`ops.execution.blocked = true`, `ops.fallbacks` includes `quota_block`)
- All requests return structured responses (no crash)

**Code References**:

- `mf-back/orchestration/tenantQuotaRegistry.js`
- `mf-back/orchestration/productionGuards.js`
- `mf-back/orchestration/degradationPolicy.js`

---

### 7. Cost Budget Exceeded

**Objective**: Validate cost guard enforcement.

**Description**:

- Multiple heavy presets (high LLM usage)
- Accumulate cost over time window
- Exceed budget threshold

**Signals Observed**:

- Cost per run accumulates
- Budget warnings at 80% threshold
- Budget blocks at 100% threshold
- REAL execution blocked if cost exceeded

**Guards Expected**:

- `costModel` tracks cost per run and window
- `degradationPolicy` applies `cost_warn` or `cost_block`
- `productionGuards` blocks REAL execution if cost exceeded
- Fallback to DRY_RUN

**Expected Output**:

- `ops.costs.status` = WARN → BLOCK
- `ops.execution.blocked = true` if BLOCK
- `ops.fallbacks` includes `cost_warn` or `cost_block`
- All requests return structured responses

**Code References**:

- `mf-back/orchestration/costModel.js`
- `mf-back/orchestration/productionGuards.js`
- `mf-back/orchestration/degradationPolicy.js`

---

## Success Criteria

### Must Pass (P0)

- ✅ **No crashes**: All requests return structured responses, never throw
- ✅ **Never-throw invariant**: Even under extreme load, system returns JSON response
- ✅ **Guards active**: Degradation policies apply correctly
- ✅ **Memory stable**: Evictions prevent memory leaks
- ✅ **Tenant isolation**: No cross-tenant data access

### Should Pass (P1)

- ✅ **SLO compliance**: Latency p95 < 500ms under normal load
- ✅ **Error rate**: FAIL/TIMEOUT < 5% under normal load
- ✅ **Cache effectiveness**: Cache hit rate > 50% in hot scenario
- ✅ **Quota enforcement**: Quotas enforced correctly per tenant

### Nice to Have (P2)

- ✅ **Performance**: Latency remains acceptable under burst
- ✅ **Cost optimization**: Deduplication reduces LLM calls
- ✅ **Observability**: Metrics and alerts reflect load conditions

---

## Test Execution

### Simulation Script

Use `scripts/testing/simulate-load.js` to execute load test scenarios:

```bash
npm run test:load:sim -- --scenario progressive
npm run test:load:sim -- --scenario burst
npm run test:load:sim -- --scenario tenants
npm run test:load:sim -- --scenario presets
npm run test:load:sim -- --scenario cache
npm run test:load:sim -- --scenario quota
npm run test:load:sim -- --scenario cost
```

### Expected Output

Each scenario produces a JSON report:

```json
{
  "scenario": "progressive",
  "duration": 300000,
  "requests": {
    "total": 5000,
    "success": 4950,
    "warn": 50,
    "fail": 0,
    "timeout": 0
  },
  "metrics": {
    "latency": { "p95": 450, "p99": 600 },
    "errorRate": 0.01,
    "degradationApplied": ["circuit_breaker_llm", "load_shed"]
  },
  "guards": {
    "circuitBreaker": { "open": true, "reason": "llm_failures" },
    "killSwitch": { "active": false }
  },
  "status": "PASS"
}
```

---

## Alignment with SLO

| Scenario | SLO Impact | Target |
|----------|------------|--------|
| Progressive Ramp-Up | `orchestration_latency_p95` | < 500ms |
| Burst Load | `orchestration_latency_p95` | < 1s (acceptable spike) |
| Concurrent Tenants | `status_fail_timeout_rate` | < 5% |
| Heavy Presets | `llm_cost_per_run` | < 0.05 USD |
| Cache Hot/Cold | `llm_calls_per_run` | < 10 (hot) |
| Quota Exhaustion | `real_block_rate` | < 10% |
| Cost Budget | `llm_cost_per_run` | < 0.05 USD |

---

## Code References

- **Degradation**: `mf-back/orchestration/degradationPolicy.js`
- **Circuit Breaker**: `mf-back/orchestration/circuitBreaker.js`
- **Concurrency**: `mf-back/orchestration/concurrencyManager.js`
- **Kill Switch**: `mf-back/orchestration/killSwitch.js`
- **Quotas**: `mf-back/orchestration/tenantQuotaRegistry.js`
- **Cost**: `mf-back/orchestration/costModel.js`
- **Cache**: `mf-back/orchestration/llmCache.js`
- **Metrics**: `mf-back/orchestration/metricsStore.js`

---

## Next Steps

1. Execute simulation scripts for each scenario
2. Collect metrics and degradation signals
3. Validate guards are triggered correctly
4. Document results in `RESILIENCE_REPORT.md`
5. Adjust thresholds if needed based on results

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Chaos Engineering Plan

## Overview

This document defines chaos engineering scenarios for the Money Factory AI orchestration layer, focusing on **resilience**, **graceful degradation**, and **never-crash invariant**.

**Scope**: Simulated chaos injections (no real infrastructure failures).

**Purpose**: Validate that the system handles failures gracefully, applies fallbacks correctly, and never crashes under adverse conditions.

**Last Updated**: 2025-12-26

---

## Chaos Scenarios

### 1. LLM Timeout

**Objective**: Validate system behavior when LLM calls timeout.

**Chaos Injection**:

- Simulate LLM timeout (exceed `constraints.timeoutMs`)
- Multiple agents requiring LLM
- Repeated timeouts

**Mechanism**:

- `timeoutGuard` in `zynoVerticalSlice.js` wraps agent promises
- Agent marked as TIMEOUT if exceeds timeout
- Circuit breaker may open after repeated timeouts

**Expected Result**:

- Agent status: TIMEOUT
- `ops.fallbacks` includes `agent_timeout`
- `circuitBreaker` opens for LLM if threshold exceeded
- `ops.llm.mode` falls back to mock if circuit open
- Overall response: WARN (not FAIL)
- No crash, structured response returned

**Code References**:

- `mf-back/orchestration/zynoVerticalSlice.js` (timeoutGuard)
- `mf-back/orchestration/circuitBreaker.js`
- `mf-back/orchestration/llmClient.js`

---

### 2. RAG Unavailable

**Objective**: Validate system behavior when RAG service is unavailable.

**Chaos Injection**:

- Simulate RAG service failure (network error, timeout, empty response)
- Agents requiring RAG (`requiresRag: true`)
- Multiple agents affected

**Mechanism**:

- `ragClient.search()` returns empty chunks or throws
- `ragClient` falls back to local RAG if remote fails
- Agents continue with empty citations if RAG fails

**Expected Result**:

- `ops.rag.mode` = 'local' or 'disabled'
- `ops.rag.hits` = 0
- `ops.fallbacks` includes `rag_fallback` or `rag_disabled`
- Agents return WARN (not FAIL) with empty citations
- Overall response: WARN
- No crash, structured response returned

**Code References**:

- `mf-back/orchestration/ragClient.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (RAG fallback)

---

### 3. Circuit Breaker Open

**Objective**: Validate system behavior when circuit breaker is open.

**Chaos Injection**:

- Trigger circuit breaker to open (repeated failures)
- Attempt LLM or RAG calls while circuit open
- Multiple tenants affected

**Mechanism**:

- `circuitBreaker.canProceed()` returns false if circuit open
- `ops.fallbacks` includes `circuit_breaker_llm` or `circuit_breaker_rag`
- LLM falls back to mock, RAG falls back to local

**Expected Result**:

- `systemStatus.circuitBreakers.llm.state` = 'OPEN'
- `ops.fallbacks` includes `circuit_breaker_llm`
- `ops.llm.mode` = 'mock' (fallback)
- All requests return structured responses
- No crash, graceful degradation

**Code References**:

- `mf-back/orchestration/circuitBreaker.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (circuit breaker check)

---

### 4. Memory Saturation

**Objective**: Validate system behavior when memory stores are saturated.

**Chaos Injection**:

- Fill stores to capacity (idempotencyStore, auditTrailStore, llmCache, etc.)
- Continue making requests
- Observe eviction behavior

**Mechanism**:

- Stores use FIFO eviction when `maxEntries` reached
- TTL-based eviction for expired entries
- `memoryStore.memoryPressure()` returns HIGH if pressure > 90%

**Expected Result**:

- Stores evict oldest entries (FIFO)
- `ops.memory.evictions` increases
- `ops.memory.pressure` = 'HIGH' if saturated
- `ops.fallbacks` may include `memory_pressure`
- All requests return structured responses
- No memory leak, evictions working

**Code References**:

- `mf-back/orchestration/memoryStore.js` (evictions)
- `mf-back/orchestration/idempotencyStore.js` (FIFO eviction)
- `mf-back/orchestration/llmCache.js` (FIFO eviction)
- `mf-back/orchestration/metricsStore.js` (memoryPressure)

---

### 5. Quota Exhaustion

**Objective**: Validate system behavior when tenant quota is exhausted.

**Chaos Injection**:

- Exceed tenant quota (runs, LLM calls, cost, agents)
- Multiple quota types exhausted
- Observe blocking behavior

**Mechanism**:

- `tenantQuotaRegistry.evaluateQuota()` returns BLOCK if quota exceeded
- `productionGuards` blocks REAL execution
- `degradationPolicy` applies `quota_block`

**Expected Result**:

- `ops.execution.blocked = true`
- `ops.fallbacks` includes `quota_block`
- `ops.execution.blockReasons` includes quota reasons
- All requests return structured responses (no crash)
- DRY_RUN fallback applied

**Code References**:

- `mf-back/orchestration/tenantQuotaRegistry.js`
- `mf-back/orchestration/productionGuards.js`
- `mf-back/orchestration/degradationPolicy.js`

---

### 6. Secrets Missing

**Objective**: Validate system behavior when required secrets are missing.

**Chaos Injection**:

- Remove `OPENAI_API_KEY` from environment
- Set `NODE_ENV=PROD`
- Attempt requests requiring LLM

**Mechanism**:

- `secretsPolicy.evaluate()` returns BLOCK in PROD if secrets missing
- `productionGuards` blocks REAL execution
- LLM falls back to mock

**Expected Result**:

- `secretsDecision.status` = 'BLOCK'
- `ops.execution.blocked = true`
- `ops.fallbacks` includes `secrets_block`
- `ops.llm.mode` = 'mock' (fallback)
- All requests return structured responses
- No crash, graceful degradation

**Code References**:

- `mf-back/orchestration/secretsPolicy.js`
- `mf-back/orchestration/productionGuards.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (secretsDecision)

---

### 7. Web3 BLOCK Repeated

**Objective**: Validate system behavior when Web3 guards repeatedly block.

**Chaos Injection**:

- Attempt Web3 actions (mint) without proper state (no proof/anchor)
- Repeated attempts
- Multiple tenants

**Mechanism**:

- `web3Guards.evaluate()` returns BLOCK if conditions not met
- `web3Pipeline.applyAction()` returns WARN if invalid transition
- `killSwitch` may activate if repeated BLOCKs

**Expected Result**:

- `systemStatus.web3.level` = 'BLOCK'
- `ops.execution.blockReasons` includes `web3_pipeline_invalid_transition`
- `ops.fallbacks` includes `web3_pipeline_warn`
- `killSwitch` may activate if threshold exceeded
- All requests return structured responses
- No crash, graceful degradation

**Code References**:

- `mf-back/orchestration/web3Guards.js`
- `mf-back/orchestration/web3Pipeline.js`
- `mf-back/orchestration/killSwitch.js` (auto-trigger on repeated BLOCK)

---

## Chaos Injection Matrix

| Chaos | Mechanism | Result Expected | Guards Triggered | Code Files |
|-------|-----------|-----------------|------------------|------------|
| **LLM Timeout** | `timeoutGuard` exceeds timeout | Agent TIMEOUT, circuit breaker may open | `circuit_breaker_llm`, `agent_timeout` | `zynoVerticalSlice.js`, `circuitBreaker.js` |
| **RAG Unavailable** | `ragClient.search()` fails | RAG fallback to local, empty citations | `rag_fallback`, `rag_disabled` | `ragClient.js` |
| **Circuit Breaker Open** | `circuitBreaker.canProceed()` = false | LLM/RAG fallback to mock/local | `circuit_breaker_llm`, `circuit_breaker_rag` | `circuitBreaker.js` |
| **Memory Saturation** | Stores reach `maxEntries` | FIFO eviction, memory pressure HIGH | `memory_pressure` | `memoryStore.js`, `idempotencyStore.js` |
| **Quota Exhaustion** | `tenantQuotaRegistry` BLOCK | REAL execution blocked, DRY_RUN fallback | `quota_block`, `load_shed` | `tenantQuotaRegistry.js`, `productionGuards.js` |
| **Secrets Missing** | `secretsPolicy` BLOCK in PROD | REAL execution blocked, LLM mock | `secrets_block` | `secretsPolicy.js`, `productionGuards.js` |
| **Web3 BLOCK Repeated** | `web3Guards` BLOCK, invalid transitions | Web3 actions blocked, kill switch may activate | `web3_pipeline_warn`, `kill_switch` | `web3Guards.js`, `web3Pipeline.js`, `killSwitch.js` |

---

## Success Criteria

### Must Pass (P0)

- ✅ **No crashes**: All chaos scenarios return structured responses, never throw
- ✅ **Never-throw invariant**: Even under chaos, system returns JSON response
- ✅ **Guards active**: Degradation policies and fallbacks apply correctly
- ✅ **Graceful degradation**: System degrades gracefully, never fails hard

### Should Pass (P1)

- ✅ **Fallbacks work**: All fallbacks (mock LLM, local RAG, DRY_RUN) function correctly
- ✅ **Circuit breaker**: Circuit breaker opens/closes correctly
- ✅ **Memory stable**: Evictions prevent memory leaks
- ✅ **Quota enforcement**: Quotas enforced correctly, blocking works

### Nice to Have (P2)

- ✅ **Observability**: Metrics and alerts reflect chaos conditions
- ✅ **Recovery**: System recovers when chaos conditions removed
- ✅ **Performance**: Degraded performance acceptable (not optimal, but functional)

---

## Test Execution

### Simulation Script

Use `scripts/testing/simulate-chaos.js` to execute chaos scenarios:

```bash
npm run test:chaos:sim -- --scenario llm-timeout
npm run test:chaos:sim -- --scenario rag-unavailable
npm run test:chaos:sim -- --scenario circuit-breaker
npm run test:chaos:sim -- --scenario memory-saturation
npm run test:chaos:sim -- --scenario quota-exhaustion
npm run test:chaos:sim -- --scenario secrets-missing
npm run test:chaos:sim -- --scenario web3-block
```

### Expected Output

Each scenario produces a JSON report:

```json
{
  "scenario": "llm-timeout",
  "injections": [
    { "type": "llm_timeout", "count": 10 }
  ],
  "results": {
    "requests": { "total": 10, "success": 10, "warn": 10, "fail": 0 },
    "guards": {
      "circuitBreaker": { "open": true, "reason": "llm_failures" },
      "killSwitch": { "active": false }
    },
    "fallbacks": ["circuit_breaker_llm", "llm_mock"],
    "status": "PASS"
  }
}
```

---

## Alignment with Degradation Policy

| Chaos | Degradation Order | Applied Policies |
|-------|-------------------|------------------|
| LLM Timeout | circuit → kill_switch | `circuit_breaker_llm`, `llm_mock` |
| RAG Unavailable | (none) | `rag_fallback`, `rag_disabled` |
| Circuit Breaker | circuit → kill_switch | `circuit_breaker_llm`, `llm_mock` |
| Memory Saturation | (none) | `memory_pressure` |
| Quota Exhaustion | quota → kill_switch | `quota_block`, `load_shed` |
| Secrets Missing | (none) | `secrets_block`, `llm_mock` |
| Web3 BLOCK | kill_switch | `web3_pipeline_warn`, `kill_switch` |

**Code Reference**: `mf-back/orchestration/degradationPolicy.js` (ORDER: ['quota', 'cost', 'slo', 'circuit', 'kill_switch'])

---

## Code References

- **Timeout**: `mf-back/orchestration/zynoVerticalSlice.js` (timeoutGuard)
- **RAG Fallback**: `mf-back/orchestration/ragClient.js`
- **Circuit Breaker**: `mf-back/orchestration/circuitBreaker.js`
- **Memory**: `mf-back/orchestration/memoryStore.js`, `idempotencyStore.js`, `llmCache.js`
- **Quotas**: `mf-back/orchestration/tenantQuotaRegistry.js`
- **Secrets**: `mf-back/orchestration/secretsPolicy.js`
- **Web3**: `mf-back/orchestration/web3Guards.js`, `web3Pipeline.js`
- **Kill Switch**: `mf-back/orchestration/killSwitch.js`
- **Degradation**: `mf-back/orchestration/degradationPolicy.js`

---

## Next Steps

1. Execute simulation scripts for each chaos scenario
2. Collect results and guard triggers
3. Validate never-crash invariant
4. Document results in `RESILIENCE_REPORT.md`
5. Adjust thresholds if needed based on results

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

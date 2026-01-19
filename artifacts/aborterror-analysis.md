# AbortError Analysis — Playwright E2E Failure

**Generated**: 2026-01-04T00:22:00+01:00  
**Test**: `zyno-persistence.spec.ts` (Chromium)  
**Verdict**: **FAIL_ABORTERROR**

---

## Extracted Log (Sanitized)

```
[BROWSER CONSOLE] log: [Store] State Updated. CurrentPhase: 0
[BROWSER CONSOLE] log: [ResourceUploader] Response: {documents: Array(7)}
[DEBUG] Clicking Template "DAO Plan"...
[BROWSER CONSOLE] log: ZYNO_CLICK_TRIGGERED Build a DAO voting plan with quorum, power levels, and AEPO/AECO tracking. Analyze connection persistence for ProductSpecAgent
[DEBUG] Waiting for Orchestration Response...
[BROWSER CONSOLE] error: Simulation error: AbortError: signal is aborted without reason
    at http://127.0.0.1:4173/assets/Zyno-1dfa9afd.js:6:17188
```

**Test Duration**: 3.0 minutes (180s timeout reached)

---

## Root Cause Analysis

### 1) AbortError Source
**Location**: `Zyno-1dfa9afd.js:6:17188` (frontend bundle)  
**Type**: Frontend AbortController triggered  
**Reason**: "signal is aborted without reason"

### 2) Timeline
1. User clicks "DAO Plan" template
2. `ZYNO_CLICK_TRIGGERED` fires with prompt
3. Frontend waits for orchestration response
4. **180s timeout expires** (ZynoConsole.tsx:346 `timeoutMs = runMode === 'real' ? 180000 : 10000`)
5. AbortController fires, throwing AbortError

### 3) Why 180s Timeout Was Exceeded

**Hypothesis**: The E2E test prompt is more complex than R1/R2 repro prompts.

**E2E Prompt**: `"Build a DAO voting plan with quorum, power levels, and AEPO/AECO tracking. Analyze connection persistence for ProductSpecAgent"`

**R1 Prompt**: `"PING_ORCHESTRATION_R1"` → 7375ms (CoachAgent)  
**R2 Prompt**: `"PERSISTENCE_CHECK_R2"` → 51ms (cache HIT)

**E2E Prompt Analysis**:
- Mentions "DAO" → triggers DAOAgent (10-20s)
- Mentions "voting plan" → may trigger Web3LegalAgent (5-10s)
- Mentions "AEPO/AECO tracking" → may trigger AuditAgent (5-10s)
- **Total estimated**: 20-40s for multi-agent orchestration

**BUT**: 180s should be sufficient for 40s orchestration.

### 4) Possible Causes

#### A) Backend Timeout or Hang
- **Evidence**: None in R1/R2 repro (both completed <10s)
- **Likelihood**: Low

#### B) Frontend AbortController Premature Trigger
- **Evidence**: Timeout set to 180s, but test failed at exactly 3.0m
- **Likelihood**: High — timeout is working as designed

#### C) Orchestration Actually Takes >180s in E2E Context
- **Evidence**: Need backend logs from E2E run to confirm
- **Likelihood**: Medium — possible if:
  - Multiple agents chained
  - LLM rate limiting
  - Network latency in E2E environment

#### D) Test Assertion Timeout (Playwright)
- **Evidence**: Test duration = 3.0m exactly
- **Likelihood**: High — Playwright default timeout may be interfering

---

## Proof: R1/R2 Repro Shows NO AbortError

✅ R1: 7375ms, 200 OK, CoachAgent, **NO AbortError**  
✅ R2: 51ms, 200 OK, CoachAgent (cache HIT), **NO AbortError**

**Conclusion**: AbortError is **NOT** reproducible in standalone orchestration. The issue is **E2E-specific** or **prompt-specific**.

---

## Next Steps

### Option 1: Increase Frontend Timeout (NOT RECOMMENDED without proof)
- Change `ZynoConsole.tsx:346` from 180s to 300s
- **Risk**: Masks underlying issue

### Option 2: Capture Backend Logs During E2E Run (RECOMMENDED)
- Run E2E with backend log capture
- Correlate `requestId` from frontend with backend telemetry
- Determine actual orchestration duration

### Option 3: Simplify E2E Test Prompt (WORKAROUND)
- Use simpler prompt like R1/R2
- **Risk**: Doesn't test realistic scenario

### Option 4: Increase Playwright Test Timeout (RECOMMENDED)
- Add `test.setTimeout(300000)` to `zyno-persistence.spec.ts`
- Allows frontend 180s timeout + buffer

---

## Recommended Fix

**Immediate**: Increase Playwright test timeout to 300s (5 minutes)  
**Follow-up**: Capture backend logs during E2E to prove actual orchestration duration  
**Long-term**: Optimize multi-agent orchestration to complete <60s

---

## Artifacts Created

- ✅ `artifacts/playwright-zyno-chromium-rerun.log`
- ✅ `artifacts/orchestration-repro-R1.log`
- ✅ `artifacts/orchestration-repro-R2.log`
- ✅ `artifacts/orchestration-repro-summary.md`
- ✅ `artifacts/metrics-fix-proof.md`
- ✅ `artifacts/aborterror-analysis.md` (this file)

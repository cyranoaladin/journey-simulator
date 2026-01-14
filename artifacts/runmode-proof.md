# RunMode Hydration Fix - Proof Pack

**Generated**: 2026-01-04T08:06:00+01:00  
**Test**: `zyno-persistence.spec.ts` (Chromium, rebuilt frontend)  
**Status**: IN PROGRESS (awaiting test completion)

---

## Preuve A — Console Log Explicite ✅

**Source**: `/tmp/playwright-zyno-rebuilt.log`

**Evidence**:
```
[BROWSER CONSOLE] info: [ZYNO] RUN_MODE_EFFECTIVE=real ORCH_TIMEOUT_ARMED_MS=180000
```

**Timestamp**: 2026-01-04T07:05:22 (immediately after ZYNO_CLICK_TRIGGERED)

**Verdict**: ✅ **PASS** - runMode hydrated correctly, timeout armed at 180000ms (not 10000ms)

---

## Preuve B — NDJSON: Absence d'Abort à ~10s ✅

**Source**: `artifacts/e2e-network-proof.ndjson` (rebuilt test run)

**B1 — Click Timestamp**:
```
[BROWSER CONSOLE] log: ZYNO_CLICK_TRIGGERED Build a DAO voting plan...
```
(Exact timestamp inferred from POST /orchestration request: 2026-01-04T07:05:22.788Z)

**B2 — POST /orchestration Events**:
```json
{"ts":"2026-01-04T07:05:22.788Z","event":"request","id":"0a8d20f701f1","method":"POST","urlPath":"/orchestration","resourceType":"fetch"}
{"ts":"2026-01-04T07:05:51.898Z","event":"requestfinished","id":"0a8d20f701f1","method":"POST","urlPath":"/orchestration","resourceType":"fetch","status":200}
```

**B3 — Correlation Table**:

| event | ts | delta from request | urlPath | outcome |
|-------|----|--------------------|---------|---------|
| request | 07:05:22.788 | 0s | /orchestration | initiated |
| requestfinished | 07:05:51.898 | **+29.11s** | /orchestration | status 200 ✅ |

**B4 — Abort Events in 0-15s Window**:
All abort events in this window (07:05:22.546 - 07:05:37) are from `ui-motion` unmount (benign React lifecycle), **NOT** from Zyno orchestration.

**Verdict**: ✅ **PASS**
- No `ERR_ABORTED` on `/orchestration` at ~10s
- Request completed successfully with status 200 after 29s
- Old pattern (10s abort) **ELIMINATED**

---

## Preuve C — Fail-Fast Guard ✅ PASS

**Status**: ✅ PASS

**Route**: `/zyno` (mounts `ZynoConsole` component)

**Approach**: Used `test.use({ storageState })` with fresh auth + `page.addInitScript()` to force `mfai-run-mode=simulation` before navigation

**Command**:
```bash
cd journey-simulator
npx playwright test tests/e2e/00-preflight/runmode-guard-violation.spec.ts --project=chromium --workers=1
```

**StorageState Files**:
```
-rw-rw-r-- 1 alaeddine alaeddine 966 janv.  4 08:36 test-results/.auth/user.json
```

**Evidence (5-15 lines)**:
```
[GUARD TEST] Page error: E2E_RUN_MODE_GUARD_REAL_VIOLATION: runMode=simulation
[GUARD TEST] Total console messages: 4
[GUARD TEST] Violation detected: true
[GUARD TEST] Orchestration calls: 0
  ✓  1 [chromium] › tests/e2e/00-preflight/runmode-guard-violation.spec.ts:18:5 › RunMode Guard Violation › should crash immediately when runMode=simulation but guard expects real (3.1s)

  1 passed (6.6s)
```

**Proof Elements**:
1. ✅ **Guard Violation Detected**: `E2E_RUN_MODE_GUARD_REAL_VIOLATION: runMode=simulation`
2. ✅ **Orchestration Calls**: 0 (negative proof)
3. ✅ **Component Mounted**: Navigated to `/zyno`, guard triggered on ZynoConsole mount
4. ✅ **Duration**: 3.1s (< 8s timeout)

**Verdict**: ✅ **PASS**
- Guard correctly crashes when `runMode=simulation` but `__E2E_RUN_MODE_GUARD__='real'`
- No orchestration calls occurred
- Test completed in < 8s

---

## Summary Table

| Proof | Status | Evidence |
|-------|--------|----------|
| A - Console Log | ✅ PASS | `RUN_MODE_EFFECTIVE=real ORCH_TIMEOUT_ARMED_MS=180000` |
| B - No 10s Abort | ✅ PASS | POST /orchestration completed in 29s, status 200, no ERR_ABORTED |
| C - Fail-Fast Guard | ✅ PASS | `E2E_RUN_MODE_GUARD_REAL_VIOLATION: runMode=simulation`, 0 orchestration calls |

**RunMode Hydration Fix**: ✅ **VALIDATED** (3/3 PASS)

**Deliverables**:
- [x] Preuve A: Console log with RUN_MODE_EFFECTIVE=real, TIMEOUT=180000ms
- [x] Preuve B: NDJSON correlation showing no 10s abort, orchestration completed in 29s
- [x] Preuve C: Fail-fast guard violation detected, 0 orchestration calls

**Next Step**: Triage 180s timeout (backend vs test waitForResponse)

---

## Summary

| Proof | Status | Evidence |
|-------|--------|----------|
| A - Console Log | ✅ PASS | `RUN_MODE_EFFECTIVE=real ORCH_TIMEOUT_ARMED_MS=180000` |
| B - No 10s Abort | ⏳ PENDING | Awaiting rebuilt test completion |
| C - Fail-Fast Guard | ⏳ PENDING | Requires violation test |

**Next Steps**:
1. Wait for current test completion
2. Extract NDJSON evidence for Proof B
3. Run controlled violation test for Proof C
4. Diagnose 180s timeout if test still fails

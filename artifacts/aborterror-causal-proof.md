# Causal Proof: AbortError Root Cause Analysis

**Generated**: 2026-01-04T07:37:00+01:00  
**Test**: `zyno-persistence.spec.ts` (Chromium)  
**Verdict**: **FAIL_ABORTERROR** - Cas B (Abort applicatif, pas reload/navigation)

---

## 1) Preuves Fichiers

```bash
-rw-rw-r-- 1 alaeddine alaeddine 64621 janv.  4 07:26 artifacts/abort-events.ndjson
-rw-rw-r-- 1 alaeddine alaeddine 28538 janv.  4 07:27 artifacts/e2e-network-proof.ndjson
```

**Lignes**: 105 abort events captured  
✅ Instrumentation streaming: **SUCCESS**

---

## 2) POST /orchestration - Extraction par ID

**Request ID**: `cf738f9ed934`

```json
{"ts":"2026-01-04T06:24:24.134Z","event":"request","id":"cf738f9ed934","method":"POST","urlPath":"/orchestration","resourceType":"fetch"}
{"ts":"2026-01-04T06:24:34.131Z","event":"requestfailed","id":"cf738f9ed934","method":"POST","urlPath":"/orchestration","resourceType":"fetch","failure":"net::ERR_ABORTED"}
```

**Timeline**:
- **06:24:24.134Z**: Request initiated
- **06:24:34.131Z**: Request failed (ERR_ABORTED)
- **Duration**: ~10 seconds (NOT 180s timeout)

---

## 3) Corrélation Temporelle: Abort ↔ /orchestration

**Critical Abort Event** (06:24:34.128Z - **3ms BEFORE** requestfailed):

```json
{
  "ts": "2026-01-04T06:24:34.128Z",
  "reason": "NO_REASON",
  "stack": "Error: abort stack\n    at PatchedAbortController.abort (<anonymous>:6:25)\n    at http://127.0.0.1:4173/assets/Zyno-1dfa9afd.js:6:17188",
  "runMode": "real",
  "test": "zyno-persistence"
}
```

**Stack Causale**:
```
at PatchedAbortController.abort (<anonymous>:6:25)
at http://127.0.0.1:4173/assets/Zyno-1dfa9afd.js:6:17188
```

**Source**: `Zyno-1dfa9afd.js:6:17188` (Zyno Console component, NOT ui-motion)

---

## 4) Page Lifecycle Events

**page_close**: `2026-01-04T06:27:23.121Z` (3 minutes AFTER abort)

**page_crash**: NONE  
**pageerror**: NONE (before abort)

**Conclusion**: NO page reload/navigation/crash at abort time. The abort is **application-level**, triggered by Zyno component logic.

---

## 5) Stack Causale (NOT ui-motion)

**Critical Stack** (from abort-events.ndjson):
```
Error: abort stack
    at PatchedAbortController.abort (<anonymous>:6:25)
    at http://127.0.0.1:4173/assets/Zyno-1dfa9afd.js:6:17188
```

**vs. UI-motion unmount stacks** (benign, unrelated):
```
at Ic.unmount (http://127.0.0.1:4173/assets/ui-motion-a60d51b4.js:25:42639)
at el.unmount (http://127.0.0.1:4173/assets/ui-motion-a60d51b4.js:33:17407)
```

**Differentiation**: The critical abort at 06:24:34.128Z comes from `Zyno-1dfa9afd.js`, NOT ui-motion. All other 104 aborts are ui-motion unmounts (benign React lifecycle).

---

## 6) Trace.zip (Support)

`test-results/artifacts/04-agents-zyno-persistence-4294e-tion-and-status-persistence-chromium/trace.zip`

---

## Root Cause Summary

### Cas B: Application-Level AbortController Timeout

**Evidence**:
1. ✅ NO page_close/crash/reload at abort time (06:24:34)
2. ✅ Abort triggered from `Zyno-1dfa9afd.js:6:17188` (Zyno Console component)
3. ✅ Abort occurs **exactly 10 seconds** after request initiation (06:24:24 → 06:24:34)
4. ✅ POST /orchestration fails with `net::ERR_ABORTED` 3ms after abort

**Hypothesis**: Zyno Console component has a **10-second timeout** that aborts the fetch request.

**Next Steps**:
1. Search for timeout configuration in Zyno component:
   ```bash
   rg -n "10000|10s|setTimeout.*10" journey-simulator/src
   ```
2. Identify AbortController usage in Zyno Console
3. Verify actual timeout value (should be 180s for real mode, not 10s)

---

## Recommended Fix

**Target**: `journey-simulator/src/components/Zyno*.tsx` or similar

**Search Pattern**:
```bash
rg -n "AbortController|setTimeout|MFAI_ORCHESTRATION_TIMEOUT" journey-simulator/src
```

**Expected Issue**: Hardcoded 10s timeout instead of using `MFAI_ORCHESTRATION_TIMEOUT` (180s for real mode)

**Fix**: Replace hardcoded timeout with environment-aware timeout:
```typescript
const timeoutMs = runMode === 'real' ? 180000 : 10000;
```

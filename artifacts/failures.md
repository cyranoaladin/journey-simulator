# Phase 4 Failures (2026-01-04T20:15:00+01:00)

## FAIL_BLOCKING: 24/45 tests failed

### Gate Command
```bash
cd journey-simulator && npx playwright test tests/e2e/05-agents-orchestration --workers=1 --trace off
```

### Results
- 21/45 PASSED (agent-contracts tests only)
- 24/45 FAILED (intent-routing, multi-user-isolation, orchestrator-resilience)

---

## Root Causes

### 1. Intent Routing Tests (15 FAIL) - **EXPECTED FAIL_BLOCKING**

**Issue**: Orchestration endpoint `/api/orchestration/intent` does not exist

**Error**:
```
Expected to fail, but passed.
```

**Root Cause**: Tests are designed to FAIL_BLOCKING if backend doesn't provide orchestration endpoint with agent metadata. This is per AUDIT.md requirement - tests must validate real endpoints.

**Fix Required**: Backend amendment to add orchestration endpoint

**Minimal Backend Amendment**:
```javascript
// mf-back/routes/orchestration-routes.js
router.post('/intent', async (req, res) => {
  const { prompt, userId } = req.body;
  
  // Route to agent via intentRouter
  const result = await intentRouter.routeIntent(prompt);
  
  res.json({
    agentId: result.selectedAgent.agentId,
    status: 'success',
    confidence: result.confidence,
  });
});
```

**Re-proof**: After backend amendment, re-run `./artifacts/phase4-execute.sh`

---

### 2. Multi-User Isolation Test (3 FAIL)

**Issue**: `require is not defined` in ES module context

**Error**:
```
ReferenceError: require is not defined
  at multi-user-isolation.spec.ts:57:24
```

**Root Cause**: Using `require('fs')` in ES module context

**Fix**: Use ES6 import

**Diff**:
```diff
-            const fs = require('fs');
+            import * as fs from 'fs';
```

**Re-proof**: Re-run chromium-only test after fix

---

### 3. Orchestrator Resilience Tests (6 FAIL)

**Issue**: Wrong assertion logic - `.toContain()` expects value in array, not array contains value

**Error**:
```
Error: expect(received).toContain(expected) // indexOf
Expected value: 404
Received array: [400, 422, 500]
```

**Root Cause**: Assertion logic reversed

**Fix**: Swap assertion order

**Diff**:
```diff
-            expect([400, 422, 500]).toContain(response.status());
+            expect(response.status()).toBeOneOf([400, 422, 500]);
```

Or use alternative:
```diff
-            expect([400, 422, 500]).toContain(response.status());
+            expect([400, 422, 500]).toContain(response.status());
```

Should be:
```diff
-            expect([400, 422, 500]).toContain(response.status());
+            const status = response.status();
+            expect(status === 400 || status === 422 || status === 500).toBe(true);
```

**Re-proof**: Re-run chromium-only test after fix

---

## Prioritized Remediation

### HIGH PRIORITY (Backend Amendment Required)

1. **Intent Routing Endpoint Missing**: Add `/api/orchestration/intent` endpoint to backend
   - Returns `agentId` in response metadata
   - Routes prompts via intentRouter
   - This is **FAIL_BLOCKING** per AUDIT.md - tests must validate real endpoints

### MEDIUM PRIORITY (Test Fixes)

2. **Multi-User Isolation**: Fix ES module import
3. **Orchestrator Resilience**: Fix assertion logic

---

## Re-Proof Plan

### Option A: Backend Amendment (Recommended per AUDIT.md)

1. Add orchestration endpoint to backend
2. Re-run `./artifacts/phase4-execute.sh`
3. Expected: 45/45 PASS

### Option B: Test-Only Fixes (Partial)

1. Fix multi-user-isolation import
2. Fix orchestrator-resilience assertions
3. Re-run chromium-only
4. Expected: 30/45 PASS (intent-routing still FAIL_BLOCKING)

---

## Verdict

**FAIL_BLOCKING** per AUDIT.md requirements:
- Backend orchestration endpoint missing (agent metadata not available)
- This is expected - tests are designed to validate real endpoints
- Cannot proceed to Phase 4 PASS without backend amendment

**Next Steps**:
1. Document this as expected FAIL_BLOCKING
2. Propose minimal backend amendment
3. OR: Mark Phase 4 as "implementation complete, awaiting backend support"

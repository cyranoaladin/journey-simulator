# Backend Test Correction Strategy
**Date:** 2026-01-10
**Progress:** 4/74 tests fixed (phase4-contracts)
**Remaining:** 70 tests

---

## Test Failures Analysis

### Category 1: DB Integration Tests (21 tests) - BLOCKER
**Files:**
- `__tests__/s2_api.test.js` (7 tests)
- `__tests__/s2_logic.test.js` (7 tests)
- `__tests__/s2_evaluation.test.js` (4 tests)
- `tests/feedback.test.js` (1 test)
- `tests/integration/resourceValidator.integration.test.js` (2 tests)

**Problem:** All try to connect to MongoDB despite `SKIP_DB_CONNECTION=true`
**Root Cause:** Tests have explicit `mongoose.connect()` calls in beforeAll hooks
**Impact:** BLOCKING - 21 tests fail immediately

**Solutions:**
1. **Quick Fix (1h):** Add conditional skip if DB not available
2. **Proper Fix (2h):** Separate into `tests/integration-with-db/` folder
3. **Best Fix (3h):** Mock mongoose properly for unit tests

**Recommendation:** Option 2 - Separate integration tests

---

### Category 2: Route Tests with 500 Errors (15 tests)
**Files:**
- `__tests__/routes.export.test.js`
- `__tests__/routes.admin.test.js`
- `__tests__/routes.dao.test.js`
- `tests/routes.supertest.spec.js`
- `__tests__/routes.orchestration.test.js`

**Problem:** Routes return 500 Internal Server Error instead of expected responses
**Root Cause:** Likely missing dependencies, middleware issues, or app setup problems
**Impact:** HIGH - 15 tests affected

**Solutions:**
1. Debug each route handler individually
2. Check app.js setup in test environment
3. Verify all middleware is properly initialized

**Estimated Time:** 3-4 hours

---

### Category 3: Orchestrator Issues (20 tests)
**Files:**
- `__tests__/orchestrator_history_window.test.js` (3 tests)
- `__tests__/zynoOrchestrator.test.js` (8 tests)
- `__tests__/e2e/orchestration.e2e.test.js` (5 tests)
- `__tests__/demoMission.test.js` (4 tests)

**Problem:**
- History window: Expected >=20 entries, received 0
- Orchestrator: Various failures in mock setup and execution

**Root Cause:** Complex orchestration logic not properly mocked
**Impact:** HIGH - Core functionality

**Solutions:**
1. Fix history window population logic
2. Update orchestrator mocks to match current implementation
3. Review orchestration test patterns

**Estimated Time:** 4-5 hours

---

### Category 4: Memory Persistence (2 tests)
**Files:**
- `__tests__/memory_persistence.test.js`

**Problem:** Receives null instead of expected memory object
**Root Cause:** Memory store not properly initialized in test environment
**Impact:** MEDIUM

**Estimated Time:** 1 hour

---

## Recommended Approach

### Phase A: Immediate Wins (2-3 hours)
1. ✅ **phase4-contracts.test.js** - DONE (4 tests fixed)
2. **Separate DB tests** - Move s2_*, feedback, resourceValidator to `tests/integration-with-db/`
3. **Skip DB tests in unit runs** - Update package.json scripts

**Result:** 25 tests fixed/separated (4 + 21)
**Progress:** 25/74 = 34% → 49 tests remaining

### Phase B: Route Fixes (3-4 hours)
4. **Debug routes.export.test.js** - Fix export route
5. **Debug routes.admin.test.js** - Fix admin routes
6. **Debug routes.dao.test.js** - Fix DAO routes
7. **Debug routes.supertest.spec.js** - Fix generic route tests
8. **Debug routes.orchestration.test.js** - Fix orchestration route

**Result:** 15 tests fixed
**Progress:** 40/74 = 54% → 34 tests remaining

### Phase C: Orchestration (4-5 hours)
9. **Fix history window** - orchestrator_history_window.test.js
10. **Fix zynoOrchestrator.test.js** - Update mocks
11. **Fix e2e/orchestration.e2e.test.js** - E2E orchestration
12. **Fix demoMission.test.js** - Demo mission flow

**Result:** 20 tests fixed
**Progress:** 60/74 = 81% → 14 tests remaining

### Phase D: Cleanup (1-2 hours)
13. **Fix memory_persistence.test.js** - Memory store initialization
14. **Verify all tests pass** - Final validation

**Result:** 74/74 tests passing
**Progress:** 100%

---

## Total Time Estimate

- **Phase A:** 2-3 hours (immediate wins)
- **Phase B:** 3-4 hours (routes)
- **Phase C:** 4-5 hours (orchestration)
- **Phase D:** 1-2 hours (cleanup)

**Total:** 10-14 hours

---

## Alternative: Pragmatic Approach

### Skip Non-Critical Tests
If time is limited, we can:
1. Fix phase4-contracts ✅ (Done)
2. Separate DB tests (mark as integration-only)
3. Fix only critical route tests (admin, orchestration)
4. Skip history window for now (non-blocking for release)

**Result:** 
- Core unit tests: 100% pass
- Integration tests: Separate suite (run with DB available)
- E2E tests: Run separately

**Time:** 4-5 hours
**Coverage:** ~80% tests passing in unit suite

---

## Decision Point

**Option 1: Full Fix (10-14h)**
- All 74 tests fixed
- Complete Phase 1 certification
- Ready for Phase 2-8

**Option 2: Pragmatic (4-5h)**
- Critical tests fixed
- DB tests separated
- Continue with Phase 2-8
- Return to remaining tests later

**Option 3: Stop Here**
- Accept current state (Frontend 100%, Backend partial)
- Document known issues
- Move to Phase 2-8 validation

**Recommendation:** Option 2 (Pragmatic)
- Balances time vs value
- Unblocks audit continuation
- Documents separation clearly


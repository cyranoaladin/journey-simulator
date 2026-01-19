# Phase 2 Execution Instructions (AUDIT.md Compliance)

## Current Status
- ✅ Backend (3002): UP
- ❌ Frontend Preview (4173): DOWN
- ✅ Phase 2 Tests: Implemented (5/5)
- ✅ Guards: Validated (A, B PASS)

## Required Action: Start Frontend Preview

### Terminal 2 (Keep Open)
```bash
cd journey-simulator
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

**Expected Output**: Server listening on `http://127.0.0.1:4173`

## Execute Phase 2 Validation

### Terminal 3 (After Preview is UP)
```bash
./artifacts/phase2-execute.sh
```

This script will:
1. Run preflight check (both servers must be UP)
2. Execute Phase 2 gate (--trace off)
3. Run zero-secrets scans (token leak + trace artifacts)
4. Display verdict (PASS/FAIL)

## Expected Results

### PASS Criteria (Zero Tolerance)
- ✅ All tests pass (Y/Y)
- ✅ 0 console errors
- ✅ 0 token leaks
- ✅ 0 trace artifacts
- ✅ English-only UI assertions

### If FAIL
- Review test output for specific failures
- Apply surgical fixes (minimal, targeted)
- Re-run `./artifacts/phase2-execute.sh`
- Document root cause + fix in qa-report.md

## After Phase 2 PASS

1. Document in `artifacts/qa-report.md` (English-only):
   - Date/time
   - Gate command (--trace off)
   - Results (Y/Y passed)
   - Confirmations: 0 token leaks, 0 trace artifacts
   - Screenshots location

2. Start Phase 3 implementation immediately:
   - Create 03-user-workflows/ directory
   - Implement 5 workflow tests
   - Add Phase 3 gate to BEGIN_RELEASE_GATES

## No Shortcuts
- Do NOT use `npm run dev` instead of preview
- Do NOT skip zero-secrets scans
- Do NOT document PASS without full validation
- Do NOT proceed to Phase 3 without Phase 2 PASS

All actions must align with AUDIT.md (zero drift tolerance).

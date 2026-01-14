# Phase 2 - Final Execution Checklist (AUDIT.md Compliance)

## Status: READY FOR EXECUTION

---

## Prerequisites Validated
- [x] Backend running (port 3002)
- [x] Phase 2 tests implemented (5/5)
- [x] Guards validated (A, B PASS)
- [x] Zero-secrets policy documented (amendment)
- [x] Execution scripts created
- [ ] Frontend preview running (port 4173) **← BLOCKER**

---

## Execution Sequence (Zero Tolerance)

### Step 1: Start Frontend Preview (Terminal 2 - Keep Open)

```bash
cd journey-simulator
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

**Expected**: Server listening on `http://127.0.0.1:4173`

**Critical**: `--strictPort` prevents Vite from silently switching ports

---

### Step 2: Preflight Check (Terminal 3)

```bash
./artifacts/phase2-preflight.sh
```

**PASS Criteria**:
- ✅ Backend (3002): UP
- ✅ Frontend Preview (4173): UP

**If FAIL**: Do NOT proceed. Diagnose with:
```bash
lsof -i :4173
curl -s -I http://127.0.0.1:4173 | head
```

---

### Step 3: Execute Phase 2 Gate + Scans (Terminal 3)

```bash
./artifacts/phase2-execute.sh
```

**This script executes**:
1. Preflight check
2. Phase 2 gate (--trace off)
3. Token leak scan (0 hits required)
4. Trace artifact scan (0 files required)
5. English-only validation (0 French strings)
6. Final verdict (PASS/FAIL)

---

## PASS Criteria (All Required - Zero Tolerance)

- ✅ All Phase 2 tests PASS (X/X)
- ✅ Console-guard PASS (0 unexpected errors)
- ✅ Token leak scan: 0 hits
- ✅ Trace artifact scan: 0 files
- ✅ English-only validation: 0 French strings
- ✅ Layout invariants validated (no overlap)
- ✅ Screenshots captured (no secrets in UI)

---

## If FAIL

1. **Capture failure evidence**: Full terminal output
2. **Apply surgical fix**: Minimal diff, test-by-test
3. **Re-run**: `./artifacts/phase2-execute.sh`
4. **Document**: Root cause + fix in qa-report.md

**No purge cheating**: Post-run purge to claim PASS is forbidden

---

## After Phase 2 PASS

### Immediate Actions

1. **Document in qa-report.md** (English-only):
   - Timestamp (ISO format)
   - Gate command (--trace off)
   - Results (X/X passed)
   - Confirmations:
     - TOKEN_SCAN=0_HITS
     - TRACE_ARTIFACTS=0_FILES
     - FRENCH_STRINGS=0_DETECTED
     - LANGUAGE_POLICY=ENFORCED
   - Screenshot evidence path

2. **Start Phase 3 Implementation**:
   - Create 03-user-workflows/ directory
   - Implement helpers (progression.ts, rbac.ts)
   - Create 5 workflow tests
   - Add Phase 3 gate to BEGIN_RELEASE_GATES

---

## No Shortcuts Policy

- ❌ Do NOT use `npm run dev` instead of preview
- ❌ Do NOT skip zero-secrets scans
- ❌ Do NOT document PASS without full validation
- ❌ Do NOT proceed to Phase 3 without Phase 2 PASS documented
- ❌ Do NOT purge artifacts post-run to hide failures

---

## Ready to Execute

**Next Action**: Start frontend preview on port 4173, then run phase2-execute.sh

**Awaiting**: Full terminal output for surgical analysis if failures occur

All actions aligned with AUDIT.md (zero drift tolerance).

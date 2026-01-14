# FINAL REPORT: RUN_021 (ITER 1/4 COMPLETED)

## VERDICT: FAIL_BLOCKING

## FILES CHANGED
`journey-simulator/global-setup.ts` (lines 98-112): addInitScript seeds localStorage + sessionStorage before goto

## COUNTS (ITER1)
```
expected:    102 (baseline 104, Δ -2)
unexpected:   16 (baseline  14, Δ +2)
skipped:       0 (baseline   0, Δ  0)
flaky:         0 (baseline   0, Δ  0)
```

## PROOF PACKS
- `artifacts/proof/lead_claude_audit_run_020/` (FAILED - catastrophic regression)  
- `artifacts/proof/lead_claude_audit_run_021_iter1/` (MINOR REGRESSION)

## BLOCKING FAILURES (16 tests, ranked by category)

**P0 RUNMODE (5 tests):**
- runmode-guard-violation: Guard flag check fails
- header-navigation: Demo mode switch broken
- header-navigation: Simulation mode switch broken  
- mode-persistence: Multi-mode switching fails
- supreme-integrity: Mode mismatch rejection fails

**P0 AUTH/ISOLATION (2 tests):**
- multi-user-isolation: Orchestration state not isolated
- supreme-isolation: Headers/data sync broken

**P1 UI_STATE (2 tests):**
- zyno-chat-scroll: Scroll behavior unstable×2

**P1 GAME_LOOP (3 tests):**
- resource-production: Agent dashboard fails
- persona-onboarding: Workspace access blocked
- core-game-loop: Quiz/mint queue broken

**P1 INTEGRITY (2 tests):**
- supreme-integrity: Solana transaction proof fails
- supreme-integrity: Double-click protection fails

**P1 NAVIGATION (1 test):**
- supreme-auditor: Dashboard consistency fails

**P1 OTHER (1 test):**
- [count includes retries]

## ROOT CAUSE ANALYSIS

### Auth State Seeding (PARTIAL FIX APPLIED)
- **Applied**: addInitScript seeds localStorage + sessionStorage BEFORE page.goto
- **Issue**: tokenStore reads sessionStorage first (lines 86-90), but tests use storageState() which only persists localStorage
- **Result**: Tokens not available on test execution, causing auth redirects

### RunMode Persistence (NOT FIXED)
- **Issue 1**: Two sources of truth: `localStorage['mfai-run-mode']` + `localStorage['mfai-journey-storage'].state.runMode`
- **Issue 2**: Zustand persist rehydration OVERWRITES getInitialRunMode() result
- **Issue 3**: Mode switcher doesn't update standalone flag consistently
- **Result**: Mode switching broken, guard checks fail

### Missing Headers (NOT FIXED)
- **Issue**: realModeTest fixture doesn't add `x-run-mode: real` header to requests
- **Result**: Backend rejects or mishandles requests in real mode

## NEXT MINIMAL FIX PLAN (Top 10, ranked by blocking impact)

1. **CRITICAL: Fix tokenStore-Playwright mismatch**
   - Modify tokenStore.getAccessToken() to check localStorage FIRST, not sessionStorage
   - OR modify global-setup to NOT seed sessionStorage (only localStorage)
   - **Rationale**: Playwright storageState only persists localStorage, not sessionStorage

2. **CRITICAL: Single runMode source of truth**
   - Remove runMode from zustand persist partialize
   - Always read from standalone flag `localStorage['mfai-run-mode']`
   - **Rationale**: Tests expect standalone flag to be authoritative

3. **P0: Add x-run-mode header in fixture**
   - Edit `tests/e2e/fixtures/realModeTest.ts`
   - Add extraHTTPHeaders: `{ 'x-run-mode': 'real' }` to context options
   - **Rationale**: Backend validates runMode via header

4. **P0: Fix guard flag timing**
   - Verify ZynoConsole actually mounts in /zyno route
   - Add console.log to confirm guard check executes
   - **Rationale**: Test expects `window.__GUARD_VIOLATION__=1` but may not be set

5. **P1: Add data-testid to mode switcher**
   - Add `data-testid="mode-switcher-{mode}"` to mode buttons
   - **Rationale**: Tests fail to find mode switcher reliably

6. **P1: Verify E2E_MOCK_AGENTS behavior**
   - Check agent orchestration endpoints return mock data when E2E_MOCK_AGENTS=true
   - **Rationale**: resource-production test expects mock agent execution

7. **P1: Fix Zyno chat scroll state**
   - Add stable ref to chat container
   - Ensure scrollToBottom only triggers after messages render
   - **Rationale**: Chat scroll tests flaky due to race conditions

8. **P1: Fix persona onboarding flow**
   - Verify journey workspace route accessible after persona selection
   - Check if auth state persists through navigation
   - **Rationale**: Workspace access blocked after onboarding

9. **P1: Add Solana transaction mock**
   - Ensure mintWorker returns mock tx signature in E2E mode
   - **Rationale**: Solana proof test expects transaction hash

10. **P1: Add double-click guard**
    - Add disabled state on submit buttons after first click
    - **Rationale**: Double-click protection test expects UI to prevent duplicate submits

## RECOMMENDATION

**STOP ITERATION - ARCHITECTURAL FIX REQUIRED**

The current approach (seeding via addInitScript) is insufficient because:
1. Playwright storageState() persistence model incompatible with app's sessionStorage-first strategy
2. Dual runMode storage creates race conditions between persist rehydration and initial state
3. Tests assume standalone localStorage flags are authoritative, but app uses Zustand persist

**Recommended Path Forward:**
1. Revert to RUN_014-017 baseline (14 unexpected stable)
2. Apply CRITICAL fixes #1-#3 above in SINGLE changeset
3. Run subset of 16 blocker tests only
4. If subset improves, run full audit
5. Do NOT attempt further iteration without architectural alignment

**Estimated Effort:**
- Fix #1 (tokenStore): 5 min (one-line change)
- Fix #2 (runMode dedup): 15 min (remove from persist, update setRunMode)
- Fix #3 (headers): 5 min (add extraHTTPHeaders to fixture)
- **Total: 25 minutes for P0 fixes**

---
Generated: 2026-01-13T18:15:00Z  
Campaign: lead_claude_audit_run_021  
Status: FAIL_BLOCKING (ITER1/4, halted due to architectural issues)

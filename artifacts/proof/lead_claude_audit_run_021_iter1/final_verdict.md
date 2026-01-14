# RUN_021_ITER1 VERDICT: FAIL_BLOCKING

## COUNTS
expected: 102 (baseline 104, Δ-2) | unexpected: 16 (baseline 14, Δ+2) | skipped: 0 | flaky: 0

## BLOCKING FAILURES (16 tests)

**P0 RUNMODE (5):** runmode-guard-violation, header-navigation x2, mode-persistence, supreme-integrity mode-mismatch

**P0 AUTH/ISOLATION (2):** multi-user-isolation, supreme-isolation

**P1 UI_STATE (2):** zyno-chat-scroll x2

**P1 GAME_LOOP (3):** resource-production, persona-onboarding, core-game-loop

**P1 INTEGRITY (2):** supreme-integrity solana + double-click

**P1 NAVIGATION (1):** supreme-auditor

## NEXT FIX (Top 8, ranked)

1. Verify sessionStorage seeds in addInitScript (tokenStore prefers sessionStorage)
2. Add guard flag window.GUARD_VIOLATION_TRIGGERED in runMode mismatch handler
3. Verify setRunMode persists to localStorage 'mfai-run-mode'
4. Add x-run-mode header in realModeTest fixture
5. Wait for zustand rehydration in global-setup (hasHydrated check)
6. Add data-testid to mode switcher buttons
7. Verify E2E_MOCK_AGENTS backend behavior
8. Add explicit re-render trigger on mode switch

## FILES CHANGED
journey-simulator/global-setup.ts (lines 95-168)

## PROOF PACK
artifacts/proof/lead_claude_audit_run_021_iter1/

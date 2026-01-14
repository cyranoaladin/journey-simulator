# FAIL_BLOCKING - MAX_ITERS EXHAUSTED (RUN 014-019)

## Final Count (RUN_018 PATH_B)
- expected: 38
- unexpected: 37
- skipped: 43
- flaky: 0
- VERDICT: FAIL (catastrophic regression)

## Baseline (RUN 014-017)
- expected: 104
- unexpected: 14 (stable across 4 runs)
- skipped: 0

## Blocking Failures (14 from baseline)

### P0 AUTH_FLOW (3 tests)
1. `04-data-validation/rag-upload.spec.ts` - redirect /login
2. `05-agents-orchestration/multi-user-isolation.spec.ts` - redirect /login  
3. `99-english-compliance/ui-runtime.spec.ts` - redirect /login

### P0 SUPREME_INTEGRITY (3 tests)
4. supreme-integrity: "Mode Mismatch Rejection" - redirect /login
5. supreme-integrity: "Double-Click Protection" - redirect /login
6. supreme-integrity: "Solana Real Transaction Proof" - HTML instead of JSON

### P0 RUNMODE (1 test)
7. supreme-auditor: "Navigation Consistency Check" - shows mode=simulation banner

### P0 ISOLATION (1 test)
8. supreme-isolation: "Headers and Data Sync" - timeout waiting for API call with x-run-mode header

### P1 OTHER (6 tests)
9. `03-agent-workflows/resource-production.spec.ts` - timeout
10. `02-agent-core/phase-2-strategy.spec.ts` - timeout
11. `02-agent-core/zyno-interaction.spec.ts` - timeout
12. `04-core-game-loop.spec.ts` - timeout
13. `00-preflight/runmode-guard-violation.spec.ts` - guard detection
14. `01-navigation/comprehensive-menu.spec.ts` - DAO nav timeout

## Root Cause
Playwright storageState() captures browser state from FIRST navigation (page.goto), NOT from subsequent page.evaluate() calls. AuthContext reads accessToken synchronously from tokenStore (localStorage) but gets empty value because storageState was saved before page.evaluate() injection.

## Minimal Next Fix
In `global-setup.ts`:
1. BEFORE page.goto(): Inject localStorage seed via page.addInitScript()
2. THEN page.goto() - app hydrates with correct state
3. THEN context.storageState() - captures correct hydrated state

Example:
```typescript
await page.addInitScript(({ token, refresh, zustandState }) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('mfai-journey-storage', JSON.stringify(zustandState));
  if (refresh) localStorage.setItem('refreshToken', refresh);
}, { 
  token: authData.token, 
  refresh: authData.refreshToken,
  zustandState: { state: { runMode: 'real', ... }, version: 0 }
});
await page.goto(baseURL);
await context.storageState({ path: storagePath });
```

This ensures storageState contains the injected values, not empty initial state.

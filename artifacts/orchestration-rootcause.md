# Orchestration Abort Root Cause Analysis

- **Timestamp:** 2026-01-03T21:35:14Z
- **Profile:** PROFILE_B (Prod-like orchestration, real LLM + Mongo)
- **Entry point:** `POST http://127.0.0.1:3002/orchestration`
- **Input:** "Build a DAO voting plan with quorum, power levels, and AEPO/AECO tracking."

## 1. Observed Symptoms
- Frontend Playwright spec fails with `AbortError` after 180s wait window.
- Reproduction script (`scripts/repro_orchestration_real.js`) aborts at the 30s client timeout, yielding the same error payload captured in the E2E traces.
- Backend access logs show the request finishing with `POST /orchestration - - ms - -`, indicating the client closed the socket before the server responded.

## 2. Evidence
- LLM latency per agent (from `artifacts/backend-orchestration-500.log`):
  - DAOAgent → `latencyMs=13671`
  - Web3LegalAgent → `latencyMs=11235`
  - AuditAgent → still running when client aborted (no completion log).
- Total elapsed time before abort: `durationMs=30002` (client-side budget) recorded in `artifacts/orchestration-repro.md`.
- No stack trace or exception surfaces on the server; orchestration continues until the client terminates the connection.

## 3. Root Cause
Sequential orchestration of three LLM-driven agents (`DAOAgent`, `Web3LegalAgent`, `AuditAgent`) consistently exceeds the 10 s UI timeout (and even the 30 s diagnostic budget). The third agent is still awaiting an OpenAI response when the client aborts, causing the request to bubble up as `AbortError` on the frontend despite the backend remaining healthy.

## 4. Minimal Fix Proposal (Single Sprint Scope)
- **Extend real-mode timeout contract to 60 s**
  - Backend: update `mf-back/orchestration/timeoutGuard.js` so the `real` profile uses `60000` ms instead of `30000`.
  - Frontend: raise the AbortController window in `journey-simulator/src/components/Zyno/ZynoConsole.tsx` (mission launch) and the shared request helper `journey-simulator/src/api/mf-back.ts` to match the 60 s SLA.
- **Surface long-running progress**
  - Emit streaming progress events from `mf-back/orchestration/executionEngine.js` so the UI shows “Agent X running…” while waiting, avoiding user-perceived hangs.

## 5. Impacted Files
- `mf-back/orchestration/timeoutGuard.js`
- `mf-back/orchestration/executionEngine.js`
- `journey-simulator/src/components/Zyno/ZynoConsole.tsx`
- `journey-simulator/src/api/mf-back.ts`

## 6. Residual Risk
- LLM variance can still exceed 60 s under heavy load; additional guard rails (parallelisation, caching) may be needed for truly worst-case prompts.
- Streaming telemetry requires coordination with consumers; without UI updates the request may still *feel* stalled even if timeouts are higher.

## 7. Re-test Plan (Post-Fix)
1. Re-run `MFAI_ORCHESTRATION_TIMEOUT=60000 node scripts/repro_orchestration_real.js` to confirm completion without AbortError.
2. Execute `npx playwright test tests/e2e/04-agents/zyno-persistence.spec.ts --project=chromium --workers=1 --trace on` twice to prove stability.
3. Repeat the same spec for `--project=firefox` and `--project=mobile-chrome` to validate cross-browser parity.

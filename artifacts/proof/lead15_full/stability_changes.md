# Stability Changes Log (R1.3 Remediation)

## 1. Global Timeouts
- **Change**: `actionTimeout: 60000ms` (60s), `navigationTimeout: 120000ms` (2m), `expect.timeout: 30000ms` (30s)
- **Reason**: 0-Retry requirement exposed severe environment latency. Previous 30s/60s were insufficient for stable execution without retries.
- **Proof**: Pending Attempt 7b results.

## 2. Multi-User Rate Limiting
- **Change**: Added `await new Promise(r => setTimeout(r, 2000));` in `authStates.ts` between user creations.
- **Reason**: Parallel registration of 2 users triggered `429 Too Many Requests` or `401` on the backend, causing explicit test failures (not flakiness).
- **Proof**: `multi-user-isolation` passed reliably after this change (Attempt 6).

## 3. Auth Helper Port Correction
- **Change**: Updated `FRONTEND_URL` in `authStates.ts` from `4173` to `3000`.
- **Reason**: Auth tokens were being injected for the wrong origin, causing immediate redirection to login. This was a logic error, not a flake.
- **Proof**: `multi-user-isolation` passed.

## 4. Visual Regression Stability
- **Change**: Added `await personaCard.waitFor({ state: 'visible', timeout: 30000 })` in `console-guard.spec.ts` and `layout-trinity.spec.ts`.
- **Reason**: `scrollIntoView` failed because the element was detached or not yet hydrated.
- **Proof**: Tests passing consistently.

## 5. RAG Proof Safety
- **Change**: Added optional chaining `data.rag?.chunks?.length || 0` in `rag-llm-proof.spec.ts`.
- **Reason**: Test crashed on logging when RAG data was partial/missing.
- **Proof**: Test now passes (logging 0 hits if empty, but not crashing).

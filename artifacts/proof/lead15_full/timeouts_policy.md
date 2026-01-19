# Timeouts Policy (R1.3 Structural Stabilization)

## Global Defaults (Sanitized)
- **Action**: 15s (was 60s)
- **Navigation**: 30s (was 120s)
- **Expect**: 10s (was 30s)
- **Test**: 60s (was 240s)

## Local Exceptions
- **RAG/LLM**: 60s (network latency)
- **Onboarding/Signup**: 30s (backend hashing)
- **Layout Trinity**: 30s (complex hydration) - *Only if strictly necessary after fixes*

## Goals
- Eliminate "Nuclear" timeouts.
- Fail FAST if structural issue exists.
- Rely on `waitForLoadState` and events, not time.

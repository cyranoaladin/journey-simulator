# MFAI — Documentation “Source of Truth”

This directory defines **how Cursor (and humans) should read and reason about MFAI**.

## Closed-world policy
- Treat this repo as the **only** source of facts.
- If an operational fact is not in docs or explicitly provided by the user, **do not guess**.

## Recommended reading order (high signal)

### Product & platform deep dive (primary)
- `docs/PLATFORM_DEEP_DIVE_FR.md`
- `docs/product/vision_mvp_personas_stories.md`
- `docs/JOURNEY_STATE_MACHINE.md`

### Architecture & boundaries
- `docs/ARCHITECTURE.md`
- `docs/ARCHITECTURE_DATA.md`
- `docs/architecture_multi_agents.md`

### Auth + Web3
- `docs/AUTH_FLOWS.md`
- `docs/WEB3_INTEGRATION.md`
- `docs/solana_spec.md`
- `docs/idl/solana_devnet_flow.md`

### API contracts
- `docs/API_CONTRACT_MF_BACK.md`
- `docs/openapi/mf-back.openapi.yaml`
- `docs/openapi/journey-simulator.yaml`

### Ops / rollout / safety
- `docs/MCP_RUNBOOK_FR.md`
- `docs/HEALTHCHECK.md`
- `docs/cicd/rollback.md`
- `docs/security/hardening.md`

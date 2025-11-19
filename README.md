# Money Factory AI — Journey Simulator (MVP Next.js)

Authoritative application for the investor demo lives in `web/` (Next.js 14 app router). Legacy directories `journey-simulator/` and `mf-back/` are preserved as reference artifacts; do not modify them for the MVP unless explicitly required.

What’s here
- web/: Next.js app (UI + API), Prisma, wallet adapter, GPT‑5.1 orchestrator, Solana devnet flows
- docs/: Centralized product/tech documentation (OpenAPI, schemas, prompts, CI/CD, observability, demo, acceptance, etc.)
- journey-simulator/: Prior iteration (read‑only reference for docs and samples)
- mf-back/: Express/Mongo experimental backend (read‑only reference)

Quickstart (MVP web)
1) cd web && npm ci
2) cp .env.example .env and set: OPENAI_API_KEY, SOLANA_RPC_URL, NEXT_PUBLIC_SOLANA_RPC_URL, ADMIN_API_KEY
   - Optional for real devnet mint: MINTER_SECRET_KEY and KILL_SWITCH=0
3) npx prisma db push
4) npm run dev

Tests
- Unit: npm run test:unit
- E2E: npm run e2e:install (1st time), then npm run test:e2e
- All: npm run verify (lint + build + unit + e2e)

Docs
- OpenAPI: docs/openapi/journey-simulator.yaml
- Acceptance checklist: docs/acceptance/checklist.md
- Demo script: docs/demo/script.md (fallbacks in docs/demo/fallbacks.md)

Notes
- No secrets in code; only .env local files. HTTPS is mandatory in production.
- Use DEMO_MODE=true for deterministic, offline‑safe demo; force llm=1 query param to call GPT‑5.1 live.

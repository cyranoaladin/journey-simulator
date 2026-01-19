<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Changelog

All notable changes to this project will be documented in this file.

## 0.3.0 - 2025-10-14

- Metaplex (devnet) MVP: /api/mint/simulate, /api/mint/execute + UI /mint
- Prisma (SQLite) with models: User, Journey, Achievement, MintLog, AgentRun
- Journeys API (GET/POST)
- Agents scaffolding (orchestrator, patterns/safety, tools/solana)
- Unit tests with coverage for new APIs

## 0.2.0 - 2025-10-14

- Wallet integration with @solana/wallet-adapter and global provider
- Pages: /wallet, /tx, /ai (demo), /mint (placeholder), /docs
- API: /api/tx/prepare (web3.js), /api/health, /api/ai/echo (zod validation)
- Middleware: API rate limiting per IP
- Security: CSP hardened per environment; headers reinforced
- Observability: Sentry (@sentry/nextjs) wired (DSN via env)
- DevOps: Dockerfile, .dockerignore, deploy samples (nginx, systemd)
- Tests: Jest + RTL unit tests, Playwright E2E; backend coverage >=85%
- CI: GitHub Actions workflow (lint, build, unit, E2E)
- Docs: README updated, OpenAPI spec at public/openapi.yaml

## 0.1.0 - Initial

- Project scaffolding with Next.js, Tailwind, basic pages

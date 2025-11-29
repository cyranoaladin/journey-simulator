# Money Factory AI — Journey Simulator Monorepo

This repository now hosts the three maintained packages that power the Journey Simulator experience:

- `journey-simulator/` — Vite + React front-end for the Cognitive Activation Protocol™, Zustand stores, Playwright/Vitest test suites, Storybook, and wallet integrations.
- `web/` — Next.js 14 companion portal exposing Solana minting, Prisma-backed admin tooling, and server-rendered utility flows.
- `mf-back/` — Express + MongoDB API that handles authentication, journey progress, agent orchestration, and analytics.

Key documentation lives under `docs/` (cahiers des charges, architecture notes, OpenAPI specs, demo scripts, etc.).

## Quickstart

### React Journey Simulator (Vite)

```bash
cd journey-simulator
npm ci
cp .env.example .env
npm run dev
```

Run tests and linting:

- `npm run test` (Vitest)
- `npm run test:e2e` (Playwright)
- `npm run lint`

### Next.js Companion Portal

```bash
cd web
npm ci
cp .env.example .env   # set SOLANA_RPC_URL, NEXT_PUBLIC_SOLANA_RPC_URL, DATABASE_URL, etc.
npx prisma db push
npm run dev
```

Useful scripts:

- `npm run test:unit`
- `npm run test:e2e`
- `npm run verify` (lint + build + tests)
- `npm run migrate:deploy`

### Express API

```bash
cd mf-back
npm ci
cp .env.example .env   # configure MONGO_URI, JWT_SECRET, ADMIN_API_KEY, OPENAI_API_KEY, LLM_* defaults
npm run dev
```

Tests: `npm test`

## Deployment

Use `docker-compose.yml` for local full-stack runs (`./start_dev.sh`).

For production deployments on dedicated servers (e.g., `journey.mfai.app`), please refer to the [Deployment Guide](DEPLOY.md) (`DEPLOY.md`). It uses `docker-compose.deploy.yml` to ensure isolation and avoid port conflicts.

## Conventions

- Keep secrets in environment files only; never commit credentials.
- Follow the lint/test pipelines before opening pull requests.
- Refer to the cahiers des charges in `docs/` to validate feature scope and UX expectations.

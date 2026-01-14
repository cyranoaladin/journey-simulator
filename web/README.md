<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Journey Web (Next.js)

*Version*: 0.1.2
*Dernière mise à jour*: Décembre 2025
*Stack*: Next.js 14.2.33, React 18.3.1, Prisma 5.22.0, PostgreSQL, Redis 5.10.0, BullMQ 5.65.0, UMI/Metaplex 3.4.0

Premium, secure, browser-first (UI) + strict backend (API) architecture.

## Summary

- **Stack**: Next.js 14.2.33 (App Router), Tailwind CSS 3.4.13, TypeScript 5.5.4
- **Wallet**: @solana/wallet-adapter (Phantom, extensible)
- **API**: /api/tx/prepare (web3.js) — builds unsigned transactions server-side
- **Auth**: SIWS (Sign-In With Solana) avec Redis pour challenge storage
- **Minting**: Pipeline asynchrone avec BullMQ + UMI/Metaplex 3.4.0
- **Database**: PostgreSQL avec Prisma 5.22.0 ORM
- **Queue**: BullMQ 5.65.0 sur Redis 5.10.0 pour jobs asynchrones
- **Security**: Strict CSP, security headers, no client-side secrets
- **Tests**: unit (Jest 29.7 + RTL) and E2E (Playwright 1.57)
- **DevOps**: Multi-stage Dockerfile, Nginx + systemd samples
- **Observability**: Sentry 8.9.2 (client & server) via @sentry/nextjs (DSN via .env)
- **CI**: GitHub Actions (lint, build, unit, E2E)

## Start

```bash
npm install
# Variables (devnet recommended)
cp .env.example .env
# Edit .env and define SOLANA_RPC_URL and/or NEXT_PUBLIC_SOLANA_RPC_URL
npm run dev
```

## Build & Execution

```bash
npm run build
npm start
```

## Tests

- Unit (with minimal backend coverage >=85%):

```bash
npm run test:unit
```

- End-to-end:

```bash
npm run e2e:install   # first time only (installs browsers)
npm run test:e2e      # runs Playwright, starts server in dev mode to avoid build flakes
```

- Verify everything locally (lint + build + unit + e2e):

```bash
npm run verify
```

### Anti-flake E2E Conventions

- Use stable data-testids for critical elements:
  - /tx: tx-heading, tx-wallet-cta, tx-submit, status
  - /ai: ai-heading, ai-echo-submit, ai-echo-result, ai-echo-error
- Prefer robust Playwright locators:
  - getByTestId('...') rather than potentially localized text
  - Resilient expectations: toBeVisible/toContainText with increased timeout (up to 15s)
  - Synchronize with network: wait for /api/ai/echo response before asserting render
- Avoid networkidle with Next.js; prefer targeted expectations and expect.poll if necessary
- Playwright traces retained on failure (trace: 'retain-on-failure') and uploaded as CI artifacts

Notes:

- Unit tests include mocks for web3 and API route, without secrets or network.
- A client-side test mode is available via NEXT_PUBLIC_TEST_MODE=1 (bypass signature for E2E if needed).

## Principles

- No Node API/secret in the browser
- Sensitive operations (AI/DB/RPC sign, transaction preparation) server-side (app/api)
- User wallet signature (non-custodial)

### Health & Metrics

- GET /api/health and GET /api/healthz → simple healthcheck JSON
- GET /api/metrics → internal JSON metrics (counters, latency)

## Configuration

- Inter/Poppins fonts if desired (via global CSS @font-face)
- Environment variables (.env)
  - Solana: SOLANA_RPC_URL, NEXT_PUBLIC_SOLANA_RPC_URL, SOLANA_CLUSTER
  - Admin: ADMIN_API_KEY (protects /admin/\*)
  - LLM (OpenAI Responses API): OPENAI_API_KEY, OPENAI_BASE_URL (optional), LLM_MODEL_NAME, LLM_MAX_OUTPUT_TOKENS, LLM_TEMPERATURE
- web3.js (current) or Metaplex UMI if needed to prepare transactions (see app/api/tx/prepare)

## Metaplex (devnet) — Mint NFT Certificate (MVP)

- Real devnet path (Phase 2b): an isolated signer (SimSigner) is already interfaced; KMS/HSM connection later.
- Feature flags: ENABLE_UMI_REAL (0 by default) to enable real UMI path in the future.
- Endpoints:
  - POST /api/mint/simulate (devnet, dry-run)
  - POST /api/mint/execute (guarded, kill-switch, MINTER_SECRET_KEY required) — supports `x-user-id` header to associate mint with a user
  - GET /api/mint/last — returns the last mint (filterable by `x-user-id` or `?userId=`)
- UI: /mint, “Simulate mint (devnet)” button + execution; success toast and Explorer link after mint
- Security: never cleartext key, MINTER_SECRET_KEY via .env; killswitch activable

## Database (Prisma + SQLite)

- Models: User, Journey, Achievement, MintLog, AgentRun
- File: web/prisma/dev.db
- Commands:
  - prisma: npm --prefix web run prisma -- --help (or npx prisma ...)

### Reset a demo user

- Delete logs and mints of 'demo_user', and (optional) reset a JourneyState:

```bash
# From web/
npm run reset:demo
# Or, with a specific journeyId
npm run reset:demo -- --journeyId=YOUR_JOURNEY_ID
```

### Migrations / Index

- Dev: apply schema without creating migration (suitable for SQLite dev)

```bash
npx prisma db push
```

- Prod: create/validate migrations and deploy them

```bash
# Generate local migration (example)
npx prisma migrate dev -n add_agentlog_user_idx
# Deploy to environment
npx prisma migrate deploy
```

- Note: an index was added on AgentLog(userId, ts) to speed up filtering ?userId=... on /admin/logs.

### Admin (dev-only) — Access protected by x-api-key

- Admin pages available for quick inspection:
- - /admin/state → latest JourneyState (50)
- - /admin/logs → latest AgentLog (50) — filterable via ?journeyId=... and ?userId=...
- - /admin/users → latest users (20) aggregated from AgentLog and MintLog
- These routes are protected by middleware (mandatory header: x-api-key == ADMIN_API_KEY).

Configure a local key (dev):

```bash
# In web/.env
ADMIN_API_KEY=dev_admin_key

# Start afterwards
npm run dev
```

Test via command line:

```bash
# JourneyState
curl -H 'x-api-key: dev_admin_key' http://127.0.0.1:3000/admin/state

# Agent logs (all)
curl -H 'x-api-key: dev_admin_key' http://127.0.0.1:3000/admin/logs

# Agent logs (filtered by journeyId)
curl -H 'x-api-key: dev_admin_key' 'http://127.0.0.1:3000/admin/logs?journeyId=YOUR_JOURNEY_ID'

# Recent users (last 20)
curl -H 'x-api-key: dev_admin_key' http://127.0.0.1:3000/admin/users
```

JS Snippet (Node 18+, native fetch):

```js
const API_KEY = process.env.ADMIN_API_KEY || 'dev_admin_key'
const BASE = process.env.ADMIN_BASE_URL || 'http://127.0.0.1:3000'

async function getState() {
  const res = await fetch(`${BASE}/admin/state`, { headers: { 'x-api-key': API_KEY } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function getLogs(journeyId) {
  const url = new URL(`${BASE}/admin/logs`)
  if (journeyId) url.searchParams.set('journeyId', journeyId)
  const res = await fetch(url, { headers: { 'x-api-key': API_KEY } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

;(async () => {
  console.log('State:', await getState())
  console.log('Logs:', await getLogs(process.env.JOURNEY_ID))
})().catch(console.error)
```

Note: In production, use a real secret value (vault/CI secrets), and do not leave the default key.

## API Docs (OpenAPI)

- Specification: `docs/openapi/journey-simulator.yaml`
- Preview locally (choose one option):
  - RapiDoc (web component)

    ```bash
    npm run openapi:rapidoc
    # Opens http://127.0.0.1:8089/preview.html
    ```

  - ReDoc (CLI)

    ```bash
    npm run openapi:redoc
    # Opens http://127.0.0.1:8088
    ```

## Deployment & CI

- CI GitHub Actions: .github/workflows/ci.yml (Node 20, cache npm, Playwright E2E)
- CD by SemVer tags: .github/workflows/release.yml (push on vX.Y.Z)
  - Steps: lint, build, unit, E2E, artifacts (coverage + Playwright)
  - Optional: upload Sentry sourcemaps if SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT are configured
  - Optional: build & push Docker image if DOCKER_REGISTRY/DOCKER_USERNAME/DOCKER_PASSWORD/DOCKER_IMAGE are defined

### CI/CD Secrets & post-deploy checks

- Required/optional secrets (Repository Settings → Secrets and variables → Actions):
  - DATABASE_URL: used by deploy-migrate job (Prisma migrate deploy)
  - HEALTHCHECK_BASE_URL: public base (e.g., <https://app.example.com>) for post-deploy-health job
  - ADMIN_API_KEY: admin access key for smoke test /admin/state
  - (Optional) SENTRY*AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT, DOCKER*\*
- Jobs:
  - deploy-migrate: applies Prisma migrations in prod (condition: DATABASE_URL defined)
  - post-deploy-health: checks /api/healthz and /admin/state (condition: HEALTHCHECK_BASE_URL defined; ADMIN_API_KEY required for /admin/state)

## Deployment

- Docker (prod):

```bash
docker build -t journey-web:latest .
docker run --env-file .env -p 3000:3000 journey-web:latest
```

- Nginx (reverse proxy): see deploy/nginx/next.conf.sample
- systemd: see deploy/systemd/journey-web.service

### Publication (SemVer tag)

- Create a versioned tag to trigger CI/CD release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

- Optional secrets to fill in GitHub Actions (Repository Settings → Secrets and variables → Actions):
  - SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT (upload sourcemaps)
  - DOCKER_REGISTRY, DOCKER_USERNAME, DOCKER_PASSWORD, DOCKER_IMAGE (push image)

### VPS Deployment (Nginx + systemd/pm2)

VPS Prerequisites:

- Ubuntu 22.04+, Node.js 20+, npm, git, sqlite3 (if SQLite), Nginx
- DNS pointed to VPS

Steps (non-root user with sudo):

1. Retrieve code and configure environment

```bash
cd /opt
sudo mkdir -p journey-web && sudo chown "$USER":"$USER" journey-web
cd journey-web
# Clone your repository
git clone <repo_url> .
# Install dependencies
npm ci
# Environment variables
cp .env.example .env
# Open .env and fill in:
# - OPENAI_API_KEY
# - SOLANA_RPC_URL / NEXT_PUBLIC_SOLANA_RPC_URL
# - ADMIN_API_KEY
# - MINTER_SECRET_KEY (devnet) & KILL_SWITCH
```

1. Build + Prisma migrations (production)

```bash
# Build Next.js
npm run build
# Apply Prisma migrations (prod)
npx prisma migrate deploy --schema web/prisma/schema.prisma
```

1. Launch via systemd (recommended)

- Adapt service (deploy/systemd/journey-web.service) then copy it:

```bash
sudo cp deploy/systemd/journey-web.service /etc/systemd/system/journey-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now journey-web
sudo systemctl status journey-web --no-pager
```

- Example points to check in systemd unit:
  - WorkingDirectory=/opt/journey-web/web
  - EnvironmentFile=/opt/journey-web/web/.env
  - ExecStart=npm start --prefix /opt/journey-web/web

1. Nginx Reverse Proxy + TLS

```bash
# Copy template and adapt server_name / proxy_pass
sudo cp deploy/nginx/next.conf.sample /etc/nginx/sites-available/journey-web
sudo ln -s /etc/nginx/sites-available/journey-web /etc/nginx/sites-enabled/journey-web
sudo nginx -t && sudo systemctl reload nginx
# (Optional) Certbot / acme.sh for TLS
```

1. Alternative pm2 (if you prefer pm2 to systemd)

```bash
npm i -g pm2
pm2 start npm --name journey-web -- start --prefix ./web
pm2 save
pm2 startup  # generates command to execute for autostart
```

1. Post-deployment checks

- /api/healthz → { ok: true }
- /api/metrics → JSON metrics
- /admin/\* → requires x-api-key (ADMIN_API_KEY)
- Logs journalctl (systemd) or pm2 logs

Security Note:

- No cleartext key in front (NEXT*PUBLIC*\* only public)
- HTTPS mandatory in prod
- Enable KILL_SWITCH if needed to block on-chain execution

## Compliance and Quality

- ESLint + Prettier (non-blocking warnings, format script provided)
- Backend coverage >=85% (API app/api/\*\*)
- Strict CSP (hardened in production)
- Sentry initialized (DSN via .env)
- No hardcoded secrets (dotenv), HTTPS in prod

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

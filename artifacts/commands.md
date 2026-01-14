# AUDIT Commands Reference
**Generated:** 2026-01-10
**Purpose:** Comprehensive command reference for all audit phases

---

## PROFILE_A — Local Dev (Safe)

### Installation
```bash
# Root installation
npm run install:all

# Individual modules
cd mf-back && npm install
cd journey-simulator && npm install
cd web && npm install
```

### Development Servers
```bash
# Full-stack dev (all services concurrently)
npm run dev

# Individual services
cd mf-back && npm run dev          # Backend on port 3000 (proxied to 3002)
cd journey-simulator && npm run dev # Frontend on port 3003
cd web && npm run dev               # Web portal on port 3001
```

### Testing (Local)
```bash
# All tests (root)
npm run test:all

# Fast unit tests (backend only, no DB)
npm run test:fast

# Backend tests
cd mf-back && npm test              # Unit tests (SKIP_DB_CONNECTION=true)
cd mf-back && npm run test:coverage # With coverage

# Frontend tests
cd journey-simulator && npm test             # Vitest unit tests
cd journey-simulator && npm run test:e2e     # Playwright E2E full suite
cd journey-simulator && npm run test:e2e:smoke # Subset

# Web portal tests
cd web && npm run test:unit         # Jest coverage
cd web && npm run test:e2e          # Playwright
```

### Quality Checks
```bash
# Lint all modules
npm run lint:all

# Individual lint
cd mf-back && npm run lint
cd journey-simulator && npm run lint
cd web && npm run lint

# TypeScript checks
cd journey-simulator && npm run typecheck
cd web && npm run typecheck
```

### Health & Diagnostics
```bash
# System health check
npm run preflight

# Claude Code diagnostics
claude doctor

# Backend-specific
cd mf-back && curl http://localhost:3002/api/health
```

---

### Audit Runs (chronologique)
- 2026-01-10 — `SONAR_TOKEN=dummy python3 mfai_full_audit_orchestrator.py` (échec : sonarqube-server injoignable, réseau docker absent)
- 2026-01-10 — `npm run test:back` (stabilisation RAG/DAO/VSlices)
- 2026-01-10 — `npm run lint:all` (lint global ok)

## PROFILE_B — Prod-like Docker (Deploy/Hardened)

### Docker Compose Management
```bash
# Development compose (read-only enabled)
docker compose up -d --build
docker compose ps
docker compose logs -f

# Production compose (hardened, non-root)
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f mfai-api

# Deployment compose
docker compose -f docker-compose.deploy.yml up -d --build

# Stop & cleanup
docker compose down
docker compose -f docker-compose.prod.yml down
docker compose down -v  # With volumes
```

### Container Inspection (Hardening Validation)
```bash
# Inspect security settings
docker inspect mfai-api | jq '.[0].HostConfig | {ReadonlyRootfs, SecurityOpt}'
docker inspect mfai-api | jq '.[0].Config.User'

# Check restart count (stability)
docker inspect mfai-api | jq '.[0].RestartCount'

# Check filesystem write protection
docker exec mfai-api touch /usr/src/app/test.txt  # Should fail with EROFS
docker exec mfai-api touch /tmp/test.txt          # Should succeed

# Logs (sanitized)
docker logs mfai-api --tail 200 | grep -v "KEY\|SECRET\|TOKEN"
```

### E2E Tests in Docker
```bash
# Build and run E2E tests
docker compose up -d
cd journey-simulator && npm run test:e2e

# Full audit suite
cd journey-simulator && npm run test:full-audit
```

### RAG & LLM Validation
```bash
# RAG contract tests
node scripts/rag-contract-test.js

# LLM deterministic test (PROFILE_B - real call)
curl -X POST http://localhost:3002/api/agents/test-llm \
  -H "Content-Type: application/json" \
  -d '{"temperature": 0, "max_tokens": 10}'

# Verify RAG remote usage
docker logs mfai-api | grep "RAG_used_remote=true"
```

---

## PROFILE_C — Chain Mode (Devnet/Testnet)

### Environment Setup
```bash
# Enable web3 in .env
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
WEB3_ENABLED=true

# Start services with web3
docker compose -f docker-compose.prod.yml up -d
```

### Minting Worker
```bash
# Run minting worker
cd web && npm run worker:mint

# Check worker logs
docker logs mfai-web -f | grep "mint"
```

### Web3 Tests
```bash
# Web3 simulation tests
cd journey-simulator && npx playwright test tests/e2e/0X-web3-simulation-only/
```

---

## CI/CD & Release

### CI Verification (Local)
```bash
# Full CI pipeline locally
npm run ci:verify

# Individual CI steps
npm run lint:all
npm run test:all
npm run build:all
```

### Release Scripts
```bash
# Preflight checks
node scripts/release/preflight.js

# Smoke tests
node scripts/release/smoke.js
node scripts/release/smoke-e2e.js

# Go-live (production deployment)
node scripts/release/go-live.js

# Rollback
node scripts/release/rollback.js
```

### Audit Scripts
```bash
# Server audit
bash scripts/audit_server.sh

# R-series checks (blocking before TGE)
node scripts/rseries-check.js

# Orchestration diagnostics
node scripts/orchestration-diagnose.js

# Agent inventory
node scripts/generate_agent_inventory.js
```

---

## Database Operations

### MongoDB
```bash
# Access MongoDB container
docker exec -it mfai-mongo mongosh journey

# Dump sanitized data
docker exec mfai-mongo mongosh journey --eval "db.users.find().pretty()" > artifacts/db_dump_sanitized.txt

# Count documents
docker exec mfai-mongo mongosh journey --eval "db.stats()"
```

### PostgreSQL
```bash
# Access PostgreSQL container
docker exec -it mfai-postgres psql -U prisma -d prisma

# Prisma operations
cd web
npx prisma migrate dev
npx prisma studio
npx prisma generate
```

---

## Compliance & Security

### Secrets Scan
```bash
# Scan for exposed secrets (use semgrep or similar)
grep -r "sk-proj-" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "PRIVATE_KEY" . --exclude-dir=node_modules --exclude-dir=.git
```

### Compliance Check
```bash
# Root compliance
npm run compliance:check

# Backend compliance
cd mf-back && npm run compliance:check

# English compliance (linguistic integrity - R1 gate)
cd journey-simulator && npx playwright test tests/e2e/99-english-compliance/
```

---

**END OF COMMANDS REFERENCE**

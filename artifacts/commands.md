# Commandes - Money Factory AI (MFAI)
**Référence**: AUDIT.md section 17  
**Date**: 2026-01-03

---

## Commandes Repo-Driven (Vérifiées)

### Monorepo (Racine)

#### QA & Tests
```bash
# QA Runner principal
npm run qa:full                    # → scripts/qa-runner.js

# Tests RAG
npm run qa:rag                     # → scripts/rag-contract-test.js

# Integrity check
npm run qa:integrity               # → scripts/write-integrity-check.js

# Compliance
npm run compliance:check           # → scripts/compliance/check-compliance.js

# Tests tous composants
npm run test:all                   # Backend + Simulator + Web

# Tests individuels
npm run test:back                  # Backend Jest
npm run test:simulator             # Frontend Vitest
npm run test:web                   # Web unit tests
```

#### Développement
```bash
# Dev tous services (concurrently)
npm run dev                        # Preflight + back + simulator + web

# Dev individuels
npm run dev:back                   # Backend nodemon
npm run dev:simulator              # Frontend Vite
npm run dev:web                    # Web dev server
```

#### Build
```bash
npm run build:all                  # Simulator + Web
npm run build:types                # TypeScript check simulator
```

#### Lint
```bash
npm run lint:all                   # Simulator + Web
npm run lint:simulator
npm run lint:web
```

---

### Backend (mf-back/)

#### Exécution
```bash
cd mf-back

# Production
npm start                          # → node ./bin/www

# Développement
npm run dev                        # → nodemon ./bin/www
```

#### Tests
```bash
# Tests unitaires (Jest)
npm test                           # SKIP_DB_CONNECTION=true

# Coverage
npm run test:coverage
```

#### Scripts
```bash
# Upload RAG
npm run rag:upload                 # → scripts/rag_upload.js

# Compliance
npm run compliance:check
```

#### Variables d'environnement (dev local)
```bash
MONGO_URI=mongodb://127.0.0.1:27018/journey
PORT=3002
```

---

### Frontend (journey-simulator/)

#### Exécution
```bash
cd journey-simulator

# Développement
npm run dev                        # Vite dev server (port 5173)

# Preview build
npm run preview                    # Port 4173

# Build
npm run build                      # tsc && vite build
npm run build:optimized            # Production mode
```

#### Tests

**Unit (Vitest)**:
```bash
npm test                           # vitest run
npm run test:watch                 # vitest watch
npm run test:coverage
```

**E2E (Playwright)**:
```bash
# Tous tests E2E
npm run test:e2e                   # playwright test

# Par catégorie
npm run test:navigation            # 01-navigation/
npm run test:visual                # 02-visual-regression/
npm run test:agents                # 03-agent-workflows/
npm run test:data                  # 04-data-validation/

# Smoke tests
npm run test:e2e:smoke             # builder-journey + investor-demo

# Full audit
npm run test:full-audit            # Tous E2E avec reporters

# UI mode
npm run test:e2e:ui

# CI mode
npm run test:ci                    # HTML + GitHub reporters
```

#### Lint & Type
```bash
npm run lint                       # ESLint
npm run typecheck                  # tsc --noEmit
npm run check                      # lint + test
```

---

### Docker Compose

#### PROFILE_A (Dev Local)
```bash
# Non utilisé - dev direct avec npm
```

#### PROFILE_B (Prod-like / Deploy)
```bash
# Build et démarrage
docker compose -f docker-compose.deploy.yml up -d --build

# Logs
docker compose -f docker-compose.deploy.yml logs -f

# Arrêt
docker compose -f docker-compose.deploy.yml down

# Inspection hardening
docker inspect mfai-api | grep -A 10 "SecurityOpt\|ReadonlyRootfs\|User"

# Restart count
docker inspect mfai-api | grep RestartCount
```

#### PROFILE_C (Chain Mode)
```bash
# À définir - basé sur PROFILE_B + web3 enabled
```

---

### Scripts Utilitaires

#### Seed & Setup
```bash
# Seed test user
npm run seed:test-user             # → mf-back/scripts/seed-test-user.js
# Credentials: test@mfai.app / MFAITest2026!
```

#### Release
```bash
npm run release:preflight          # → scripts/release/preflight.js
npm run release:smoke              # → scripts/release/smoke.js
npm run release:smoke-e2e          # → scripts/release/smoke-e2e.js
npm run release:go-live            # → scripts/release/go-live.js
npm run release:rollback           # → scripts/release/rollback.js
```

#### Load & Chaos Testing
```bash
npm run test:load:sim              # → scripts/testing/simulate-load.js
npm run test:chaos:sim             # → scripts/testing/simulate-chaos.js
```

---

### Commandes de Diagnostic

#### Ports
```bash
# Vérifier ports utilisés
lsof -i :3002                      # Backend
lsof -i :4173                      # Frontend preview
lsof -i :27018                     # MongoDB local

# Docker
docker ps                          # Conteneurs actifs
docker compose -f docker-compose.deploy.yml ps
```

#### Logs
```bash
# Backend (si running)
tail -f backend.log

# Docker
docker compose -f docker-compose.deploy.yml logs -f mfai-api
docker compose -f docker-compose.deploy.yml logs -f mfai-mongo
```

#### Health Checks
```bash
# Backend
curl http://localhost:3002/healthz
curl http://localhost:3002/readyz

# MongoDB
mongosh --port 27018 --eval "db.adminCommand('ping')"
```

---

### Variables d'Environnement Critiques

#### Backend (.env / .deploy.env)
```bash
NODE_ENV=production
PORT=3002
MONGO_URI=mongodb://***
ADMIN_API_KEY=***                  # Pour RAG upload
RAG_SEARCH_URL=***
RAG_API_KEY=***
OPENAI_API_KEY=***                 # LLM
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3002
VITE_RESOURCE_LIBRARY_BASE_URL=/documents
```

---

## Commandes Phase 0 (Discovery)

```bash
# Inventaire structure
ls -la
tree -L 2 -I 'node_modules'

# Agents count
ls -1 mf-back/agents/*.js | wc -l

# Docker version
docker compose version

# Node version
node --version

# Tests E2E structure
ls -R journey-simulator/tests/e2e/
```

---

## Commandes QA Re-proof (AUDIT.md Phase 1.1)

### Backend Jest (Bloquant #1 - Résolu)
```bash
# Re-proof complet (357 tests)
cd mf-back && npm test

# Expected output:
# Test Suites: 55 passed, 55 total
# Tests:       357 passed, 357 total
# Time:        ~47s
```

### E2E Partial (Bloquant #2)
```bash
# Partial suite (3 catégories)
cd journey-simulator
npx playwright test tests/e2e/01-navigation tests/e2e/02-agent-core tests/e2e/03-agent-workflows --project=chromium

# With forensics
npx playwright test <test-file> --trace=on --video=on --screenshot=on --reporter=line

# View trace
npx playwright show-trace test-results/<test-dir>/trace.zip
```

---

## Commandes Phase 1.4 — Data Validation & RAG Upload

```bash
cd journey-simulator
npx playwright test tests/e2e/04-data-validation --workers=1
```

---

## Commandes Phase 1.4 — Tranche E (Dashboard Intel)

```bash
cd journey-simulator && npx playwright test tests/e2e/04-dashboard-intel/resource-rendering.spec.ts --project=chromium --workers=1 --trace on
cd journey-simulator && npx playwright test tests/e2e/04-dashboard-intel/resource-rendering.spec.ts --project=firefox --workers=1 --trace on
cd journey-simulator && npx playwright test tests/e2e/04-dashboard-intel/resource-rendering.spec.ts --project=mobile-chrome --workers=1 --trace on
```

---

## Commandes Phase 1.4 — Orchestration (Diagnostic Réel)

```bash
# Reproduction AbortError en mode réel + capture logs
MFAI_ORCHESTRATION_INPUT="Build a DAO voting plan with quorum, power levels, and AEPO/AECO tracking." node scripts/repro_orchestration_real.js
```

---

## Commandes — Vitest (ZynoConsole)

```bash
cd journey-simulator && npx vitest run src/components/Zyno/__tests__/ZynoConsole.test.tsx
```

---

## Commandes Phase 1.4 — Cache Fix (Timestamp: 2026-01-03T22:45:00+01:00)

### Tests Automatisés
```bash
# Cache key unit tests
cd mf-back && npm test -- cache-key.test.js --verbose
```

### Orchestration Repro (3-Run Matrix)
```bash
# Run 1 — MISS (unique prompt)
MFAI_SPAWN_BACKEND=false MFAI_ORCHESTRATION_TIMEOUT=200000 \
node scripts/repro_orchestration_real.js --prompt "PROMPT_A_UNIQUE_CACHE_MISS_TEST"

# Run 2 — HIT (same prompt)
MFAI_SPAWN_BACKEND=false MFAI_ORCHESTRATION_TIMEOUT=200000 \
node scripts/repro_orchestration_real.js --prompt "PROMPT_A_UNIQUE_CACHE_MISS_TEST"

# Run 3 — MISS (different prompt)
MFAI_SPAWN_BACKEND=false MFAI_ORCHESTRATION_TIMEOUT=200000 \
node scripts/repro_orchestration_real.js --prompt "Explain the complete roadmap for launching a DAO with governance tokens"
```

### Backend Telemetry Capture
```bash
# Capture backend logs
tail -f /tmp/backend.log >> /tmp/backend_capture.log &

# Extract NDJSON
grep -E '^\{"type":"orchestration_' /tmp/backend_capture.log > artifacts/orchestration-telemetry.ndjson
```

---

## Commandes Phase 1.4 — Timeout UI + Playwright (Timestamp: 2026-01-04T00:02:00+01:00)

### Preflight
```bash
# Health check
curl -s -o /tmp/health.txt -w "%{http_code}\n" http://127.0.0.1:3002/health

# Auth state exists
ls -l journey-simulator/test-results/.auth/user.json

# No skip/fixme
git grep -n -e 'fixme(' -e 'test.skip' -e 'describe.skip' -e 'test.fixme' journey-simulator/tests/e2e
```

### Vitest (ZynoConsole)
```bash
cd journey-simulator && NO_COLOR=1 npx vitest run src/components/Zyno/__tests__/ZynoConsole.test.tsx
```

### Playwright Tri-Project (zyno-persistence)
```bash
# Chromium
cd journey-simulator && npx playwright test tests/e2e/04-agents/zyno-persistence.spec.ts --project=chromium --workers=1

# Firefox
cd journey-simulator && npx playwright test tests/e2e/04-agents/zyno-persistence.spec.ts --project=firefox --workers=1

# Mobile Chrome
cd journey-simulator && npx playwright test tests/e2e/04-agents/zyno-persistence.spec.ts --project=mobile-chrome --workers=1
```

---

**Dernière mise à jour**: 2026-01-04T00:02:00+01:00

## Phase 1.4 - Zyno Persistence Tri-Projects (2026-01-04T09:46:00+01:00)

```bash
# Chromium
cd journey-simulator && npx playwright test tests/e2e/04-agents/zyno-persistence.spec.ts --project=chromium --workers=1 --trace on

# Firefox
cd journey-simulator && npx playwright test tests/e2e/04-agents/zyno-persistence.spec.ts --project=firefox --workers=1 --trace on

# Mobile Chrome
cd journey-simulator && npx playwright test tests/e2e/04-agents/zyno-persistence.spec.ts --project=mobile-chrome --workers=1 --trace on
```

**Result**: 3/3 PASS (chromium 4.7s, firefox 36.5s, mobile-chrome 40.8s)

## NFT Minting Remediation (2026-01-04T12:21:00+01:00)

```bash
# Tri-projects validation after contract fix
cd journey-simulator && npx playwright test tests/e2e/03-web3-simulation/nft-minting.spec.ts --workers=1 --trace on
```

**Result**: 3/3 PASS (chromium 2.3s, firefox 3.4s, mobile-chrome 2.2s)

**Fix**: Contract invariants (request/response proof) + strict-mode `.first()` + timeout 240s

## Phase 1.4 Full Run Tri-Projects - Final Validation (2026-01-04T12:33:00+01:00)

```bash
# Preflight
curl -s -o /tmp/health.txt -w "%{http_code}\n" http://127.0.0.1:3002/health
ls -l journey-simulator/test-results/.auth/user.json
git grep -n -e 'fixme(' -e 'test.skip' -e 'describe.skip' -e 'test.fixme' journey-simulator/tests/e2e

# Full run
cd journey-simulator && npx playwright test --workers=1 --trace on 2>&1 | tee /tmp/e2e-full-triprojects-v2.log
```

**Result**: 90/90 PASS (6.5m) - 0 failed, 0 flaky, 0 skipped, 0 unexpected

**Verdict**: ✅ PASS_STRICT

## Security Remediation Validation (2026-01-04T12:42:00+01:00)

```bash
# Validation after sanitizeHeaders helper implementation
cd journey-simulator && npx playwright test tests/e2e/04-data-validation/rag-upload.spec.ts --project=chromium --workers=1
```

**Result**: 1/1 PASS (3.1s) - Authorization and x-api-key headers redacted in logs

**Helper**: `tests/e2e/helpers/sanitizeHeaders.ts` - Centralized sanitization for all sensitive headers

---

<!-- BEGIN_RELEASE_GATES -->

## Security Gate — Checklist d'audit récurrent (Release/Tag)

> **CRITICAL**: `--trace off` is MANDATORY for all release/tag gates. Playwright traces contain Authorization headers by design and are incompatible with "zero secrets in artifacts" policy.

### ✅ Commande 1 — Unit Gate (sanitizeHeaders)

```bash
cd journey-simulator && npx playwright test tests/e2e/helpers/sanitizeHeaders.unit.spec.ts --workers=1
```

**Attendu**: `36/36 PASSED` (tri-projects).

### ✅ Commande 2 — E2E In-Situ Gate (rag-upload) **SANS TRACE**

```bash
cd journey-simulator && npx playwright test tests/e2e/04-data-validation/rag-upload.spec.ts --workers=1 --trace off
```

**Attendu**: `3/3 PASSED` + logs montrant `authorization`/`x-api-key` en `"[REDACTED]"`.

### ✅ Commande 3 — Full Suite Gate (Release/Tag) **SANS TRACE**

```bash
cd journey-simulator && npx playwright test --workers=1 --trace off
```

**Attendu**: 0 failed, 0 flaky, 0 skipped, 0 unexpected.

### ✅ Commande 4 — Phase 2 UX/UI Desktop Gate **SANS TRACE**

```bash
cd journey-simulator && npx playwright test \
  tests/e2e/02-visual-regression \
  tests/e2e/04-dashboard-intel \
  --workers=1 --trace off
```

**Attendu**: All layout assertions pass, 0 console errors, screenshots captured (no secrets in UI)

### ✅ Commande 5 — Phase 3 User Workflows & Personas Gate **SANS TRACE**

```bash
cd journey-simulator && npx playwright test tests/e2e/03-user-workflows --workers=1 --trace off
```

**Attendu**: All workflow tests pass (onboarding, progression, unlock, completion, RBAC), sanitized progression exports generated, English-only interactions

### ✅ Commande 6 — Phase 4 Agents & Orchestration Gate **SANS TRACE**

```bash
cd journey-simulator && npx playwright test tests/e2e/05-agents-orchestration --workers=1 --trace off
```

**Attendu**: All orchestration tests pass (intent-routing, agent-contracts, resilience, multi-user-isolation), timeline evidence generated (sanitized), English-only interactions

---

## Greps (STRICT) — doivent retourner ZÉRO ligne

### 🔍 GREP #1 — Zéro JWT/Bearer dans les artefacts (post-run)

```bash
rg -n --hidden --no-ignore -S \
  "(authorization\"?\s*:\s*\"Bearer\s+|Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+|eyJ[A-Za-z0-9\-_]{10,}\.)" \
  artifacts journey-simulator/test-results /tmp \
  --glob '!**/qa-report.md' --glob '!**/test-cache/**' --glob '!journey-simulator/test-results/.auth/**' \
  && { echo "❌ BLOCK: TOKEN LEAK DETECTED"; exit 1; } || echo "✅ OK: 0 token leaks"
```

**Attendu**: 0 hit.  
**Si hit**: `BLOCK release/tag` (non-conformité "zéro secrets").

### 🔍 GREP #2 — Aucune production de traces réseau en mode Release/Tag

> Bloque **l'existence** des artefacts traces (`.network`, `trace.zip`), car ils peuvent contenir des secrets par design.

```bash
find journey-simulator/test-results -type f \( -name "trace.zip" -o -name "*.network" \) 2>/dev/null | head -50 \
  | sed 's/^/❌ TRACE ARTIFACT: /' && { echo "❌ BLOCK: trace artifacts present"; exit 1; } || echo "✅ OK: 0 trace artifacts"
```

**Attendu**: 0 fichiers trace.  
**Si présent**: `BLOCK release/tag` (traces contiennent Authorization headers).

<!-- END_RELEASE_GATES -->

---

## Lockdown Pré-Scan (Purge des artefacts "à risque")

> Objectif: respecter "**aucun secret dans logs/rapports/traces/screenshots/commits**".

```bash
rm -f /tmp/test_output.log /tmp/test_debug_loop.log /tmp/e2e-*.log /tmp/e2e-*.txt 2>/dev/null || true
rm -rf journey-simulator/test-results/artifacts/.playwright-artifacts-* 2>/dev/null || true
```

**Attendu**: suppression des sources typiques de fuites (logs /tmp + traces Playwright).

---

## Debug Local (Hors Release/Tag)

Pour debug local uniquement (jamais archivé/committé):

```bash
cd journey-simulator && npx playwright test <spec> --workers=1 --trace on
# Purge immédiate après debug
rm -rf journey-simulator/test-results/artifacts/.playwright-artifacts-* 2>/dev/null || true
```

---

**Note**: These checks form the **security gate** for release/tag validation. Any failure is a BLOCK.


---

## 🔒 Anti-Régression Guards (Policy Enforcement)

### Guard A — Interdire --trace on DANS LES RELEASE GATES UNIQUEMENT

```bash
sed -n '/<!-- BEGIN_RELEASE_GATES -->/,/<!-- END_RELEASE_GATES -->/p' artifacts/commands.md \
  | rg -n -S "(--trace\s+on|trace:\s*'on')" \
  && { echo "❌ BLOCK: trace ON found inside RELEASE GATES"; exit 1; } \
  || echo "✅ Guard A: PASS (trace off enforced for release gates)"
```

**Attendu**: 0 hit (toutes les commandes gate doivent utiliser `--trace off` ou omettre le flag)

### Guard B — Interdire le LOGGING de tokens côté UI (console.* uniquement)

```bash
rg -n --type ts --type tsx -S \
  "console\.(log|warn|error|debug)\([^)]*(accessToken|refreshToken|Authorization|Bearer|eyJ[A-Za-z0-9\-_]{10,}\.)" \
  journey-simulator/src \
  && { echo "❌ BLOCK: token-like value logged in UI source"; exit 1; } \
  || echo "✅ Guard B: PASS (no token logging in UI)"
```

**Attendu**: 0 hit (seul `hasAccessToken` booléen autorisé, pas de valeurs token dans console.log)

### Guard C — Interdire tout artefact Playwright de trace réseau (release/tag)

```bash
find journey-simulator/test-results -type f \( -name "trace.zip" -o -name "*.network" \) -print \
  | head -1 \
  | rg -n "." \
  && { echo "❌ BLOCK: trace/network artifacts found in test-results"; exit 1; } \
  || echo "✅ Guard C: PASS (0 trace/network artifacts)"
```

**Attendu**: 0 fichiers

### Guard D — Interdire l'inclusion git des storageStates / outputs sensibles

```bash
git ls-files | rg -n "(test-results/\.auth/|/tmp/test_.*\.log|test-results/.*\.network|test-results/.*trace\.zip)" \
  && { echo "❌ BLOCK: sensitive runtime artifacts are tracked by git"; exit 1; } \
  || echo "✅ Guard D: PASS (no sensitive artifacts tracked)"
```

**Attendu**: 0 fichiers suivis par git

---

**Note**: Ces guards détectent les régressions courantes (réactivation de trace, réintroduction de logs secrets).

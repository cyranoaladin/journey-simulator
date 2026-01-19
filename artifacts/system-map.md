# System Map - Money Factory AI (MFAI)
**Référence**: AUDIT.md Phase 0  
**Date**: 2026-01-03T13:42:25+01:00

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    MFAI Platform Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Frontend   │      │   Backend    │      │  Database │ │
│  │  (React/Vite)│◄────►│  (Express)   │◄────►│  (MongoDB)│ │
│  │  Port: 4173  │      │  Port: 3002  │      │Port: 27018│ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                             │
│         │                      │                             │
│         ▼                      ▼                             │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  UI Blocks   │      │   Agents     │                    │
│  │  Renderer    │      │  (54 agents) │                    │
│  └──────────────┘      └──────────────┘                    │
│                               │                              │
│                               ▼                              │
│                        ┌──────────────┐                     │
│                        │  RAG + LLM   │                     │
│                        │   (OpenAI)   │                     │
│                        └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Composants Détaillés

### 1. Frontend (journey-simulator/)

**Framework**: React 19 + Vite 4.5  
**Language**: TypeScript  
**Port Dev**: 5173  
**Port Preview**: 4173  
**Port Prod**: 80 (nginx dans container)

**Dépendances Clés**:
- React 19.0.0
- Vite 4.5.14
- @solana/web3.js 1.98.2
- @solana/wallet-adapter-* (Phantom, Solflare, Torus)
- Playwright 1.57.0 (E2E)
- Vitest 4.0.9 (Unit)

**Routes Principales**:
- `/` - HomePage
- `/journey` - Journey Workspace
- `/zyno` - Zyno Console (Agent interaction)
- `/dashboard` - User Dashboard
- `/nft` - NFT Management
- `/dao` - DAO Governance

**Tests**:
- Unit: Vitest (`npm test`)
- E2E: Playwright (`npm run test:e2e`)
  - 01-navigation/ (4 tests)
  - 02-agent-core/ (3 tests)
  - 03-web3-simulation/ (2 tests)
  - 04-data-validation/ (1 test - RAG upload)
  - Autres catégories

---

### 2. Backend (mf-back/)

**Framework**: Express 4.21  
**Language**: JavaScript (Node.js 18+)  
**Port**: 3002  
**Entry Point**: `bin/www`

**Dépendances Clés**:
- Express 4.21.2
- Mongoose 8.10.0 (MongoDB ODM)
- OpenAI 6.9.1 (LLM)
- @solana/web3.js 1.98.4
- Axios 1.7.7
- JWT, bcrypt, helmet, cors

**Routes API** (découvertes):
- `/healthz` - Health check ✅
- `/readyz` - Readiness check ✅
- `/auth/*` - Authentication
- `/user/*` - User management
- `/journey/*` - Journey progression
- `/orchestration` - Agent orchestration
- `/admin/rag/*` - RAG management (requires x-api-key)
- `/api/feedback` - Agent feedback
- `/dao/*` - DAO operations
- `/resources/rag` - RAG document listing

**Agents** (54 fichiers):
- **Orchestrateur**: ZynoAgent.js (25KB)
- **Base**: BaseAgent.js (15KB)
- **Business**: Builder, Investor, Coach, Education, Growth
- **Technical**: Dev, DevOps, Security, Compliance, Audit
- **Web3**: NFT, Minting, DAO, Governance, Tokenomics, Solana
- **Specialized**: RAGOps, Analytics, Performance, Reflection

**Tests**:
- Jest (`npm test`)
- Coverage disponible
- `SKIP_DB_CONNECTION=true` pour unit tests

---

### 3. Database

**MongoDB**:
- Version: 6
- Port Local: 27018
- Port Container: 27017
- Container: `mfai-mongo`
- Status: ✅ Healthy (Up 12 hours)
- Volume: `mfai-mongo-data`
- Database: `journey`

**PostgreSQL** (découvert):
- Version: 15-alpine
- Port Local: 5433
- Container: `mfai-postgres`
- Status: ✅ Healthy (Up 39 hours)
- Database: `prisma`
- Usage: À déterminer (possiblement pour web portal)

**Redis** (découvert):
- Version: 7-alpine
- Port Local: 6380
- Container: `mfai-redis`
- Status: ✅ Up 39 hours
- Usage: Cache/Queue (à confirmer)

---

### 4. Services Externes

**RAG Service**:
- URL: `https://rag-api.nexusreussite.academy/search`
- Auth: `RAG_API_KEY` (env)
- Fallback: Local RAG (si remote fail)

**LLM Service**:
- Provider: OpenAI
- API Key: `OPENAI_API_KEY` (env)
- Models: À déterminer (probablement gpt-4 ou gpt-3.5-turbo)

**Blockchain**:
- Network: Solana
- RPC: À déterminer (devnet/testnet/mainnet)
- Wallets: Phantom, Solflare, Torus

---

## Profiles d'Exécution (AUDIT.md Section 2)

### PROFILE_A — Local Dev (Safe)

**Objectif**: Développement rapide, itérations courtes

**Configuration**:
```bash
# Backend
cd mf-back
MONGO_URI=mongodb://127.0.0.1:27018/journey PORT=3002 npm run dev

# Frontend
cd journey-simulator
npm run dev  # Port 5173
```

**Caractéristiques**:
- ✅ DB locale (MongoDB port 27018)
- ✅ Mocks contrôlés possibles
- ✅ RAG remote (staging) ou local fallback
- ⚠️ LLM: À prouver (réel ou stub)
- ✅ Hot reload (nodemon + Vite HMR)

**Tests**:
- Unit tests (Jest + Vitest)
- Integration tests
- Diagnostics rapides

**Sorties attendues**:
- Tests unit/integration OK
- Pas de hardening requis

---

### PROFILE_B — Prod-like Docker (Deploy/Hardened)

**Objectif**: Simulation production, hardening, E2E

**Configuration**:
```bash
docker compose -f docker-compose.deploy.yml up -d --build
```

**Services**:
- `mfai-api` (Backend)
- `mfai-mongo` (MongoDB)
- `mfai-postgres` (PostgreSQL)
- `mfai-web` (Frontend nginx)

**Hardening Actif** (docker-compose.deploy.yml):
- ✅ `read_only: true` (rootfs)
- ✅ `no-new-privileges:true`
- ✅ `tmpfs: /tmp`
- ✅ `SKIP_NPM_INSTALL: "true"`
- ⚠️ **User non-root**: NON SPÉCIFIÉ dans compose (à vérifier dans Dockerfile)
- ✅ Healthchecks (MongoDB, PostgreSQL)
- ✅ `restart: always`

**Caractéristiques**:
- ✅ RAG remote (prod endpoint)
- ⚠️ LLM réel (à prouver déterministe)
- ✅ Isolation conteneurs
- ✅ Volumes persistants

**Tests**:
- E2E UI (Playwright)
- Stabilité conteneur
- Preuves RAG/LLM "in-container"
- Write tests (read-only verification)

**Sorties attendues**:
- Stabilité conteneur (RestartCount=0)
- Preuves RAG/LLM remote
- E2E UI PASS
- Logs sans EROFS/EACCES

---

### PROFILE_C — Chain Mode (Devnet/Testnet)

**Objectif**: Tests Web3 on-chain

**Configuration**:
```bash
# Basé sur PROFILE_B + web3 enabled
docker compose -f docker-compose.deploy.yml up -d --build
# + Configuration Solana RPC
```

**Caractéristiques**:
- ✅ Même base que PROFILE_B
- ✅ Web3 enabled (Solana)
- ✅ Idempotence (replay safe)
- ✅ Gestion rate-limit RPC
- ✅ Logs tx hash OK (pas de secrets)

**Tests**:
- Mint NFT
- Staking
- DAO Vote
- Wallet connection

**Sorties attendues**:
- Tx hashes (si réel)
- Idempotence prouvée
- Rate-limit handling
- Cohérence on-chain/off-chain

---

## Ports & Endpoints (Vérifiés)

### Local Dev (PROFILE_A)

| Service | Port | Status | Endpoint |
|---------|------|--------|----------|
| Backend | 3002 | ✅ UP | http://localhost:3002 |
| Frontend Dev | 5173 | - | http://localhost:5173 |
| Frontend Preview | 4173 | - | http://localhost:4173 |
| MongoDB | 27018 | ✅ UP | mongodb://localhost:27018 |
| PostgreSQL | 5433 | ✅ UP | postgresql://localhost:5433 |
| Redis | 6380 | ✅ UP | redis://localhost:6380 |

**Health Checks**:
- ✅ `/healthz` → `{"ok":true}`
- ✅ `/readyz` → `{"ok":true}`

### Docker (PROFILE_B)

| Service | Container Port | Host Port | Status |
|---------|---------------|-----------|--------|
| mfai-api | 3002 | 3002 | - |
| mfai-web | 80 | 3003 | - |
| mfai-mongo | 27017 | 27018 | ✅ Healthy |
| mfai-postgres | 5432 | 5435 | - |

---

## Gates Définitifs (AUDIT.md Section 3)

### Gates Globaux

1. **Tests**: 100% PASS sur suites activées
   - Backend Jest: ✅ Configuré
   - Frontend Vitest: ✅ Configuré
   - E2E Playwright: ✅ Configuré

2. **Lint/Typecheck**: 100% PASS
   - Backend: ⚠️ Pas de lint configuré (à vérifier)
   - Frontend: ✅ ESLint + TypeScript

3. **RAG**: En PROFILE_B, `RAG_used_remote=true`
   - ⏳ À prouver

4. **LLM**: Appel réel déterministe (temp=0)
   - ⏳ À prouver

5. **Stabilité**: Crash-loop interdit
   - ⏳ À vérifier (RestartCount)

6. **UX**: Pas de régression majeure
   - ⏳ Screenshots diff

7. **Data**: Progression + mémoire restaurées
   - ⏳ Tests multi-user

8. **On-chain**: Mint/stake/vote validés
   - ⏳ PROFILE_C

### Gates Trinity Layout (si applicable)

- Navigator: 80px
- Zyno Pulse: 320px
- Central Stage: sans overlap
- Tokens: `#050510`, `#9945FF`, `#14F195`
- Police: Space Grotesk
- UIBlocksRenderer: tous types existants

⏳ À vérifier dans le code

---

## Prochaines Actions (Phase 0)

1. ✅ Inventaire repo
2. ✅ System Map
3. ✅ PROFILE_A/B/C définis
4. ✅ Gates établis
5. ⏳ Vérifier user non-root dans Dockerfile
6. ⏳ Lister tous endpoints API
7. ⏳ Compléter test-results.json
8. ⏳ Générer logs-sanitized.txt

---

**Dernière mise à jour**: 2026-01-03T13:42:25+01:00  
**Statut Phase 0**: 🔄 80% COMPLÉTÉ

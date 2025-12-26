# Money Factory AI — Journey Monorepo

Monorepo “journey.mfai.app” : backend API (`mf-back`), UI React/Vite (`journey-simulator`), et portail Next.js (`web`).

## 🧭 Produit (source de vérité)

- **6 personas**: `cognitive-activation-hub`, `capital-foundry`, `system-architect`, `experience-studio`, `impact-engine`, `resilience-master`
- **6 phases (Launch last)**: Learn → Build → Prove → Activate → Scale → **Launch (Collaterize simulation)**
- **MVP**: testnet/devnet, “building in public”

La source de vérité des personas/phases côté UI est `journey-simulator/src/data/personas.ts`.

### Architecture Monorepo

Le monorepo est structuré en trois composants principaux qui interagissent pour former la plateforme complète :

#### A. Front-end (`journey-simulator/`)

**Stack** : React + Vite + TypeScript, React Router, Framer Motion, Zustand, Lucide Icons, Solana Wallet Adapter

**Structure UI - Trinity Layout** :

- **Navigator (Left)** : Sidebar fine avec progression de phase, accès rapide aux parcours, états verrouillés/débloqués
- **The Stage (Center)** : Surface dynamique pour artefacts, simulations, quiz, ressources ; héberge `JourneyWorkspace`, `UIBlocksRenderer`
- **Zyno Pulse (Right)** : Console agentique persistante (logs des agents, actions suggérées, suivi AEPO/AECO)

**State Management** :

- `journeyStore` (Zustand) : progression, engine S2.5 start/submit/refresh, demo mode
- `themeStore` : dark/light mode
- `auth` : token, demo token

**Design System** :

- **Couleurs** : Deep Space `#050510`, Solana Purple `#9945FF`, Solana Green `#14F195`, Electric Cyan `#00E5FF`
- **Typo** : Space Grotesk (titres), Inter (corps)
- **Motifs visuels** : glassmorphism (flou + opacité), bordures néon 1px, glow sur états actifs
- **Icônes** : Lucide React (23 agents mappés avec accents visuels)

**Modes** :

- **Demo** : chemins `/journeys/demo` sans auth forte
- **Real** : `/journeys` protégé + wallet Solana (Layout `enableWallet=true`)

#### B. Back-end Orchestration (`mf-back/`)

**Stack** : Express + MongoDB, Zod validation, Pino logging

**Orchestration Agentique (R2.x)** :

- **Intent Router** : sélection déterministe des agents (sécurité + produit), scoring pondéré par `confidenceWeight` + `learningScore`
- **23 Agents Zyno** : Guide, Coach, Pitch, Web3Legal, NFT, Token, Tokenomics, Launchpad, Builder, DAO, Audit, Product, Dev, Investor, Onboarding, Growth, Community, Reflection, Education, Design, Governance, Protocol, Security
- **Arbitrage Zyno** : détection de contradictions, décision structurée (`overallStatus`, `topFindings`, `recommendedActions`, `actionPlan` dédupliqué)
- **Mémoire & apprentissage** : mémoire TTL/FIFO (in-memory), ajustement de confiance par historique (OK/FAIL/TIMEOUT/contradictions)
- **Tooling & executionPlan** : mapping déclaratif des actions → tools (`enable_checklist` autorisé en exécution réelle, autres en dry-run/skipped)
- **Execution Gate (HITL)** : `executionGate` requis pour toute exécution réelle (PENDING/APPROVED/REJECTED/EXPIRED)
- **Execution Engine** :
  - Mode par défaut : `DRY_RUN` (SIMULATED), aucun side-effect
  - Mode réel (opt-in) : uniquement si `EXECUTION_ENABLED=true` **et** gate `APPROVED`, un seul tool réellement exécuté, autres `SKIPPED_REAL_EXECUTION`. Fallback automatique en dry-run
- **Traçabilité** : logs structurés avec `traceId`, statut des steps (SIMULATED/EXECUTED/SKIPPED), réponse toujours structurée (pas de throw)

**RAG & Mémoire** :

- Gestion mémoire TTL/FIFO (in-memory)
- Ingestion documentaire (RAG local fallback si remote indisponible)
- Citations filtrées par `ragPolicy`, domain-aware queries

**Endpoints clés** :

- `/orchestration/vslice` : orchestration verticale (agents, RAG, LLM, execution)
- `/journey/*` : progression, missions, artifacts
- `/user/*` : auth + profile + refresh + wallet
- `/dao/*` : governance

#### C. Services Web3 (`web/`)

**Stack** : Next.js + Prisma + PostgreSQL + Redis, BullMQ, UMI/Metaplex

**Auth SIWS (Sign-In With Solana)** :

- `POST /api/auth/siws/challenge` : génère un challenge/nonce, stocké dans Redis avec TTL
- `POST /api/auth/siws/verify` : vérifie signature Ed25519, émet JWT/session
- Challenges stockés dans Redis (`siws:${id}`) avec expiration

**Pipeline de Minting Asynchrone** :

- `POST /api/mint/simulate` : simulation transaction mint (frais, risque)
- `POST /api/mint/execute` : création `MintJob` dans Postgres, push dans Redis queue `minting` (BullMQ)
- **Worker** (`mintWorker.ts`) : consomme queue Redis, exécute mint via UMI/Metaplex, met à jour `MintLog` (txSig, mintAddress)
- Retry automatique (3 tentatives, backoff exponentiel)

**Metadata Dynamique** :

- `GET /api/metadata/pass/:mint` : JSON conforme Metaplex
- `GET /api/metadata/proof-of-skill/:mint` : metadata Proof-of-Skill NFT

**Intégrations** :

- `POST /api/integrations/collaterize/simulate` : simulation Launch Collaterize (eligibility score, tier CORE/EXPERIMENTAL/REJECTED)

**Note importante** : Le projet **ne contient pas de smart contracts**. La stack Solana est utilisée uniquement pour :

- Auth SIWS (challenge/signature)
- Minting de NFTs (Metaplex/UMI) via pipeline asynchrone

## ✅ Prérequis

- Node.js **>= 18**
- Docker + Docker Compose (recommandé pour un run complet)

## 🚀 Démarrage rapide (Docker, recommandé)

```bash
# depuis la racine
./start_dev.sh
```

Services (dev) :

- **API (mf-back)**: `http://localhost:3002`
- **UI (journey-simulator)**: `http://localhost:3003`

## 🧪 Tests / Lint

```bash
npm run install:all
npm run lint:all
npm run test:all
npm run build:all
```

## 🔐 Variables d'environnement

- Dev backend: `mf-back/env.development.example`
- Prod backend: `mf-back/env.production.example`
- Déploiement: `.deploy.env` / `.deploy.env.example`
- Orchestration Zyno (exécution réelle opt-in) :
  - `EXECUTION_ENABLED`: `true` pour autoriser l’exécution réelle des tools (par défaut dry-run). Ne l’activez qu’avec un `executionGate` **APPROVED**.
  - Les autres variables restent inchangées (LLM mock/RAG local si non fournis).

## 📚 Docs clés

- **Architecture & Design** :
  - Design System & IA : `PROJECT_KNOWLEDGE_BASE.md` (manuel de référence)
  - Diagrammes architecture : `docs/ARCHITECTURE_DIAGRAMS.md` (Mermaid)
  - Workflows & Routes : `WORKFLOW_MATRIX.md` (cartographie routes/endpoints)
- **Produit** :
  - Deep dive: `docs/PLATFORM_DEEP_DIVE_FR.md`
  - Test plan: `TEST_PLAN.md`
- **Déploiement** :
  - `DEPLOY.md`, `DEPLOY_SERVER.md`, `docker-compose.prod.yml`

## 🧠 Orchestration agentique (R2.x)

- **Intent router + registry enrichi** : sélection déterministe des agents (sécurité + produit), scoring pondéré par `confidenceWeight` + `learningScore`.
- **Arbitrage Zyno** : détection de contradictions, décision structurée (`overallStatus`, `topFindings`, `recommendedActions`, `actionPlan` dédupliqué).
- **Mémoire & apprentissage** : mémoire TTL/FIFO (in-memory), ajustement de confiance par historique (OK/FAIL/TIMEOUT/contradictions).
- **Tooling & executionPlan** : mapping déclaratif des actions → tools (`enable_checklist` autorisé en exécution réelle, autres en dry-run/skipped).
- **Execution Gate (HITL)** : `executionGate` requis pour toute exécution réelle (PENDING/APPROVED/REJECTED/EXPIRED).
- **Execution Engine** :
  - Mode par défaut : `DRY_RUN` (SIMULATED), aucun side-effect.
  - Mode réel (opt-in) : uniquement si `EXECUTION_ENABLED=true` **et** gate `APPROVED`, un seul tool réellement exécuté, autres `SKIPPED_REAL_EXECUTION`. Fallback automatique en dry-run.
- **Traçabilité** : logs structurés avec `traceId`, statut des steps (SIMULATED/EXECUTED/SKIPPED), réponse toujours structurée (pas de throw).

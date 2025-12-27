# Money Factory AI — Journey Monorepo

Monorepo "journey.mfai.app" : backend API (`mf-back`), UI React/Vite (`journey-simulator`), et portail Next.js (`web`).

**Version actuelle** : 0.0.1
**Dernière mise à jour** : Décembre 2025
**État** : Production-ready, 0 Bugs, Dette technique : 59.8h

## 🧭 Produit (source de vérité)

- **6 personas** : `cognitive-activation-hub`, `capital-foundry`, `system-architect`, `experience-studio`, `impact-engine`, `resilience-master`
- **6 phases (Launch last)** : Learn → Build → Prove → Activate → Scale → **Launch (Collaterize simulation)**
- **MVP** : testnet/devnet, "building in public"

La source de vérité des personas/phases côté UI est `journey-simulator/src/data/personas.ts`.

### Architecture Monorepo

Le monorepo est structuré en trois composants principaux qui interagissent pour former la plateforme complète :

#### A. Front-end (`journey-simulator/`)

**Stack** : React 19 + Vite 4.5 + TypeScript 5.3, React Router 7, Framer Motion 12, Zustand 4, Lucide Icons 0.556, Solana Wallet Adapter

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

**Stack** : Express 4.21 + MongoDB (Mongoose 8.10), Zod 3.25 validation, Pino 10 logging, OpenAI 6.9

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

**Stack** : Next.js 14.2 + Prisma 5.22 + PostgreSQL + Redis 5.10, BullMQ 5.65, UMI/Metaplex 3.4

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

- Node.js **>= 18.0.0** (recommandé : 18.17.0+)
- Docker + Docker Compose (recommandé pour un run complet)
- MongoDB (local ou distant)
- PostgreSQL (pour `web/`)
- Redis (pour `web/` - queues et SIWS)

## 🚀 Démarrage rapide (Docker, recommandé)

```bash
# depuis la racine
./start_dev.sh
```

Services (dev) :

- **API (mf-back)**: `http://localhost:3002`
- **UI (journey-simulator)**: `http://localhost:3003`
- **Web Portal (web)**: `http://localhost:3001`

## 🧪 Tests / Lint

```bash
npm run install:all
npm run lint:all
npm run test:all
npm run build:all
```

### Scripts disponibles

- `npm run dev:back` : Démarrer le backend uniquement
- `npm run dev:simulator` : Démarrer le frontend uniquement
- `npm run dev:web` : Démarrer le portail web uniquement
- `npm run lint:all` : Linter tous les projets
- `npm run test:all` : Exécuter tous les tests
- `npm run build:all` : Builder tous les projets
- `npm run release:preflight` : Vérifications pré-release
- `npm run release:smoke` : Tests de smoke post-release
- `npm run compliance:check` : Vérification de conformité

## 🔐 Variables d'environnement

- Dev backend: `mf-back/env.development.example`
- Prod backend: `mf-back/env.production.example`
- Déploiement: `.deploy.env` / `.deploy.env.example`
- Orchestration Zyno (exécution réelle opt-in) :
  - `EXECUTION_ENABLED`: `true` pour autoriser l'exécution réelle des tools (par défaut dry-run). Ne l'activez qu'avec un `executionGate` **APPROVED**.
  - Les autres variables restent inchangées (LLM mock/RAG local si non fournis).

## 📚 Docs clés

- **Architecture & Design** :
  - Design System & IA : `PROJECT_KNOWLEDGE_BASE.md` (manuel de référence)
  - Diagrammes architecture : `docs/ARCHITECTURE_DIAGRAMS.md` (Mermaid)
  - Workflows & Routes : `WORKFLOW_MATRIX.md` (cartographie routes/endpoints)
- **Produit** :
  - Deep dive: `docs/PLATFORM_DEEP_DIVE_FR.md`
  - Test plan: `TEST_PLAN.md`
  - MVP Status: `MVP_STATUS.md`
- **Déploiement** :
  - `DEPLOY.md`, `DEPLOY_SERVER.md`, `docker-compose.prod.yml`
- **Audit & Qualité** :
  - `FINAL_COMPLETE_AUDIT.md` : Audit technique exhaustif (SonarQube)
  - `docs/audit/` : Rapports d'audit détaillés

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

## 🛡️ Qualité & Conformité

- **0 Bugs** : Aucun bug critique détecté
- **Dette technique** : 59.8h (en réduction continue)
- **Issues totales** : 466 (en cours de correction systématique)
- **Linting** : ESLint strict avec 0 warnings autorisés
- **TypeScript** : Type checking strict activé
- **Tests** : Unitaires, E2E (Playwright), smoke tests

## 📦 Structure du Monorepo

```
journey_mfai_back_front/
├── mf-back/              # Backend API (Express + MongoDB)
├── journey-simulator/    # Frontend React (Vite + TypeScript)
├── web/                  # Web Portal (Next.js + Prisma)
├── docs/                 # Documentation complète
├── scripts/              # Scripts utilitaires
└── tools/                # Outils MCP et autres
```

## 🤝 Contribution

Voir `CONTRIBUTING.md` pour les guidelines de contribution.

## 📄 Licence

Voir `LICENSE` pour les détails.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Note** : Ce monorepo est en développement actif. Pour les dernières mises à jour, consultez `CHANGELOG.md` et les fichiers de documentation dans `docs/`.

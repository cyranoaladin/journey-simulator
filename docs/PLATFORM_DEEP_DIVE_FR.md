# Money Factory AI — Deep Dive Plateforme (Investisseurs / Associés / Devs Seniors)

> **But** : fournir une vue **exhaustive** et **cohérente** du fonctionnement de la plateforme Money Factory AI (MFAI) : architecture, logique métier, workflows, IA multi-agents (Zyno), RAG, données, auth, DAO, tokens/XP, staking, NFTs, pipelines, pages, et modes (demo / full journey).
>
> Ce document est volontairement long : il sert de **source de vérité** transverse (Produit + Tech).

---

## Table des matières

1. Vision produit & promesse de valeur
2. Monorepo : composants, responsabilités, ports, “frontend vs web”
3. Cartographie des parcours (journeys) & phases
4. Modèle de données & stockage (Mongo / Postgres / Redis) — quoi, pourquoi, où
5. Authentification & sécurité (JWT, wallet login, SIWS, admin API key, CORS/rate limit)
6. Zyno : orchestration multi-agents (AEPO/AECO), formats, timelines, logs, idempotence
7. RAG : ingestion, requêtage, usage par les agents, limites
8. Pipelines fonctionnels (journey step/submit, évaluations, scoring, UI blocks)
9. Économie : XP, $MFAI, staking, réputation, gating et “pass”
10. NFTs : Proof-of-Skill™, metadata, minting queue, worker, logs, statut
11. DAO : simulation gouvernance, votes, admin console, métriques
12. Pages & navigation : vues, routes, composants, UX demo
13. Observabilité, métriques, exports, outils admin
14. Environnement local & “prod-like” : scripts, docker, runbook, smoke checks
15. Tests : unitaires, E2E, stratégie, “what to trust”
16. Risques & limites MVP + axes vNext

---

## 1) Vision produit & promesse de valeur

### 1.1 Problème & proposition MFAI

Money Factory AI est un **simulateur de parcours** (journeys) Web3/AI orienté **exécution** : au lieu de “lire un cours”, l’utilisateur suit un protocole structuré (Cognitive Activation Protocol™) et produit des livrables (artifacts) guidés par une orchestration multi-agents (“Zyno”).

**Ce que l’utilisateur obtient** :

- Une trajectoire structurée (par persona) : Learn → Build → Prove → Activate → Scale (+ Launch/Collaterize selon parcours)
- Des livrables actionnables : templates, checklists, one-pagers, pitch, tokenomics, plan DAO, etc.
- Des signaux de progression : XP, tokens simulés ($MFAI), Proof-of-Skill™ (NFT), “pass” d’accès.

### 1.2 Concepts clés (glossaire)

- **Journey / Parcours** : un programme guidé par persona (ex: “Cognitive Activation Hub”, “Capital Foundry”…).
- **Phase** : étape structurée du parcours (learn/build/prove/activate/scale/launch…), avec missions et rewards.
- **Mission** : interaction structurée (run step → user input → submit) produisant UI blocks & logs.
- **Zyno** : orchestrateur multi-agents : sélection d’agents, orchestration, synthèse, timeline, logs.
- **AEPO** : **AI-Enhanced Pathway Orchestration** (orchestration individuelle : roadmap personnalisée).
- **AECO** : **AI-Enhanced Cohort Orchestration** (orchestration de cohorte : milestones partagés / feedback collectif).
- **RAG** : retrieval-augmented generation (ingestion + recherche de documents pour contextualiser les agents).
- **Proof-of-Skill™** : NFT / certificat de compétence (par phase ou completion).

---

## 2) Monorepo : composants, responsabilités, ports

### 2.1 Les 3 briques principales

**A) `journey-simulator` (Frontend UI principale)**

- Tech : Vite + React + TypeScript + Zustand + Playwright/Vitest.
- Rôle : UI utilisateur (Journeys, phases, demo mode, DAO/Resources UI, Zyno Console, etc.).
- Port local “prod-like” : **3003** (vite preview).
- Source clé : `journey-simulator/src/`

**B) `mf-back` (Backend Express + MongoDB)**

- Tech : Node.js + Express + MongoDB (Mongoose) + JWT.
- Rôle : backend métier du simulateur : users, progress, routes journey, orchestration (Zyno), RAG, DAO simulation, feedback/logs.
- Port local “prod-like” : **3002**.
- Source clé : `mf-back/`

**C) `web` (Next.js API + Prisma + Postgres + Redis)**

- Tech : Next.js App Router + Prisma/Postgres + Redis/BullMQ.
- Rôle : backend “plateforme” : SIWS/nonce, minting queue, metadata NFT, pass gating, endpoints mint simulate/execute/status, health/metrics.
- Important : dans ce repo, `web` est **API-only** (pas d’UI) : `/` redirige vers le simulator et les pages non-API répondent 404.
- Port local “prod-like” : **3001**.
- Source clé : `web/app/api/*`, `web/src/server/*`, `web/src/workers/*`, `web/prisma/*`.

### 2.2 “Frontend” vs “Web”

- **Frontend** = `journey-simulator` : ce que l’utilisateur voit.
- **Web** = `web` : serveur d’API Next (routes `app/api/*`) + worker BullMQ (minting) + Prisma/Postgres.

### 2.3 Ports & services (local “prod-like”)

Runbook prod local (scripts) :

- `scripts/prod-local-up.sh`
- `scripts/prod-local-down.sh`

Services attendus :

- `journey-simulator` : <http://127.0.0.1:3003>
- `web` : <http://127.0.0.1:3001> (API)
- `mf-back` : <http://127.0.0.1:3002>
- MongoDB : 27017 (docker)
- Postgres : 5435 (docker)
- Redis : 6379 (local ou container)

Compose dev : `docker-compose.yml`
Compose deploy : `docker-compose.deploy.yml`
OpenAPI : `docs/openapi/mf-back.openapi.yaml`, `docs/openapi/journey-simulator.yaml`

### 2.4 Cartographie API (surface fonctionnelle)

#### 2.4.1 `mf-back` (Express, port 3002) — “métier simulator”

> Base URL typique (local) : `http://127.0.0.1:3002`

Routes (groupes principaux, non exhaustifs) :

- **Auth & Users** : `/user/register`, `/user/login`, `/user/profile`, `/user/update-profile`, `/user/login-wallet`, etc.
  Code : `mf-back/routes/user-routes.js`
- **Journeys** : `/journey/:journeyId/step`, `/journey/:journeyId/submit`, `/journey/user-progress`, `/journey/complete-phase`, `/journey/reset-progress`
  Code : `mf-back/routes/journey-routes.js`
- **Zyno orchestration** : `/orchestration`, `/orchestration/logs`, `/orchestration/current-step`
  Code : `mf-back/routes/zyno-routes.js`
- **DAO** : `/dao/config`, `/dao/proposals`, `/dao/proposals/:id/vote`
  Code : `mf-back/routes/dao-routes.js`
- **RAG** : `/rag/*`
  Code : `mf-back/routes/rag-routes.js`
- **Exports** : `/export/*` (PDF/Notion, etc.)
  Code : `mf-back/routes/export-routes.js`
- **Feedback** : `/api/feedback` (AECO signal : rating/comment)
  Code : `mf-back/routes/feedback.js`

Notes d’auth :

- Beaucoup de routes sont **protégées** (`protect` middleware JWT).
- La route `POST /journey/:journeyId/step` est volontairement **non protégée** (back-compat), mais `submit` est protégé.

#### 2.4.2 `web` (Next.js API-only, port 3001) — “plateforme / web3 / mint / siws”

> Base URL typique (local) : `http://127.0.0.1:3001`

Catégories d’API routes (voir `web/app/api/**/route.ts`) :

- **Health/Metrics** : `/api/health`, `/api/healthz`, `/api/metrics`
- **Auth** :
  - SIWS : `/api/auth/siws/challenge`, `/api/auth/siws/verify`
  - Nonce/verify : `/api/auth/nonce`, `/api/auth/verify`
- **Minting** :
  - `/api/mint/simulate`, `/api/mint/execute`, `/api/mint/status`, `/api/mint/last`
  - worker : `web/src/workers/mintWorker.ts`
- **NFT metadata** : `/api/metadata/proof-of-skill`, `/api/metadata/pass`
- **Pass gating** : `/api/pass/check` (+ on-chain check Helius DAS)
- **RAG** : `/api/rag/*` (ingest/query/search)
- **Tx/Stake/DAO (simulations)** : `/api/tx/prepare`, `/api/stake/simulate`, `/api/dao/vote/simulate`
- **Journeys (Next-based)** : `/api/journeys/*` (step/submit/state/audit) — utile pour certains flows “web portal”

Important :

- `web` ne sert **pas d’UI** : `/` redirige vers `journey-simulator` et toute page non-API est 404.

### 2.5 URLs live (journey.mfai.app) — pages produit + endpoints

#### 2.5.1 UI (Journey Simulator) — pages “live”

Domaine canonique : `https://journey.mfai.app`

Pages principales :

- **Accueil** : `https://journey.mfai.app/`
- **Journeys (catalogue personas)** : `https://journey.mfai.app/journeys`
- **Workspace d’un parcours** : `https://journey.mfai.app/journeys/<personaId>`
  Exemple : `https://journey.mfai.app/journeys/cognitive-activation-hub`
- **Connexion** : `https://journey.mfai.app/login`
- **Inscription** : `https://journey.mfai.app/register`
- **DAO** : `https://journey.mfai.app/dao`
- **Resources (Knowledge Vault)** : `https://journey.mfai.app/resources`
- **Zyno Console** : `https://journey.mfai.app/zyno`
- **Playground** : `https://journey.mfai.app/playground`
- **Help / Support** : `https://journey.mfai.app/support`
- **Guide (AEPO/AECO + économie + launch)** : `https://journey.mfai.app/guide`

Ressources “bibliothèque” (base configurable, par défaut `/documents`, voir `VITE_RESOURCE_LIBRARY_BASE_URL`) :

- `https://journey.mfai.app/documents/<slug>`
- Exemple : `https://journey.mfai.app/documents/mfai-system-blueprint.html`

#### 2.5.2 API “métier” (mf-back) — URLs live

En prod, l’UI est généralement configurée avec `VITE_API_BASE_URL=https://journey.mfai.app/api` (voir `docker-compose.deploy.yml`).

**Hypothèse de déploiement standard** :

- Le reverse proxy route `https://journey.mfai.app/api/*` vers `mf-back`.
- Le préfixe `/api/` est **réécrit/retiré** avant d’atteindre Express (pattern Nginx courant : `location /api/ { proxy_pass http://127.0.0.1:3002/; }`).

Dans ce modèle, les URLs live deviennent :

- **Auth / Users** :
  - `https://journey.mfai.app/api/user/register`
  - `https://journey.mfai.app/api/user/login`
  - `https://journey.mfai.app/api/user/profile`
  - `https://journey.mfai.app/api/user/update-profile`
  - `https://journey.mfai.app/api/user/refresh`
  - Wallet challenge/response : `https://journey.mfai.app/api/user/wallet-challenge`, `https://journey.mfai.app/api/user/login-wallet`
- **Journeys (progress + step + submit)** :
  - `https://journey.mfai.app/api/journey/user-progress`
  - `https://journey.mfai.app/api/journey/<journeyId>/step`
  - `https://journey.mfai.app/api/journey/<journeyId>/submit`
  - `https://journey.mfai.app/api/journey/complete-phase`
  - `https://journey.mfai.app/api/journey/reset-progress`
- **DAO** :
  - `https://journey.mfai.app/api/dao/config`
  - `https://journey.mfai.app/api/dao/proposals`
  - `https://journey.mfai.app/api/dao/proposals/<id>/vote`
- **Orchestration / RAG / exports** :
  - `https://journey.mfai.app/api/orchestration`
  - `https://journey.mfai.app/api/rag/query`
  - `https://journey.mfai.app/api/export/*`

#### 2.5.3 API Web3/Mint (service `web` Next.js) — URLs live

L’UI consomme le minting/metadata via une origine dédiée : `VITE_SOLANA_API_BASE_URL`.

En local (prod-local) : `http://127.0.0.1:3001` (voir `scripts/prod-local-up.sh`).
En prod : cette origine peut être **journey.mfai.app** (reverse proxy vers Next `web`) ou un sous-domaine.

Routes attendues côté `web` (Next) :

- `POST https://<origin>/api/mint/simulate`
- `POST https://<origin>/api/mint/execute`
- `GET  https://<origin>/api/mint/status?jobId=<...>`
- `GET  https://<origin>/api/metadata/proof-of-skill?...`
- `GET  https://<origin>/api/metadata/pass?tier=...`

### 2.6 Inventaire technique (SDK / modules / composants) — exhaustif par brique

> Cette section répond à la question “est-ce que tous les outils/modules sont bien couverts ?”.
> Elle liste les briques *par rôle*, pas par version. Pour les versions exactes, se référer aux `package.json`.

#### 2.6.1 `journey-simulator` (Vite/React) — UI & expérience

- **Runtime UI** :
  - React + TypeScript
  - Routage : `react-router-dom` (pages `/journeys`, `/dao`, `/resources`, etc.)
  - State : `zustand` + `persist` (localStorage) — `journey-simulator/src/store/journeyStore.ts`
  - Animations : `framer-motion`
  - Icônes : `lucide-react`
  - UI feedback : toasts (ex `sonner`) + loaders/spinners
  - CSS : Tailwind (classes utilitaires dans les composants)
- **Rendu métier** :
  - UI Blocks : types `src/types/uiBlocks.ts` + renderer `src/components/UIBlocks/UIBlocksRenderer.tsx`
  - Personas/phases : `src/data/personas.ts`
  - Artifacts viewer : `src/data/artifacts.json` + modals
  - Resources/Knowledge Vault : `src/components/Resources/ResourceHub.tsx` (liens vers `/documents/*`)
- **Web3 côté UI** :
  - Wallet adapters (Solana) : `@solana/wallet-adapter-*` (connexion + signature)
  - RPC Solana : `@solana/web3.js` (airdrop/balance devnet, helpers)
  - Minting (Proof-of-Skill™) : appels HTTP vers l’API Next `web` (`/api/mint/*`, `/api/metadata/*`) via `src/utils/blockchain.ts`
- **Tests** :
  - Unit : Vitest
  - E2E : Playwright (mocks réseau deterministes)

#### 2.6.2 `mf-back` (Express/Mongo) — backend métier, orchestration, DAO, RAG

- **Serveur** :
  - Express + middlewares (CORS, rate-limit, Helmet, compression, logger)
  - JWT : `jsonwebtoken` + middleware `protect`
  - Validation/config : `zod` côté `config/env.js` (whitelist origins, rate limit)
- **DB** :
  - MongoDB + Mongoose (users, journeys, logs, progress…)
- **Orchestration agents** :
  - Zyno orchestrator + AgentFactory (sélection d’agent selon `{ trackId, phaseId, missionId }`)
  - Idempotence : `idempotencyKey` pour éviter double traitement sur `submit`
- **Web3 (backend)** :
  - Wallet login challenge/verify (dépendances type `tweetnacl`, `bs58` selon implémentation)
- **DAO** :
  - simulation proposals/votes (routes `/dao/*`)
- **RAG** :
  - routes `/rag/*` + client RAG (header `x-api-key` côté backend vers service RAG si utilisé)
- **Tests** :
  - Jest (unit/integration), avec option `SKIP_DB_CONNECTION` en CI

#### 2.6.3 `web` (Next.js/Prisma/Redis) — API Web3, SIWS, minting queue

- **Next.js App Router** :
  - Routes `web/app/api/**/route.ts` (health, metrics, auth, rag, mint, metadata, pass)
  - Validation de payload : `zod` (ex: metadata routes)
- **DB** :
  - Prisma Client + Postgres (Wallet, NftPass, JourneyAccess, MintLog, AgentLog, Doc…)
- **Queue / jobs** :
  - BullMQ + Redis (queue minting + Worker)
  - Redis client : `ioredis` (config `maxRetriesPerRequest: null` pour compat BullMQ)
- **Solana minting (serveur)** :
  - Metaplex **UMI** + `mpl-token-metadata` (createAndMint)
  - Logs : `MintLog` (SUCCESS/FAILED) + endpoint `/api/mint/status`
- **SIWS (Sign-In With Solana)** :
  - Challenge/verify + store Redis (nonces)
- **Sécurité** :
  - Middleware `web/middleware.ts` : CORS + rate limit + guard `/admin/*` via `x-api-key`

> Point d’attention : l’origine live réelle de `web` (Next) peut être la même que `journey.mfai.app` via reverse proxy, ou un sous-domaine dédié. Dans tous les cas, l’UI dépend de `VITE_SOLANA_API_BASE_URL`.

---

## 3) Parcours (Journeys) & phases (Cognitive Activation Protocol™)

### 3.1 Structure “persona → phases”

Le “contenu” d’un parcours est majoritairement **configuré** via des fichiers data du frontend :

- Personas + phases : `journey-simulator/src/data/personas`
- Proofs/metadata : `journey-simulator/src/data/proofsData`
- Artifacts : `journey-simulator/src/data/artifacts.json`

Chaque **phase** inclut typiquement :

- `id`, `title`, `description`, `mission`
- rewards : `xpReward`, `mfaiReward`, `nftReward`
- flags : staking required / DAO vote required / launch-collaterize, etc.

### 3.2 Phase : workflow fonctionnel (macro)

À haut niveau :

1. L’utilisateur choisit une persona.
2. Sur une phase donnée :
   - “Run Simulation” déclenche une étape guidée (UI blocks).
   - Certaines phases demandent un input (“mission block”), ensuite “Submit Mission”.
   - Une validation (évaluation / scoring) peut produire feedback, XP, rewards, et déverrouiller phase suivante.
3. À la fin :
   - recap, mint Proof-of-Skill™, export, etc.

### 3.3 Modes : demo vs “full journey”

**Demo mode** :

- session “demo-token”
- progression persistée côté localStorage (base demo locale)
- autoplay possible (auto-simulation phases) avec barre de progression + bouton stop
- mocks E2E stables (Playwright) pour fiabiliser les flows

**Full journey** :

- progression synchronisée avec `mf-back` (Mongo) via endpoints progress/step/submit
- usage Zyno orchestration / logs / RAG selon configuration

### 3.4 Catalogue des personas & phases (source de vérité)

Source : `journey-simulator/src/data/personas.ts` (ce fichier est la **référence** pour titres, missions, rewards, gating).

Structure d’une phase (type) : `journey-simulator/src/types/journey.ts`

- `id`, `title`, `description`, `mission`, `duration`
- rewards : `xpReward`, `mfaiReward`, `nftReward`
- gating : `stakingRequired`, `daoVoteRequired`
- `tools`, `outcomes`, `zynoTip`

#### 3.4.1 Persona “The Cognitive Activation Hub” (`cognitive-activation-hub`)

| # | Phase ID | Titre | Gating | XP | $MFAI | NFT reward |
|---:|---|---|---|---:|---:|---|
| 1 | cognitive-orientation | Cognition Ignition | — | 60 | 6 | Proof-of-Skill™: Web3 Orientation |
| 2 | solana-fluency | Solana Systems Lab | Staking 50 | 80 | 8 | Solana Fluency Patch |
| 3 | token-design-lab | Token Design Studio | DAO vote | 90 | 9 | Tokenomics Architect Badge |
| 4 | identity-proofing | Identity & Security Forge | — | 100 | 10 | Sovereign Identity Seal |
| 5 | ecosystem-engagement | Ecosystem Activation | — | 120 | 12 | Proof-of-Skill™: Activation |
| 6 | launch-collaterize | Launch via Collaterize | — | 200 | 20 | Collaterize Launch Badge |

#### 3.4.2 Persona “The Capital Foundry” (`capital-foundry`)

| # | Phase ID | Titre | Gating | XP | $MFAI | NFT reward |
|---:|---|---|---|---:|---:|---|
| 1 | capital-discovery | Protocol Discovery Sprint | — | 80 | 8 | DeFi Recon Marker |
| 2 | program-forge | Program Forge Lab | — | 110 | 11 | Anchor Mastery Crest |
| 3 | oracle-integration | Oracle & Liquidity Mesh | — | 120 | 12 | Liquidity Architect Token |
| 4 | risk-command | Risk Command Center | Staking 75 | 130 | 13 | Proof-of-Yield™ Sentinel |
| 5 | capital-launchpad | Launch & Scale Deck | DAO vote | 150 | 15 | Neuro-Dividend Initiator |
| 6 | launch-collaterize | Launch via Collaterize | — | 200 | 20 | Collaterize Launch Badge |

#### 3.4.3 Persona “The System Architect” (`system-architect`)

| # | Phase ID | Titre | Gating | XP | $MFAI | NFT reward |
|---:|---|---|---|---:|---:|---|
| 1 | architecture-scan | Topology Reconnaissance | — | 90 | 9 | Systems Scout Sigil |
| 2 | depin-studio | DePIN Studio | Staking 90 | 120 | 12 | DePIN Architect Token |
| 3 | onchain-ai | On-Chain Intelligence Lab | — | 130 | 13 | AI Provenance Seal |
| 4 | systems-hardening | Systems Hardening Forge | — | 140 | 14 | Reliability Vanguard Patch |
| 5 | synaptic-rollout | Synaptic Rollout | DAO vote | 160 | 16 | Protocol Architect Laureate |
| 6 | launch-collaterize | Launch via Collaterize | — | 200 | 20 | Collaterize Launch Badge |

#### 3.4.4 Persona “The Experience Studio” (`experience-studio`)

| # | Phase ID | Titre | Gating | XP | $MFAI | NFT reward |
|---:|---|---|---|---:|---:|---|
| 1 | experience-discovery | Experience Discovery | — | 70 | 7 | Experience Strategist Pin |
| 2 | nft-systems-lab | NFT Systems Lab | — | 100 | 10 | Metaplex Creator Crest |
| 3 | gameplay-lab | Gameplay & Mechanics Forge | — | 120 | 12 | Gameplay Architect Badge |
| 4 | ux-elevation | UX Elevation Studio | — | 130 | 13 | UX Maestro Token |
| 5 | experience-launch | Launch & Community Resonance | — | 150 | 15 | Cultural Impact Seal |
| 6 | launch-collaterize | Launch via Collaterize | — | 200 | 20 | Collaterize Launch Badge |

#### 3.4.5 Persona “The Impact Engine” (`impact-engine`)

| # | Phase ID | Titre | Gating | XP | $MFAI | NFT reward |
|---:|---|---|---|---:|---:|---|
| 1 | impact-charter | Mission Charter Lab | — | 75 | 7 | Purpose Architect Token |
| 2 | dao-design | DAO Design Workshop | — | 110 | 11 | Synaptic Governance Badge |
| 3 | philanthropy-protocols | Transparent Funding Protocols | — | 125 | 12 | Public Goods Laureate |
| 4 | identity-reputation | Identity & Reputation Mesh | — | 135 | 13 | Social Proof Seal |
| 5 | synaptic-impact | Synaptic Impact Launch | — | 150 | 15 | Impact Engine Proof |
| 6 | launch-collaterize | Launch via Collaterize | — | 200 | 20 | Collaterize Launch Badge |

#### 3.4.6 Persona “The Resilience Master” (`resilience-master`)

| # | Phase ID | Titre | Gating | XP | $MFAI | NFT reward |
|---:|---|---|---|---:|---:|---|
| 1 | security-baseline | Security Baseline Forge | — | 90 | 9 | Guardian Initiate Emblem |
| 2 | exploit-hunt | Exploit Hunter Arena | — | 120 | 12 | Offense-Informed Shield |
| 3 | defense-systems | Defense Systems Orchestrator | — | 130 | 13 | Protocol Shield Token |
| 4 | incident-response | On-Chain Incident Command | — | 140 | 14 | Forensic Vanguard Badge |
| 5 | redblue-evolution | Red/Blue Evolution | — | 170 | 17 | Resilience Master Seal |
| 6 | launch-collaterize | Launch via Collaterize | — | 200 | 20 | Collaterize Launch Badge |

> Pour le **détail exhaustif** par phase (mission, tools, outcomes, zynoTip), consulter directement `journey-simulator/src/data/personas.ts`.

---

## 4) Modèle de données & stockage (Mongo / Postgres / Redis)

### 4.1 MongoDB (mf-back) : logique métier “simulator”

MongoDB sert à :

- stocker utilisateurs “simulator”
- stocker état de progression
- stocker logs d’agents (AgentLog / feedback)
- stocker journeys et (selon implémentation) runs/idempotence

Point d’entrée Express : `mf-back/app.js`

Routes clés :

- `/user/*` : profile, verify, update-profile, login/register selon implémentation
- `/journey/*` : user-progress, step, submit, complete-phase, reset-progress
- `/dao/*` : config/proposals/vote (simulation)
- `/orchestration` : Zyno orchestrator (multi-agents)
- `/api/feedback` : feedback (AECO signal)
- `/healthz`, `/readyz` : health routes

### 4.2 Postgres (web/Prisma) : logique “plateforme”

Postgres gère les entités “plateforme” (extraits du schéma `web/prisma/schema.prisma`) :

- Users / Wallets / NftPass / JourneyAccess : gating premium, historique de pass
- MintLog : journaux de mint (SUCCESS/FAILED)
- Doc : stockage de docs/embeddings (si utilisé par RAG interne)
- AgentRun / AgentLog / JourneyState : instrumentation/observabilité côté Next (selon usage)

### 4.3 Redis (web) : SIWS + BullMQ

Redis est utilisé pour :

- **SIWS nonce/challenge store** (anti-replay)
- **BullMQ** : queue minting + worker “mintWorker”

Config Redis : `web/src/server/redis.ts`
Queue : `web/src/server/queue.ts`
Worker : `web/src/workers/mintWorker.ts`

---

## 5) Authentification & sécurité

### 5.1 Auth côté mf-back

Le backend Express (`mf-back`) gère :

- JWT login (email/password)
- login wallet (challenge-response) selon routes
- `JWT_SECRET` obligatoire (en prod)

Voir :

- `mf-back/controllers/user-controller.js`
- `mf-back/middleware/auth.js`
- `docs/AUTH_FLOWS.md`
- OpenAPI `docs/openapi/mf-back.openapi.yaml`

### 5.2 SIWS (Sign-In With Solana) côté web

Le projet `web` implémente SIWS :

- nonce store Redis
- challenge route + verify route

Points clés :

- `web/src/server/siwsStore.ts`
- `web/app/api/auth/siws/challenge/route.ts`
- `web/app/api/auth/siws/verify/route.ts`

### 5.3 Sécurité API : CORS, rate limit, admin guard

**mf-back** :

- CORS : `mf-back/config/env.js` (allow list + env override)
- rate limit : express-rate-limit
- helmet + compression

**web** :

- middleware Next : CORS + rate limit
- admin routes protégées par `x-api-key`

### 5.4 `x-api-key` (Admin API Key) : utilité, obtention, utilisation

`x-api-key` est un header HTTP utilisé pour protéger des **endpoints d’administration** (inspection, scoreboard, logs, exports internes).
La valeur attendue correspond à la variable serveur **`ADMIN_API_KEY`** (secret).

#### 5.4.1 À quoi ça sert (utilité)

- **Réduire la surface d’attaque** : certains endpoints ne doivent pas être accessibles à des utilisateurs “standard”.
- **Accès out-of-band** : utile pour outils internes (ops, QA, debug, scoreboard) sans implémenter un RBAC complet.
- **Séparer “user auth” et “admin operations”** : même si un JWT fuit, les endpoints admin restent bloqués.

#### 5.4.2 Où `x-api-key` est exigé (réel dans ce repo)

1) **Côté Next `web`** (API-only)

- Middleware : `web/middleware.ts`
- Toute route `/<...>/admin/*` renvoie **401 Unauthorized** si :
  - header `x-api-key` absent, ou
  - `x-api-key !== process.env.ADMIN_API_KEY`

2) **Côté Express `mf-back`**

- Exemple explicite : `mf-back/routes/zyno-routes.js` protège :
  - `GET /admin/agent-scoreboard` via `x-api-key`

> Important : `x-api-key` est **différent** de `Authorization: Bearer ...` (JWT). Les deux peuvent coexister.

#### 5.4.3 Comment obtenir `ADMIN_API_KEY`

Selon l’environnement :

- **Prod (déploiement)** :
  - `deploy.sh` demande une `ADMIN_API_KEY` et, si vide, en **génère une aléatoire** (`openssl rand -hex 32`) puis l’écrit dans `.deploy.env`.
  - En pratique : la clé est un **secret d’infra** (Vault / CI secrets / `.deploy.env` côté serveur).

- **Prod-local (dev)** :
  - `scripts/prod-local-up.sh` définit par défaut :
    - `ADMIN_API_KEY=admin-secret-key` (si non override)
  - Recommandé : override par une valeur forte :
    - `ADMIN_API_KEY="$(openssl rand -hex 32)" ./scripts/prod-local-up.sh`

#### 5.4.4 Comment l’utiliser (curl prêt à copier/coller)

**A) Endpoints admin côté `web` (Next, `/admin/*`)** :

```bash
ADMIN_API_KEY="VOTRE_CLE_ADMIN"
BASE_WEB="https://journey.mfai.app"   # ou l'origine réelle du service `web`

curl -sS "$BASE_WEB/admin/state" -H "x-api-key: $ADMIN_API_KEY" | jq .
curl -sS "$BASE_WEB/admin/logs"  -H "x-api-key: $ADMIN_API_KEY" | jq .
```

**B) Scoreboard côté `mf-back`** (via proxy API live) :

```bash
ADMIN_API_KEY="VOTRE_CLE_ADMIN"
BASE_API="https://journey.mfai.app/api"

curl -sS "$BASE_API/admin/agent-scoreboard" \
  -H "x-api-key: $ADMIN_API_KEY" | jq .
```

#### 5.4.5 Où la saisir dans l’UI (usage produit)

Certaines fonctions internes demandent explicitement une clé :

- Export mission / scoreboard : `journey-simulator/src/components/Zyno/MissionFeedbackSummary.tsx` (placeholder “Enter x-api-key”)
- Upload ressources RAG : `journey-simulator/src/components/Zyno/ResourceUploader.tsx`

#### 5.4.6 Bonnes pratiques (sécurité/ops)

- **Ne jamais exposer** `ADMIN_API_KEY` côté client (`VITE_*` / `NEXT_PUBLIC_*`).
- **Rotation** régulière + révocation immédiate en cas de suspicion.
- **Restriction réseau** recommandée (IP allowlist / VPN) sur `/admin/*`.
- **Journaliser** les accès admin (sans logger la clé).

#### 5.4.7 Mini runbook opérationnel (prod) : stockage, rotation, restriction réseau

##### A) Où stocker `ADMIN_API_KEY` (Vault / CI / serveur)

- **Source of truth** : un secret manager (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, 1Password/Bitwarden for ops).
- **CI/CD** : injecter `ADMIN_API_KEY` via secrets GitHub Actions/GitLab CI (jamais en clair dans le repo).
- **Serveur** :
  - charger via `EnvironmentFile` systemd (fichier root-only) ou via variables d’environnement Docker/Compose.
  - permissions strictes : `chmod 600` sur les fichiers `.env` / `.deploy.env`.
- **À éviter** : hardcode dans le code, partage par chat/email, stockage dans un doc public.

##### B) Rotation sans downtime (stratégie “double key”)

Objectif : éviter qu’une rotation casse les outils admin en plein usage.

- **1) Préparer une période de grâce** :
  - Ajouter (si nécessaire) une seconde variable `ADMIN_API_KEY_NEXT` (ou une liste) acceptée en parallèle pendant \(T\) heures/jours.
  - Pendant la fenêtre : accepter `x-api-key == ADMIN_API_KEY` **ou** `x-api-key == ADMIN_API_KEY_NEXT`.

- **2) Déployer en 2 temps** :
  - **Déploiement A** : activer `ADMIN_API_KEY_NEXT` (sans retirer l’ancienne) + redémarrer services.
  - Mettre à jour les outils/CI pour utiliser la nouvelle clé.
  - **Déploiement B** (après fenêtre) : promouvoir `ADMIN_API_KEY_NEXT` en `ADMIN_API_KEY`, supprimer l’ancienne.

- **3) Journaliser la bascule** :
  - tracer “admin key rotated” (sans logguer la valeur) et monitorer les 401 sur `/admin/*`.

> Note : aujourd’hui, le code compare à une seule valeur `process.env.ADMIN_API_KEY`.
> La rotation “zero downtime” demande donc une petite évolution (acceptation multi-clés) si vous voulez une vraie période de grâce.

##### C) Restreindre `/admin/*` par IP/VPN (défense en profondeur)

**Recommandation** : `x-api-key` **+** restriction réseau.

Options :

- **Option 1 (Nginx)** : allowlist IP sur `/admin/`

```nginx
location /admin/ {
  # IP allowlist (exemples)
  allow 203.0.113.10;    # bureau
  allow 198.51.100.0/24; # VPN
  deny all;

  proxy_pass http://127.0.0.1:3001; # (ou le service qui sert /admin)
}
```

- **Option 2 (Cloudflare / WAF)** :
  - règle “/admin/* only from VPN” (Access / Zero Trust) + MFA
  - rate limit agressif + blocage geo si pertinent

- **Option 3 (VPN-only)** :
  - ne pas exposer `/admin/*` publiquement : écouter sur un réseau privé et accéder via VPN/bastion.

Checklist “prod safe” :

- `/admin/*` inaccessible sans VPN/IP allowlist
- `ADMIN_API_KEY` forte (32+ bytes), rotatée périodiquement
- logs d’accès admin (sans secret), alerting sur bursts de 401/403

---

## 6) Zyno : orchestration multi-agents (AEPO/AECO), logs, idempotence

### 6.1 AEPO/AECO (définitions unifiées)

**AEPO** (AI-Enhanced Pathway Orchestration) :

- orchestration individuelle : roadmap personnalisée (milestones, deliverables, actions)
- déclenche agents selon le contexte user (persona/phase/intent)
- gère routing, feedback, next steps

**AECO** (AI-Enhanced Cohort Orchestration) :

- orchestration groupe/cohorte : milestones partagés, peer review, dashboards
- dans le MVP backend, AECO est aujourd’hui surtout un **signal feedback** (rating/comment), extensible vers analytics de cohorte.

Backend : `mf-back/utils/aepoAeco.js` + injection `meta.orchestration` dans `/orchestration`.

### 6.2 Orchestrateur `mf-back/orchestration/zynoOrchestrator.js`

Responsabilités :

- détecter l’intent (heuristique ou mapping)
- choisir un mode d’exécution (sync/sequential/parallel)
- déclencher agents (registry)
- normaliser les réponses (prompt, reasoning, action, output, sources)
- produire une `timeline` stable pour l’UI/observabilité
- calculer un **aepoScore** par agent (signal d’exécution)
- persister métriques et interactions (agent_metrics, agent_memory)

### 6.3 Logs & observabilité

**AgentLog (Mongo)** :

- écrit dans `mf-back/routes/zyno-routes.js` via `AgentLog.create()`
- stocke : promptSent, reasoning, actionTaken, response/output, sources, metrics, feedback, timelineIndex, etc.

**Metrics (fichiers)** :

- `mf-back/memory/agent_metrics.log.json`
- `mf-back/logs/agent_feedback.json`

### 6.4 Idempotence & state machine

Le repo documente une state machine “journey” et l’idempotence au niveau des runs :

- `docs/JOURNEY_STATE_MACHINE.md`

Objectif :

- empêcher double exécution d’un même step/submit (retries, double click, refresh).

---

## 7) RAG : ingestion, requêtage, usage agents

Le RAG permet aux agents de :

- récupérer des extraits de docs (playbooks, templates, whitepapers)
- citer sources, éviter hallucinations, contextualiser

Deux patterns :

- RAG externe (service de recherche)
- RAG interne (stockage Doc/embedding dans Postgres Prisma, selon endpoints)

Voir :

- `mf-back/routes/rag-routes.js` (côté Express)
- `web/app/api/rag/*` (côté Next)
- docs : `docs/ARCHITECTURE_DATA.md`, `docs/WEB3_INTEGRATION.md`, `docs/observability/metrics.md`

---

## 8) Pipelines fonctionnels (journey step/submit, évaluations, UI blocks)

### 8.1 Contrat UI Blocks

Le frontend rend des “UI blocks” (text, mission, evaluation, resources, action suggestions…) :

- types : `journey-simulator/src/types/uiBlocks.ts`
- renderer : `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`

**Blocs principaux (ce que Zyno peut générer)** :

- **`text_block`** : guidance, synthèse, instructions.
- **`mission_block`** : demande d’input structuré (texte / URL / confirmation) + CTA “Submit”.
- **`evaluation_block`** : score global + axes + feedback.
- **`xp_block`** : XP gagné, XP total, next level.
- **`action_suggestions_block`** : choix cliquables qui relancent un `step` (itération).
- **`document_block`** : document long en markdown (blueprint, pitch, checklist, tokenomics…).
- **Blocs “resources/tools”** : renvois vers playbooks `/documents` et ressources.

### 8.2 Exécution d’étape (run simulation)

Flow typique :

1. UI déclenche `runInteractiveStep(...)` dans `journeyStore`.
2. Appel API vers `mf-back` (endpoint step) et réponse structurée.
3. UI affiche `lastStep.ui_blocks`.

**Endpoint** :

- Local : `POST http://127.0.0.1:3002/journey/<journeyId>/step`
- Live (via proxy) : `POST https://journey.mfai.app/api/journey/<journeyId>/step`

**Payload (résumé)** (voir `journey-simulator/src/store/journeyStore.ts`) :

- `phaseId` : id de la phase (ex `token-design-lab`)
- `trackId` : personaId (ex `cognitive-activation-hub`)
- `userInput` : optionnel (souvent vide au “Run Simulation”)
- `language`, `mode`, `tone`
- `journeyState` : snapshot (XP + phases complétées)

### 8.3 Soumission mission (submit)

Flow typique :

1. UI collecte un input (link/text/etc.)
2. `api.submitMission(...)` → backend
3. backend évalue, retourne evaluation blocks + logs d’agents

**Endpoint** :

- Local : `POST http://127.0.0.1:3002/journey/<journeyId>/submit`
- Live (via proxy) : `POST https://journey.mfai.app/api/journey/<journeyId>/submit`

**Côté backend (mf-back)** (voir `mf-back/controllers/journey-controller.js`) :

- Sélection d’un agent via `AgentFactory.getAgentForContext({ trackId, phaseId, missionId })`
- Exécution `agent.run(ctx, { idempotencyKey })` (anti double-submit)
- Récupération d’un `evaluationPayload` (inclut notamment `global_score`)
- Calcul XP :
  - \(xp\_awarded = \max(0, round(global\_score \times 10))\)
  - `global_score` est conçu comme une note **0–10**
- Persistance :
  - si **token ≠ demo-token** : incrément `total_xp` en Mongo + stockage `last_ai_submission`
  - si **demo-token** : pas d’écriture DB, mais le serveur renvoie un `progress` calculé depuis `journeyState`

### 8.4 Validation d’une phase (UI) : “Complete / Mint NFT” + score

Dans l’UI (`journey-simulator/src/components/Journey/JourneyWorkspace.tsx`), la validation suit le pattern :

- L’utilisateur clique **Complete** / **Mint NFT**.
- L’UI appelle `submitMission(...)` avec un payload `inputType: "confirmation"` et un `missionId` dérivé (ex `${phaseId}-mission`).
- Si `submitMission` renvoie `success: true` :
  - l’UI lit `evaluation.global_score` (0–10)
  - transforme ce score en **score UI 0–100** :
    - \(score\_{ui} = round(clamp(global\_score, 0..10) \times 10)\)
  - appelle `completePhase(phaseIndex, { score, xpReward, mfaiReward, nftReward })`
  - ouvre la modal Proof-of-Skill™ (éligibilité + mint)

**Important (règle produit vs enforcement)** :

- Le guide UX mentionne “score ≥ 8.0” pour valider certains milestones (voir `journey-simulator/src/pages/GuidePage.tsx`).
- Dans l’implémentation actuelle, la “validation” est principalement **binaire** : *submit réussi → phase validée*, et le score sert surtout à calculer XP + feedback.
- Si vous souhaitez une contrainte stricte “< 8.0 = non validé”, il faut l’**enforcer** explicitement (UI et/ou backend).

---

## 9) Économie : XP, $MFAI, staking, réputation, gating

### 9.1 XP

XP est un score de progression :

- calculé par phase (xpReward)
- affiché dans header / panels
- peut influencer “pass level” (Free/Gold/Platinum/Diamond) via heuristique locale ou backend.

#### 9.1.1 Calculs “signaux” AEPO/AECO/Alignment (frontend)

Le frontend calcule des signaux “AEPO/AECO/Alignment” (UX) à partir de la progression utilisateur :

- Source : `journey-simulator/src/utils/journeySignals.ts`

Formules (résumé) :

- **AEPO** : base + XP normalisé + ratio de completion
- **AECO** : base + completion + facteur proposals
- **Alignment** : base + completion + votingPower + XP normalisé

Important :

- Ces signaux UX ne sont pas le même concept que les **métriques backend** (per-agent `aepoScore` calculé dans `mf-back/orchestration/zynoOrchestrator.js`).
- Ils servent à **rendre lisible** la progression et l’alignement gouvernance/exécution dans l’UI.

### 9.2 $MFAI (simulation & récompenses)

$MFAI est un token “économie” :

- récompense phase (mfaiReward)
- utilisé dans staking (simulation)
- influence voting power (simulation)

### 9.3 Staking (simulation)

Le simulateur expose une UX de staking :

- modale staking (montant)
- impacte stakedMfai + éventuellement votingPower

### 9.4 Pass / gating

Le projet `web` supporte un gating “pass” basé sur NFT pass on-chain (Helius DAS) + cache DB :

- check pass : `web/app/api/pass/check/route.ts`
- on-chain check : `web/src/lib/solana/checkPassOnChain.ts`
- tables : Wallet/NftPass/JourneyAccess

---

## 10) NFTs : Proof-of-Skill™, minting queue, metadata, statut

### 10.1 Types de NFTs

- Proof-of-Skill™ (par phase / completion)
- Access Pass (tiers)
- badges/variants selon persona/phase

### 10.2 Metadata dynamiques (API)

Next.js expose des routes metadata :

- `/api/metadata/proof-of-skill`
- `/api/metadata/pass`

### 10.3 Minting pipeline (BullMQ + Worker)

Pattern :

1. `simulate` → estimation / risk
2. `execute` → enqueue job
3. worker exécute la tx sur Solana (UMI)
4. logs dans Prisma `MintLog`
5. `status` endpoint pour polling

Docs : `docs/WEB3_INTEGRATION.md` + code `web/src/workers/mintWorker.ts`.

---

## 11) DAO : simulation gouvernance, votes, admin console

Le simulateur intègre une gouvernance “DAO-like” :

- liste proposals
- vote yes/no
- config quorum / voter weights
- admin console (x-api-key) pour créer proposals, etc.

Backend Express routes : `mf-back/routes/dao-routes.js` (voir code).
Frontend : pages `/dao`, admin panel UI.

---

## 12) Pages & navigation : vues, routes, UX demo

### 12.1 Principales routes UI (`journey-simulator`)

- `/` : landing + header unifié
- `/login`, `/register`
- `/journeys` (liste personas) et `/journeys/:id` (workspace)
- `/dao`, `/resources`, `/zyno`, `/playground`, `/support`, `/guide`

Navigation : `journey-simulator/src/components/navigation/MainNavigation.tsx`

### 12.2 Demo mode

- bouton “Demo Mode” et login automatique
- autoplay phases avec barre de progression + bouton stop
- stockage local demo DB (localStorage)

### 12.3 “Launch with Zyno” : démarrage d’un parcours, missions, workflow détaillé

Le bouton **“Launch with Zyno”** (carte de persona) correspond au démarrage du “workspace” d’un parcours.

#### 12.3.1 Séquence utilisateur (macro)

1. **Sélection du parcours** : depuis `https://journey.mfai.app/journeys`
2. **Entrée dans le workspace** : navigation vers `https://journey.mfai.app/journeys/<personaId>`
3. **Run Simulation** :
   - déclenche un `step` : Zyno génère des UI blocks (guidance + mission + suggestions)
4. **Mission** :
   - l’utilisateur remplit l’input demandé par un `mission_block`
   - clique “Submit Mission”
5. **Évaluation/Validation** :
   - le backend renvoie un `evaluation` (score 0–10) + feedback multi-axes
   - XP est calculé (score × 10) et la phase peut être marquée complétée
6. **Rewards** :
   - $MFAI (simulation) + staking/DAO selon gating de la phase
   - Proof-of-Skill™ (NFT) éligible au mint

#### 12.3.2 Mécanique “missions” (ce que c’est)

Une **mission** est un contrat d’interaction :

- **entrée** : un type d’input (URL/texte/confirmation) + contexte (persona/phase/mode/tone)
- **traitement** : un agent spécialisé (sélectionné par AgentFactory) + éventuellement RAG
- **sortie** : UI blocks (guidance/document/action suggestions), puis une **évaluation** à la soumission

Dans le code, une mission est identifiée par :

- `missionId` (souvent dérivé : `${phaseId}-mission`)
- `phaseId`, `trackId` (personaId)

#### 12.3.3 Types de “documents” générés, ressources et artifacts

On distingue 3 catégories :

1) **Documents générés par Zyno (runtime)**

- Produits en `document_block` (markdown) et/ou `text_block`.
- Exemples : blueprint, pitch deck narrative, checklist sécurité, tokenomics, DAO constitution, runbooks.

2) **Artifacts (viewer)**

- Définis dans `journey-simulator/src/data/artifacts.json` (titres, agents, contenu).
- En demo, certains artifacts se déverrouillent automatiquement sur des étapes spécifiques.

3) **Resources (bibliothèque statique)**

- Page : `https://journey.mfai.app/resources`
- Contenu : playbooks/templates/PDF/guide “HTML” servis depuis `/documents` (base : `VITE_RESOURCE_LIBRARY_BASE_URL`, défaut `/documents`).
- Source UI : `journey-simulator/src/components/Resources/ResourceHub.tsx` (liste `resourceLibrary`).

---

## 13) Observabilité, métriques, exports

### 13.1 Health checks

- `mf-back` : routes health (voir `mf-back/routes/health-routes`)
- `web` : `/api/health`, `/api/metrics`

### 13.2 Exports (PDF/Notion)

Frontend peut exporter des synthèses (mission summary) :

- export routes backend : `mf-back/routes/export-routes.js`
- UI : `journey-simulator/src/components/Zyno/MissionFeedbackSummary.tsx`

### 13.3 Metrics & probes (healthz/readyz) — ce qui est monitorable

Références :

- `docs/observability/metrics.md`
- `web/src/server/metrics.ts` (compteurs in-memory exposés via `web/app/api/metrics/route.ts`)

Endpoints clés :

- **mf-back** :
  - `/healthz` : liveness
  - `/readyz` : readiness (Mongo + dépendances critiques)
- **web** :
  - `/api/health` et `/api/healthz` : liveness
  - `/api/metrics` : métriques JSON (simple, extensible Prometheus)

UI :

- `journey-simulator/src/components/Zyno/ZynoConsole.tsx` peut “poller” health/ready et afficher un statut (utile en demo et en ops).

### 13.4 CI/CD (contrat qualité) — ce qui garantit la robustesse

Référence : `docs/cicd/pipeline.md`

Pipeline typique :

- Node 20 + `npm ci`
- Lint + Build
- Unit tests (backend coverage ≥ 85% recommandé)
- Playwright E2E (artefacts conservés en cas d’échec)
- Build Docker multi-stage + scan (ex: Trivy)
- Release sur tag SemVer `vX.Y.Z`

---

## 14) Environnement local & prod-like : scripts & runbook

### 14.1 Démarrage local prod-like (recommandé)

Utiliser :

- `./scripts/prod-local-up.sh`
- `./scripts/prod-local-down.sh`

Ce mode démarre :

- DBs (mongo/postgres) via docker
- redis (local si déjà présent)
- mf-back (3002), web (3001), worker mint, simulator preview (3003)

### 14.2 Smoke checks

Attendus :

- simulator : HTTP 200 sur `http://127.0.0.1:3003/`
- web API : `http://127.0.0.1:3001/api/health` → 200
- mf-back : `/` peut être 404 (normal), mais routes métier doivent répondre.

---

## 15) Tests : unitaires, E2E, stratégie

### 15.1 Frontend (journey-simulator)

- unit : Vitest
- E2E : Playwright

### 15.2 Backend (mf-back)

- Jest (avec SKIP_DB_CONNECTION en test)
- tests routes orchestration/admin/export

### 15.3 “What to trust”

- Les tests E2E mockent les endpoints critiques pour stabiliser l’UI.
- Les tests backend assurent la robustesse de l’orchestration et des routes essentielles.

---

## 16) Risques & limites MVP + axes vNext

### 16.1 Limites MVP (assumées)

- AECO “cohort” est surtout un signal feedback aujourd’hui ; la coordination multi-user complète est à formaliser.
- Plusieurs sous-systèmes Web3 sont “semi-simulés” (selon config/env) pour rendre la démo fiable.
- RAG dépend du service configuré ; fallback si absent.

### 16.2 Axes vNext

- Cohorts réelles (multi-user state, dashboards, peer review workflows)
- Observabilité unifiée (traces, métriques, events)
- Orchestration plus déterministe (state machine + idempotence end-to-end)
- Hardening sécurité (secret management, rate limit distribué, audit logs)

---

## Annexes (références repo)

- Architecture : `docs/ARCHITECTURE.md`, `docs/system_blueprint.md`
- Web3 & minting : `docs/WEB3_INTEGRATION.md`
- Auth : `docs/AUTH_FLOWS.md`
- State machine : `docs/JOURNEY_STATE_MACHINE.md`
- OpenAPI : `docs/openapi/mf-back.openapi.yaml`, `docs/openapi/journey-simulator.yaml`
- Orchestration AEPO/AECO (frontend) : `journey-simulator/src/content/aepoAeco.ts`
- Orchestration AEPO/AECO (backend) : `mf-back/utils/aepoAeco.js`

---

## Annexes — Index du code (navigation “dev senior”)

> Objectif : permettre de trouver *immédiatement* la bonne zone du repo par sujet.

### Auth (email/password, JWT, refresh, wallet login)

- **Routes** : `mf-back/routes/user-routes.js`
- **Middleware JWT** (inclut `demo-token`) : `mf-back/middleware/auth.js`
- **Auth wallet “connect-wallet”** (API dédiée) : `mf-back/routes/auth-routes.js`
- **Config CORS & env** : `mf-back/config/env.js`

### SIWS (Sign-In With Solana) — Next `web` + Redis

- **Store Redis** : `web/src/server/siwsStore.ts`
- **Challenge** : `web/app/api/auth/siws/challenge/route.ts`
- **Verify signature** : `web/app/api/auth/siws/verify/route.ts`
- **Redis client** : `web/src/server/redis.ts`

### Mint / Web3 (Proof-of-Skill™, metadata, queue, worker)

- **Frontend mint trigger (Proof-of-Skill™)** : `journey-simulator/src/utils/blockchain.ts`
- **Modal Proof NFT (UX mint)** : `journey-simulator/src/components/NFTProofModal.tsx`
- **Mint API (Next)** :
  - `web/app/api/mint/simulate/route.ts`
  - `web/app/api/mint/execute/route.ts`
  - `web/app/api/mint/status/route.ts`
  - `web/app/api/mint/last/route.ts`
- **Metadata NFTs (Next)** :
  - `web/app/api/metadata/proof-of-skill/route.ts`
  - `web/app/api/metadata/pass/route.ts`
- **BullMQ queue** : `web/src/server/queue.ts`
- **Worker mint** : `web/src/workers/mintWorker.ts`
- **Tool Solana (UMI/Metaplex)** : `web/packages/agents/tools/solana.ts`
- **Prisma models** : `web/prisma/schema.prisma` (ex: `MintLog`)
- **Pass gating (on-chain)** : `web/src/lib/solana/checkPassOnChain.ts`

### Journeys (step/submit/progress) — orchestration runtime

- **Store UI** (state machine côté UI) : `journey-simulator/src/store/journeyStore.ts`
- **API wrapper (frontend)** : `journey-simulator/src/utils/api.ts`
- **Controller backend** : `mf-back/controllers/journey-controller.js`
- **Routes backend** : `mf-back/routes/journey-routes.js`
- **State machine backend** : `mf-back/services/journey-state-service.js`
- **Spec parcours** : `journey-simulator/src/data/personas.ts`

### Orchestration / Agents (Zyno, AgentFactory, logs, idempotence)

- **Zyno routes** : `mf-back/routes/zyno-routes.js`
- **Orchestrateur** : `mf-back/orchestration/zynoOrchestrator.js`
- **Agent factory (routing agent)** : `mf-back/agents/AgentFactory.js`
- **Idempotence key** : `mf-back/utils/agent-idempotence.js`
- **AEPO/AECO** :
  - Front : `journey-simulator/src/content/aepoAeco.ts`
  - Back : `mf-back/utils/aepoAeco.js`

### UI Blocks (contrat, renderer, interactions)

- **Types** : `journey-simulator/src/types/uiBlocks.ts`
- **Renderer** : `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`
- **Workspace** (Run Simulation, Complete, demo autoplay) : `journey-simulator/src/components/Journey/JourneyWorkspace.tsx`

### DAO (simulation gouvernance)

- **Backend routes** : `mf-back/routes/dao-routes.js`
- **Backend controller** : `mf-back/controllers/dao-controller.js`
- **UI page** : `journey-simulator/src/pages/Dao.tsx`
- **UI dashboard** : `journey-simulator/src/components/Dao/DaoDashboard.tsx`
- **Vote modal (phases gating)** : `journey-simulator/src/components/DAOVoteModal.tsx`

### RAG (documents, ingestion, query)

- **Backend routes** : `mf-back/routes/rag-routes.js`
- **Backend client** : `mf-back/rag/rag_client.js` (utilise `x-api-key` vers le service RAG si configuré)
- **Next routes (web)** :
  - `web/app/api/rag/doc/route.ts`
  - `web/app/api/rag/query/route.ts`
  - `web/app/api/rag/search/route.ts`
  - `web/app/api/rag/ingest/route.ts`
  - `web/app/api/rag/ingest-batch/route.ts`

### Observabilité (health/metrics/admin)

- **mf-back health routes** : `mf-back/routes/health-routes.js`
- **web health/metrics** :
  - `web/app/api/health/route.ts`
  - `web/app/api/healthz/route.ts`
  - `web/app/api/metrics/route.ts`
  - `web/src/server/metrics.ts`
- **Admin guard (x-api-key)** : `web/middleware.ts` (protège `/admin/*`)

### Exports (PDF/Notion) + outils internes

- **Backend exports** : `mf-back/routes/export-routes.js`
- **UI export** : `journey-simulator/src/components/Zyno/MissionFeedbackSummary.tsx`
- **Notion hook** : `journey-simulator/src/utils/sendToNotion.ts`

### Tests (unit + e2e)

- **E2E** : `journey-simulator/tests/e2e/*`
- **Mocks E2E** : `journey-simulator/tests/e2e/utils/journeyMocks.ts`
- **Unit (workspace)** : `journey-simulator/src/components/Journey/__tests__/*`
- **Backend tests** : `mf-back/__tests__/*` (si présent) + `npm test --prefix mf-back`

### Déploiement / infra (prod-local, docker, nginx)

- **Prod local** : `scripts/prod-local-up.sh`, `scripts/prod-local-down.sh`
- **Docker compose (dev)** : `docker-compose.yml`
- **Docker compose (deploy)** : `docker-compose.deploy.yml`
- **Deploy script** : `deploy.sh`
- **Nginx (simulator container)** : `journey-simulator/nginx.conf`
- **Verification prod** : `verify-production.sh`

## Annexes — Exemples concrets (LIVE) : URLs API + payloads `step/submit` (curl)

> Objectif : permettre à un dev/investisseur technique de **rejouer** les flows “Launch with Zyno” et “Validation” via HTTP, sans passer par l’UI.
>
> Domaine live : `https://journey.mfai.app`
> Préfixe API live : `https://journey.mfai.app/api`

### A) Identifiants “vrais” à utiliser

#### A.1 PersonaId (réel)

Les `personaId` réels (source `journey-simulator/src/data/personas.ts`) :

- `cognitive-activation-hub`
- `capital-foundry`
- `system-architect`
- `experience-studio`
- `impact-engine`
- `resilience-master`

#### A.2 JourneyId (réel et utilisable)

Dans l’implémentation actuelle, `journeyId` est un identifiant **côté client** (généré par `crypto.randomUUID()` dans `journey-simulator/src/store/journeyStore.ts`) et passé au backend dans l’URL :

- `POST /journey/<journeyId>/step`
- `POST /journey/<journeyId>/submit`

Donc, pour des tests API, vous pouvez utiliser un UUID réel :

```bash
JOURNEY_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"
echo "$JOURNEY_ID"
```

### B) Exemples d’URLs API live (concrets) + curl copy/paste

#### B.1 Step (Run Simulation) — non protégé (back-compat)

Exemple : lancer un step sur la phase 1 de `cognitive-activation-hub` :

```bash
BASE="https://journey.mfai.app/api"
JOURNEY_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"

curl -sS "$BASE/journey/$JOURNEY_ID/step" \
  -H "Content-Type: application/json" \
  -d '{
    "phaseId": "cognitive-orientation",
    "trackId": "cognitive-activation-hub",
    "userInput": "",
    "language": "en",
    "mode": "discovery",
    "tone": "pedagogical",
    "journeyState": { "xp": 0, "completed": [] }
  }' | jq .
```

#### B.2 Submit (Validation / Evaluation) — protégé, mais `demo-token` est accepté

Le middleware `protect` accepte explicitement `Authorization: Bearer demo-token` (voir `mf-back/middleware/auth.js`).
Cela permet de tester la validation sans compte DB.

Exemple : soumettre une mission “confirmation” et obtenir un `global_score` + `xp_awarded` :

```bash
BASE="https://journey.mfai.app/api"
JOURNEY_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"

curl -sS "$BASE/journey/$JOURNEY_ID/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token" \
  -d '{
    "missionId": "cognitive-orientation-mission",
    "inputType": "confirmation",
    "submission": "I confirm: completed the Web3 paradigm deep-dive and wrote my mission statement.",
    "language": "en",
    "mode": "discovery",
    "tone": "pedagogical",
    "trackId": "cognitive-activation-hub",
    "phaseId": "cognitive-orientation",
    "phaseNumber": 1,
    "journeyState": {
      "xp": 0,
      "totalXP": 0,
      "completed": [],
      "completedCount": 0,
      "nfts": [],
      "mfaiTokens": 0,
      "currentPhase": 1
    }
  }' | jq .
```

**Ce que vous devez voir** (résumé) :

- `evaluation.global_score` : note 0–10
- `xp_awarded` : \(round(global\_score \times 10)\)
- `progress.total_xp` : XP mis à jour (en mode demo : calculé depuis `journeyState`)

#### B.3 User progress (demo)

```bash
curl -sS "https://journey.mfai.app/api/journey/user-progress" \
  -H "Authorization: Bearer demo-token" | jq .
```

#### B.4 DAO (proposals + vote) — exemples live

Lister les proposals :

```bash
curl -sS "https://journey.mfai.app/api/dao/proposals" | jq .
```

Voter (exemple) :

```bash
PROPOSAL_ID="prop-1"
curl -sS "https://journey.mfai.app/api/dao/proposals/$PROPOSAL_ID/vote" \
  -H "Content-Type: application/json" \
  -d '{ "vote": "yes" }' | jq .
```

> NB : selon la config de l’environnement, certaines routes DAO peuvent être ouvertes (simulation) ou protégées.

### C) Payloads minimaux (référence)

#### C.1 Payload minimal `step`

```json
{
  "phaseId": "token-design-lab",
  "trackId": "cognitive-activation-hub",
  "userInput": "",
  "language": "en",
  "mode": "discovery",
  "tone": "pedagogical",
  "journeyState": { "xp": 140, "completed": [0, 1] }
}
```

#### C.2 Payload minimal `submit`

```json
{
  "missionId": "token-design-lab-mission",
  "submission": "Here is my token incentive map: ...",
  "inputType": "text",
  "trackId": "cognitive-activation-hub",
  "phaseId": "token-design-lab",
  "phaseNumber": 3,
  "language": "en",
  "mode": "discovery",
  "tone": "pedagogical",
  "journeyState": { "xp": 140, "completed": [0, 1] }
}
```

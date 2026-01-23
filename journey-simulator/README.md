![Coverage Badge](https://img.shields.io/badge/coverage-Jest-green?style=flat-square)

# Money Factory AI - Journey Simulator

**Auteurs** : Alaeddine BEN RHOUMA · Kamel BEN RHOUMA · Adem BELHAJAISSA

**A Web3-native platform implementing the Cognitive Activation Protocol™**

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/blockchain-Solana-9945FF.svg)](https://solana.com)
[![React](https://img.shields.io/badge/frontend-React-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://typescriptlang.org)

**🌐 Live Demo**: [mfai.app](https://mfai.app) | **📂 Repository**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)

---

## 📋 Table of Contents

- [Régénération des sections auto-générées](#regeneration)
- [Guide de lecture (réel vs simulation)](#guide-reel-vs-simulation)
- [Workflows utilisateurs (end-to-end)](#workflows-utilisateurs)
- [Zyno (orchestrateur) & Agents (backend)](#zyno-orchestrateur-agents)
- [Pipeline d’orchestration Zyno (LLM/RAG/exécution)](#pipeline-orchestration)
- [Inventaire complet des agents (généré)](#agents-registry)
- [RAG (Retrieval-Augmented Generation)](#rag)
- [API (contrats, endpoints, auth)](#api)
- [Données & bases (Postgres/Prisma)](#donnees-et-bases)
- [Scores AEPO / AECO / Alignment (ce qui est calculé)](#scores-aepo-aeco-alignment)
- [Mode Démo / Investor Mode (mock vs réel)](#mode-demo)
- [Modèle de parcours (Personas & Phases)](#modele-parcours)
- [Détail phase par phase (généré)](#detail-phase-par-phase)
- [Détail des steps par parcours (généré)](#detail-steps-par-parcours)
- [Index complet des fichiers (auto-généré)](#file-index)
- [API surface index (auto-généré)](#api-surface-index)
- [UI Blocks, ressources & documents](#ui-blocks)
- [UI Blocks renderer & interactions](#ui-blocks-renderer)
- [Frontend & affichages (pages principales)](#frontend-affichages)
- [Consoles & Debug (ZynoConsole, healthz/readyz, logs)](#debug-consoles)
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Blockchain Integration](#blockchain-integration)
- [User Interface](#user-interface)
- [Development Workflow](#development-workflow)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Money Factory AI (MFAI) Journey Simulator is a Web3-native platform that transforms users' skills into digital capital through the **Cognitive Activation Protocol™**. This protocol guides users through a structured 6-phase journey: Learn → Build → Prove → Activate → Scale → Launch (via Collaterize simulation).

The platform integrates:

- **AI Assistance** (Zyno AI Co-Founder™)
- **NFT Certifications** (Proof-of-Skill™)
- **Gamified XP Progression**
- **Token Economics** ($MFAI)
- **DAO Governance** (Synaptic Governance™)
- **Solana Blockchain Integration**

### Key Features

- 🎓 **6 Distinct User Personas** with tailored journeys
- 🏆 **NFT-based Skill Certification** on Solana
- 💰 **Token Staking & Rewards** system
- 🗳️ **DAO Governance** participation
- 🤖 **AI-powered Guidance** through Zyno
- 📱 **Responsive Design** for all devices
- 🔗 **Wallet Integration** with Phantom, Solflare, etc.

---

## 🔄 Régénération des sections auto-générées

<a id="regeneration"></a>

Certaines sections du README sont **auto-générées** à partir du code (pour éviter l’oubli et la dérive). Après modification des fichiers sources, régénère avec :

```bash
# Depuis journey-simulator/
npm run generate:readme

# Ou depuis la racine monorepo
node journey-simulator/scripts/update-readme-autogen.mjs
```

### Commandes de génération (une par bloc)

Si tu veux régénérer un seul bloc (ou automatiser en CI), voici les commandes **unitaires** :

```bash
# (1) Détail phase par phase (table personas/phases)
# - source: journey-simulator/src/data/personas.ts
npm run generate:phases-table
# ou (depuis la racine)
node journey-simulator/scripts/generate-phases-table.mjs

# (2) Détail des steps par parcours (demoSequencer)
# - source: journey-simulator/src/store/demoSequencer.ts
npm run generate:steps-by-journey
# ou (depuis la racine)
node journey-simulator/scripts/generate-steps-by-journey.mjs

# (3) Inventaire des agents (registry mf-back)
# - source: mf-back/src/agents/registry.js (+ extended)
npm run generate:agents-registry
# ou (depuis la racine)
node journey-simulator/scripts/generate-agents-registry.mjs

# (4) Index complet des fichiers (scan monorepo)
npm run generate:file-index
# ou (depuis la racine)
node journey-simulator/scripts/generate-file-index.mjs

# (5) API surface index (routes frontend + endpoints backend)
npm run generate:api-surface
# ou (depuis la racine)
node journey-simulator/scripts/generate-api-surface.mjs
```

Ce script met à jour automatiquement :

- **Détail phase par phase** (source: `src/data/personas.ts`) → `npm run generate:phases-table`
- **Détail des steps par parcours** (source: `src/store/demoSequencer.ts`) → `npm run generate:steps-by-journey`
- **Inventaire des agents** (source: `mf-back/src/agents/registry.js`) → `npm run generate:agents-registry`
- **Index complet des fichiers** (scan monorepo) → `npm run generate:file-index`
- **API surface index** (routes frontend + endpoints backend) → `npm run generate:api-surface`

---

## 🧭 Guide de lecture (réel vs simulation)

<a id="guide-reel-vs-simulation"></a>

Ce dépôt est un **monorepo full-stack**. Le dossier `journey-simulator/` (ce README) décrit surtout l’expérience **frontend** (React/Vite). Mais, dans la pratique, la plateforme s’appuie aussi sur :

- `mf-back/` : **API Express + Prisma/Postgres** + **orchestration multi-agents Zyno** + **RAG** (ingestion/retrieval) + endpoints admin.
- `web/` : une couche **web/Prisma/Postgres** utilisée par certains scripts/tests/CI (ex: table `MintLog`) et des services “site”.

### Carte “réel vs placeholder” (ce qui tourne réellement)

| Domaine | Réel (implémenté et utilisé) | Simulation / placeholder (MVP) |
|---|---|---|
| Auth | JWT + refresh token + endpoints `mf-back` (`/user/*`) ; **demo-login** via token local | Certaines valeurs user “demo” fictives (email, wallet, role) |
| Progression | Stockage côté backend (Prisma/Postgres selon stack) + état UI Zustand | En **mode démo**, persistence en `localStorage` (datastore mock) |
| Zyno / Agents | Orchestrateur backend (`mf-back/src/orchestration/zynoVerticalSlice.js`) + registry agents (`mf-back/src/agents/registry.js`) + logs | Certains “agents” peuvent retourner des textes/structures de démonstration selon config |
| RAG | Clients RAG (`mf-back/src/rag/ragClient.js` + `mf-back/src/orchestration/ragClient.js`) | Fallback local sur fichiers `.md/.txt` en cas d’échec réseau |
| UI Blocks | Renderer robuste (tolérant aux arrays manquants) + mapping `kind → composant` | Certaines briques/blocks sont “design-first” (contenu fictif selon la persona/phase) |
| Blockchain (Solana) | Wallet connect (adapters) + utilitaires | Beaucoup de “transactions” sont simulées en UI (selon le mode) |
| DAO / staking | UI + endpoints (selon stack) | Plusieurs métriques/retours peuvent être “mockés” pour démo investisseur |

### Fichiers “source de vérité” (à lire pour comprendre)

- **API + orchestration Zyno** : `mf-back/src/orchestration/zynoVerticalSlice.js`, `mf-back/src/orchestration/intentRouter.js`, `mf-back/src/agents/registry.js`
- **RAG** : `mf-back/src/rag/ragClient.js`, `mf-back/src/orchestration/ragClient.js`
- **Mode Démo (mock d’API)** : `journey-simulator/src/utils/api.ts`, `journey-simulator/src/contexts/AuthContext.tsx`, `journey-simulator/src/store/journeyStore.ts`
- **Scores / signaux** : `journey-simulator/src/utils/journeySignals.ts`, définitions `journey-simulator/src/content/aepoAeco.ts`
- **Contrats d’API typés** : `journey-simulator/src/api/mf-back-client.ts`

---

## 🔁 Workflows utilisateurs (end-to-end)

<a id="workflows-utilisateurs"></a>

Cette section décrit les parcours **réels** côté UI et les appels API typiques.

### 1) Visiteur (non authentifié)

1. Arrive sur l’app (routes publiques).
2. Va vers la page de login.
3. Choisit :
   - **Login email/password** (backend)
   - **Login wallet** (challenge + signature)
   - **Login démo** (local, sans backend pour la plupart des endpoints)

### 2) Utilisateur authentifié (standard)

1. `AuthContext` vérifie token/refresh puis appelle `GET /user/profile`.
2. L’app charge la progression : `GET /journey/user-progress`.
3. L’utilisateur choisit une **persona** (ou reprend son contexte).
4. Il exécute des étapes (missions, quiz, ressources, etc.).
5. Selon la phase, l’UI peut déclencher des actions “AI step / submit” (voir **API** plus bas).

### 3) Utilisateur en “Mode Démo” (investisseur / sandbox)

1. `AuthContext.loginAsDemo()` pose `accessToken=demo-token` en `localStorage`.
2. `journeyStore.setDemoMode(true)` initialise une persona de démo + reset du datastore.
3. Tous les appels API passent par `request()` :
   - Si `accessToken === 'demo-token'` alors l’API est **mockée**…
   - …sauf pour certaines routes IA (ex: `path.includes('/step') || path.includes('/submit')`) qui restent **réelles** pour pouvoir démontrer les agents.

### 4) Admin / opérateur (RAG & logs)

1. Upload de documents RAG (protégé par `ADMIN_API_KEY`) : `POST /admin/rag/upload` (si routes activées)
2. Lecture de documents : `GET /admin/rag/documents` (si routes activées)
3. Analyse d’orchestrations / logs agents : `GET /api/agents/*` + logs Prisma

---

## 🤖 Zyno (orchestrateur) & Agents (backend)

<a id="zyno-orchestrateur-agents"></a>

Cette section documente le **backend Zyno** : orchestration multi-agents, logique d’exécution, endpoints, et mécanismes d’audit (timeline/logs/mémoire) utilisés par l’UI et les consoles.

### Vue d’ensemble

Zyno est un orchestrateur multi-agents côté backend (`mf-back/src/orchestration`) qui :

1. **Valide/normalise** la requête (`ValidationService`, schémas vslice).
2. **Résout le contexte de parcours** (journey/phase, artefacts).
3. **Route les intentions** (intentRouter + workflowMap).
4. **Décide du RAG** et récupère des contextes si nécessaires.
5. **Exécute les agents** sélectionnés via LLM (pool d’agents).
6. **Synthétise** résultats, scores et actions.
7. **Prépare un plan d’exécution** (tools + gate) en dry-run par défaut.
8. **Journalise** (auditTrail/memory/metrics) pour observabilité.

### Endpoints exposés (backend)

- `POST /api/agents/interact` : interaction Zyno console (session-based).
- `GET /api/agents/types` / `GET /api/agents/session/:id` / `GET /api/agents/project/:id/sessions`.
- `POST /journey/load-demo` : bootstrap démo (backend).
- `GET /healthz` / `GET /readyz` / `GET /api/health`.
- **Attendus par le frontend** : `POST /journey/:id/step` et `POST /journey/:id/submit` (voir `journey-simulator/src/utils/api-modules/journey.ts`). Ces endpoints sont fournis par l’orchestrateur en environnement complet ; en local, le simulateur bascule souvent en mode démo.

### Logs & mémoire (in-memory + Prisma)

- **Orchestration vslice** : `auditTrailStore`, `memoryStore`, `metricsStore` (in-memory, TTL).
- **Sessions agents** : `AgentMemoryService` (Prisma/Postgres) stocke messages, états et logs d’actions.

### AEPO “backend” (important : définition MVP)

Dans `mf-back`, “AEPO” apparaît aussi comme **signal d’exécution par agent** :

- Il est calculé à partir de `durationMs / success / retries` dans l’orchestrateur,
- puis sauvegardé via `saveMetric(agentName, userId, 'AEPO', metricPayload, missionId)`.

Ce “AEPO backend” est donc **une métrique qualité d’exécution** (MVP), à ne pas confondre avec la couche “AEPO/AECO” présentée au niveau produit (roadmap solo vs cohort).

### Pipeline d’orchestration Zyno (LLM/RAG/exécution)

<a id="pipeline-orchestration"></a>

Flux réel (voir `mf-back/src/orchestration/zynoVerticalSlice.js`) :

1. **Init & validation** : normalisation, warnings, presets, `ops` runtime.
2. **Mode** : `demo` / `simulation` / `real` via `inferRequestedMode()`.
3. **Sécurité & circuit breakers** : `secretsPolicy`, `circuitBreaker` (LLM/RAG).
4. **Concurrency** : `concurrencyManager.acquire()` + load-shedding.
5. **Intents** : combine `req.intent` + `workflowMap` (journeyType/phase), dédupe & ordre par priorité.
6. **Sélection agents** : registry + overrides `AGENT_*_ENABLED`.
7. **RAG** : `ragService` → remote si autorisé, fallback local / disabled si nécessaire.
8. **LLM run** : exécution agent pool, budget/tokens/timeouts (`BUDGETS` par env).
9. **Scoring & synthèse** : `LogicCheckService`, `scoringService`, action plan dédupliqué.
10. **Execution plan** : mapping actions → tools (`actionToolMapper` + `toolsRegistry`).
11. **Execution gate** : `executionGate` (HITL) + `executionEngine` (DRY_RUN/REAL/SHADOW).
12. **Persist & audit** : `metricsStore`, `auditTrailStore`, `memoryStore`, `artifactStore`.

### Contrat d’agent (interface)

Source: `mf-back/src/agents/agentContract.js` (contrat canonique).

- **Input normalisé** : `traceId`, `runId`, `intentNormalized`, `input`, `ragContext`, `constraints`.
- **Output** : `{ agentId, status, summary, details?, actions?, citations?, metrics?, errors? }`.
- **Statuts** : `OK | WARN | FAIL | TIMEOUT` (utilisés dans le scoring).

### LLM clients (backend)

- **LLMClient orchestration** : `mf-back/src/orchestration/llmClient.js` (cache, mock si pas de clé, support `OPENAI_API_KEY`).
- **OpenAIClient (TS)** : `mf-back/src/llm/OpenAIClient.ts` (utilisé par `BaseAgent.ts` et `agent.controller`).

### Inventaire complet des agents (généré)

<a id="agents-registry"></a>

Source: `mf-back/src/agents/registry.js` (+ `mf-back/src/agents/extended/registry-extra.js`).

> Note : la registry concatène `core` + `extended` puis trie par priorité sans déduplication. `registryIndex` utilise la **dernière** occurrence d’un `agentId` si doublon.

<!-- BEGIN AUTO-GENERATED: agents-registry -->
| Agent ID | Domain | Intents | Capabilities | requiresRag | enabled | priority | model | maxTokens | timeoutMs |
|---|---|---|---|---:|---:|---:|---|---:|---:|
| `GuideAgent` | cognitive | `guide`, `help` | `orientation`, `help` | false | true | 99 | gpt-4o | 600 | 6000 |
| `EducationAgent` | cognitive | `education`, `explain` | `teaching`, `explaining` | false | true | 98 | gpt-4o | 600 | 6000 |
| `ReflectionAgent` | cognitive | `reflection` | `analysis`, `meta` | false | true | 97 | gpt-4o | 600 | 6000 |
| `CoachAgent` | cognitive | `coach` | `strategy`, `advice` | true | true | 96 | gpt-4o | 600 | 6000 |
| `SecurityAuditAgent` | security | `security_audit`, `default` | `audit`, `risk`, `compliance` | true | true | 95 | gpt-4o | 600 | 6000 |
| `AuditAgent` | audit | `audit` | `code_quality`, `security` | true | true | 94 | gpt-4o | 600 | 6000 |
| `SecurityAgent` | security | `security_attack` | `red_team`, `exploits` | true | true | 94 | gpt-4o | 600 | 6000 |
| `ProductSpecAgent` | product | `product_spec`, `default` | `spec`, `flows`, `acceptance` | true | true | 90 | gpt-4o | 600 | 6000 |
| `ProductAgent` | product | `product` | `discovery`, `strategy` | false | true | 89 | gpt-4o | 600 | 6000 |
| `BuilderAgent` | architecture | `builder`, `architecture` | `system_design`, `stack` | true | true | 89 | gpt-4o | 600 | 6000 |
| `JourneyDesignAgent` | journey | `journey_design` | `design`, `mapping` | false | true | 88 | gpt-4o | 600 | 6000 |
| `ProtocolAgent` | protocol | `protocol`, `standards` | `standards`, `token_2022` | true | true | 88 | gpt-4o | 600 | 6000 |
| `DevAgent` | development | `dev`, `code` | `code`, `implementation` | false | true | 88 | gpt-4o | 600 | 6000 |
| `EvaluationAgent` | quality | `evaluation` | `evaluation`, `rubric` | false | true | 87 | gpt-4o | 600 | 6000 |
| `RAGOpsAgent` | rag | `rag_ops` | `ingest`, `search` | false | true | 86 | gpt-4o | 600 | 6000 |
| `DataIntegrityAgent` | data | `data_integrity` | `integrity`, `validation` | false | true | 85 | gpt-4o | 600 | 6000 |
| `OnboardingAgent` | ux | `onboarding` | `onboarding`, `flows` | false | true | 85 | gpt-4o | 600 | 6000 |
| `DesignAgent` | design | `design`, `visuals` | `visuals`, `ux` | false | true | 85 | gpt-4o | 600 | 6000 |
| `APIContractAgent` | api | `api_contract` | `contracts`, `schemas` | false | true | 84 | gpt-4o | 600 | 6000 |
| `TokenAgent` | tokenomics | `token_design` | `utility`, `mapping` | false | true | 84 | gpt-4o | 600 | 6000 |
| `NFTAgent` | nft | `nft_design` | `metadata`, `strategy` | false | true | 84 | gpt-4o | 600 | 6000 |
| `DAOAgent` | dao | `dao_tooling` | `tooling`, `structure` | false | true | 84 | gpt-4o | 600 | 6000 |
| `TokenomicsAgent` | tokenomics | `tokenomics` | `economy`, `supply` | false | true | 83 | gpt-4o | 600 | 6000 |
| `Web3LegalAgent` | legal | `legal` | `legal`, `mica` | true | true | 83 | gpt-4o | 600 | 6000 |
| `GovernanceDAOAgent` | governance | `governance_dao` | `dao`, `voting` | true | true | 82 | gpt-4o | 600 | 6000 |
| `PitchAgent` | investor | `pitch` | `pitch`, `deck` | false | true | 82 | gpt-4o | 600 | 6000 |
| `GrowthAgent` | growth | `growth` | `growth`, `marketing` | false | true | 81 | gpt-4o | 600 | 6000 |
| `GovernanceAgent` | governance | `governance` | `strategy`, `policy` | false | true | 81 | gpt-4o | 600 | 6000 |
| `InvestorDemoAgent` | investor | `investor_demo` | `demo`, `pitch` | false | true | 80 | gpt-4o | 600 | 6000 |
| `CommunityAgent` | growth | `community` | `community`, `engagement` | false | true | 80 | gpt-4o | 600 | 6000 |
| `InvestorAgent` | investor | `investor_fundraise` | `fundraise`, `pitch` | false | true | 79 | gpt-4o | 600 | 6000 |
| `UXWritingAgent` | ux | `ux_writing` | `ux_writing` | true | true | 79 | gpt-4o | 600 | 6000 |
| `QAPlaywrightAgent` | qa | `qa_playwright` | `e2e`, `playwright` | false | true | 78 | gpt-4o | 600 | 6000 |
| `LaunchpadAgent` | investor | `launchpad` | `incubation`, `launch` | false | true | 78 | gpt-4o | 600 | 6000 |
| `DevOpsAgent` | devops | `devops` | `ci_cd`, `infra` | false | true | 77 | gpt-4o | 600 | 6000 |
| `ObservabilityAgent` | observability | `observability` | `logs`, `metrics`, `tracing` | false | true | 76 | gpt-4o | 600 | 6000 |
| `ComplianceAgent` | compliance | `compliance` | `policy`, `regulation` | true | true | 75 | gpt-4o | 600 | 6000 |
| `RiskFraudAgent` | risk | `risk_fraud` | `fraud`, `risk` | true | false | 74 | gpt-4o | 600 | 6000 |
| `CurriculumAgent` | education | `curriculum` | `curriculum`, `learning_path` | false | true | 73 | gpt-4o | 600 | 6000 |
| `MarketplaceAgent` | marketplace | `marketplace` | `listing`, `pricing` | false | true | 72 | gpt-4o | 600 | 6000 |
| `AnalyticsAgent` | analytics | `analytics` | `analytics`, `insights` | false | true | 71 | gpt-4o | 600 | 6000 |
| `PerformanceAgent` | performance | `performance` | `perf`, `optimization` | false | true | 70 | gpt-4o | 600 | 6000 |
| `WalletAuthAgent` | auth | `wallet_auth` | `wallet`, `auth` | false | true | 69 | gpt-4o | 600 | 6000 |
| `SolanaAnchorAgent` | blockchain | `solana_anchor` | `anchor`, `solana` | false | true | 68 | gpt-4o | 600 | 6000 |
| `MintingAgent` | mint | `minting` | `mint`, `nft` | false | true | 67 | gpt-4o | 600 | 6000 |
<!-- END AUTO-GENERATED: agents-registry -->



---

## 📚 RAG (Retrieval-Augmented Generation)

<a id="rag"></a>

Le RAG est implémenté côté backend (`mf-back`) via **deux clients** (orchestration vs agents) + fallback local.

### Composants

- **Client agents (legacy + BaseAgent)** : `mf-back/src/rag/ragClient.js`
  - `getRagSnippets(...)` : recherche des extraits (snippets) pour enrichir le contexte agent/LLM
  - `ingestDocument(...)` / `ingestDocumentsIfNeeded(...)` : ingestion
- **Client orchestration** : `mf-back/src/orchestration/ragClient.js`
  - `search(...)` : recherche concise de contextes, attachée à `zynoVerticalSlice`
- **Routes admin** : (si activées) `mf-back/src/routes` + contrôleurs RAG (upload/liste)
  - `POST /admin/rag/upload` (upload d’un document ; nécessite `ADMIN_API_KEY`)
  - `GET /admin/rag/documents` (liste)

### Variables d’environnement (backend)

- `RAG_BASE_URL` (défaut: `http://localhost:8000`)
- `RAG_SEARCH_URL` (défaut: `${RAG_BASE_URL}/kb/search`)
- `RAG_INGEST_URL` (défaut: `${RAG_BASE_URL}/kb/ingest`)
- `RAG_API_KEY` (clé d’accès au service RAG)
- `RAG_COLLECTION` (défaut: `mfai-knowledge`)
- `RAG_DATA_PATH` (fallback local, défaut: `mf-back/src/data/rag-documents`)
- `RAG_MAX_TOPK` (cap des résultats, défaut: `10`)
- `STRICT_RAG_MODE=true` (désactive le fallback local)
- `ADMIN_API_KEY` (protection upload admin)

> Note : le repo contient aussi `mf-back/data/rag-documents` (hors `src/`). Si tu veux réutiliser ces fichiers, configure `RAG_DATA_PATH` explicitement.

### Fallback (quand le RAG distant est indisponible)

Si la recherche HTTP échoue, le backend lit des fichiers `.md/.txt` depuis `RAG_DATA_PATH` et renvoie des “snippets” de secours. En `demo mode`, l’orchestrateur force un RAG local (chunks vides) pour éviter la dépendance réseau.

### Interaction RAG ↔ LLM ↔ Agents

- **Orchestration** : `ragService` décide d’activer le RAG selon `requiresRag` des agents sélectionnés ; les snippets sont injectés dans le prompt.
- **Agents BaseAgent** : `getRagSnippets()` alimente `ragContext` et est concaténé dans le prompt utilisateur (domain = `trackId`).
- **LLM** : `LLMClient` (orchestration) et `OpenAIClient` (TS) gèrent cache, mock, et timeouts.

---

## 🔌 API (contrats, endpoints, auth)

<a id="api"></a>

Ici, on décrit le **contrat d’intégration** entre le frontend et `mf-back` : base URL, endpoints critiques, conventions (ex: pas de suffixe `/api`), et where-to-look pour les types générés.

### Base URL (frontend)

Le frontend utilise `API_BASE_URL` (voir `journey-simulator/src/utils/api.ts`). Important : c’est **la racine**, sans suffixe `/api`, car l’app appelle directement :

- `/journey/*`
- `/user/*`
- `/dao/*`

Le code normalise l’URL si quelqu’un met “.../api” par habitude.

### Endpoints utilisés côté UI (exemples)

Auth & profil :

- `POST /user/login`
- `POST /user/register`
- `POST /user/logout`
- `POST /user/refresh`
- `GET /user/profile`
- `PUT /user/update-profile`
- `POST /user/wallet-challenge`
- `POST /user/login-wallet`

Progression :

- `GET /journey/user-progress`
- `PUT /journey/user-progress`
- `POST /journey/reset-progress`

IA / exécution de steps :

- l’app traite certaines routes “step/submit” comme **appels IA réels même en mode démo** (voir `executeDemoRequest` dans `journey-simulator/src/utils/api-modules/base.ts`).

Zyno Console / agents :

- `POST /api/agents/interact`
- `GET /api/agents/types`
- `GET /api/agents/session/:sessionId`

### Contrats typés (recommandé pour audit)

- `journey-simulator/src/api/mf-back-client.ts` : définitions OpenAPI-like (paths/components)
- `journey-simulator/src/api/mf-back.ts` : quelques wrappers (`journey.getUserProgress`, `agents.listRuns`, …)

---

## 🗄️ Données & bases (Postgres/Prisma)

<a id="donnees-et-bases"></a>

Cette section clarifie **où vivent les données** selon les sous-systèmes (agents vs autres modules du monorepo).

### Postgres/Prisma (stack principale agents)

`mf-back` s’appuie sur Prisma/Postgres pour :

- sessions d’agents & mémoire (`AgentMemoryService`)
- logs d’actions agents (`agentLog`)
- entités `project/user` nécessaires aux interactions `/api/agents/*`

### Postgres/Prisma (autres modules / CI)

Le dossier `web/` est une autre application avec Prisma/Postgres (ex: table `MintLog` mentionnée dans CI). Cette DB n’est **pas** le stockage principal des journeys du simulateur, mais elle fait partie de l’écosystème monorepo.

---

## 📈 Scores AEPO / AECO / Alignment (ce qui est calculé)

<a id="scores-aepo-aeco-alignment"></a>

On sépare ici les **définitions produit** (glossaire AEPO/AECO) du **calcul réel** effectué dans l’UI (signaux d’affichage), et on explicite les hypothèses/normalisations.

### Définitions produit (frontend)

Le repo expose des définitions pédagogiques :

- `journey-simulator/src/content/aepoAeco.ts` : définitions et “devNotes”
  - **AEPO** : orchestration du parcours individuel
  - **AECO** : orchestration cohorte / groupe

### Calcul réel (UI signals)

Le frontend calcule des **signaux de score** (UI/UX, pas “finance-grade”) dans :

- `journey-simulator/src/utils/journeySignals.ts`

Logique (résumé) :

- Normalisation XP, ratio de complétion, facteurs DAO (proposals/votingPower)
- Ajout sur une base (ex: aepoBase=58) puis clamp \([35..99]\)

Ces scores servent surtout à :

- afficher des indicateurs (dashboards, sidebars)
- donner une “lecture” progression (investor-friendly)

---

## 🧪 Mode Démo / Investor Mode (mock vs réel)

<a id="mode-demo"></a>

Le mode démo est un **mode d’exécution hybride** : la majorité des endpoints sont mockés côté frontend, mais certaines routes IA restent réelles pour permettre une démonstration “agents + orchestration”.

### Déclenchement

- `AuthContext.loginAsDemo()` force un utilisateur “demo” et pose `accessToken=demo-token`.
- `journeyStore.setDemoMode(true)` initialise la persona par défaut + reset du mock DB.

### Mock d’API

Dans `journey-simulator/src/utils/api.ts`, `request()` :

- **Mocke** des endpoints (ex: `/user/profile`, `/journey/user-progress`, etc.) si `accessToken === 'demo-token'`
- **Laisse passer** des appels IA (paths contenant `/step` ou `/submit`) pour garder la démo agents vivante.

### Persistence (démo)

Le mode démo stocke un “mini-dataset” en `localStorage` (clé `demo_mock_db`) : XP, tokens, phases complétées, “NFTs” fictifs.

### Mécanisme technique (frontend)

- **Run mode** : `journeyStore.setRunMode()` persiste `mfai-run-mode` (demo/simulation/real) et envoie `x-run-mode` au backend.
- **Tokens démo** : `accessToken=demo-token` + `refresh=demo-refresh-token` (fournis par `DemoStateManager`).
- **Mock API** : `executeDemoRequest()` intercepte les requêtes non-AI ; la DB mock est gérée par `DemoStateManager` (`demo_mock_db`, `demo_active_persona`).
- **Séquenceur** : `demoSequencer.ts` génère les steps ; `startDemoPhase()` + `tickDemo()` jouent le scénario par phase.
- **Interactions** : si un block est interactif (mission, quiz, bonding curve, launchpad), le demo passe en `WAITING_FOR_INTERACTION` et attend `submitDemoInteraction()`.

---

## 🧬 Modèle de parcours (Personas & Phases)

<a id="modele-parcours"></a>

Les parcours sont **data-driven** : ils sont définis dans `journey-simulator/src/data/personas.ts` (tableau `personas`).

### Structure d’une Persona (vue développeur)

Chaque persona contient notamment :

- `id` : identifiant stable (ex: `cognitive-activation-hub`)
- `title`, `description`, `targetProfile`, `motivation`, `passType`
- `phases[]` : la liste ordonnée des phases

### Structure d’une Phase

Chaque phase (ex: `id: 'launch-collaterize'`) décrit :

- **Narratif/UX** : `title`, `description`, `mission`, `duration`, `zynoTip`
- **Récompenses** : `xpReward`, `mfaiReward`, `nftReward`
- **Outils & outcomes** : `tools[]`, `outcomes[]`
- **Gating (si présent)** :
  - `stakingRequired` : montant de staking requis (UI/UX et logique d’accès)
  - `daoVoteRequired` : indique qu’un vote/activité DAO est attendu

### “Launch via Collaterize” (phase de simulation)

Certaines personas incluent une phase `launch-collaterize` qui déclenche une simulation de lancement. Les résultats sont modélisés via :

- `CollaterizeSimulation` dans `journey-simulator/src/store/journeyStore.ts`

Elle contient notamment : `eligibilityScore`, `tier`, `targetRaiseUSD`, `liquidityUSD`, et un `simulatedLaunchUrl`.

---

## 📚 Détail phase par phase (généré)

<a id="detail-phase-par-phase"></a>

Cette section est **auto-générée** à partir de `src/data/personas.ts` pour documenter chaque phase sans duplication manuelle.

- **Générateur** : `journey-simulator/scripts/generate-phases-table.mjs`
- **Commande** :

```bash
node journey-simulator/scripts/generate-phases-table.mjs
```

<!-- BEGIN AUTO-GENERATED: phases-table -->

> Ce tableau est généré automatiquement depuis `src/data/personas.ts`.

Commande: `node journey-simulator/scripts/generate-phases-table.mjs`

### Persona: The Cognitive Activation Hub (`cognitive-activation-hub`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `cognitive-orientation` | Cognition Ignition | Complete the Web3 paradigm deep-dive, map legacy vs. decentralized architecture, and articulate your mission statement. | 60 | 6 | Proof-of-Skill: Web3 Orientation | — | — |
2 | `solana-fluency` | Solana Systems Lab | Complete validator walk-throughs, inspect transaction flows, and prototype a Solana interaction in the playground. | 80 | 8 | Solana Fluency Patch | 50 | — |
3 | `token-design-lab` | Token Design Studio | Model a token incentive map, stress-test governance edge cases, and publish a protocol impact canvas. | 90 | 9 | Tokenomics Architect Badge | — | ✅ |
4 | `identity-proofing` | Identity & Security Forge | Harden your wallet stack, evaluate custody trade-offs, and design a DeID onboarding flow. | 100 | 10 | Sovereign Identity Seal | — | — |
5 | `ecosystem-engagement` | Ecosystem Activation | Ship a community contribution, present your activation brief to peers, and initiate DAO participation. | 120 | 12 | Proof-of-Skill: Activation | — | — |
6 | `launch-collaterize` | Launch via Collaterize | Run the Collaterize simulation, analyze your eligibility score, and review the launch plan. | 200 | 20 | Collaterize Launch Badge | — | — |

### Persona: The Capital Foundry (`capital-foundry`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `capital-discovery` | Protocol Discovery Sprint | Benchmark leading Solana protocols, analyze composability patterns, and publish an opportunity matrix. | 80 | 8 | DeFi Recon Marker | — | — |
2 | `program-forge` | Program Forge Lab | Ship a core lending or AMM module, integrate deterministic tests, and validate with fuzzing harnesses. | 110 | 11 | Anchor Mastery Crest | — | — |
3 | `oracle-integration` | Oracle & Liquidity Mesh | Integrate oracle feeds, simulate liquidity shocks, and design cross-chain contingency flows. | 120 | 12 | Liquidity Architect Token | — | — |
4 | `risk-command` | Risk Command Center | Define circuit breakers, craft adaptive fee policies, and build DAO-ready reporting dashboards. | 130 | 13 | Proof-of-Yield Sentinel | 75 | — |
5 | `capital-launchpad` | Launch & Scale Deck | Complete economic audit, pitch to Sovereign Builders Network, and finalize Synaptic DAO deployment vote. | 150 | 15 | Neuro-Dividend Initiator | — | ✅ |
6 | `launch-collaterize` | Launch via Collaterize | Run the Collaterize simulation, analyze your eligibility score, and review the launch plan. | 200 | 20 | Collaterize Launch Badge | — | — |

### Persona: The System Architect (`system-architect`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `architecture-scan` | Topology Reconnaissance | Audit core Solana infra, benchmark DePIN exemplars, and draft your architectural intent canvas. | 90 | 9 | Systems Scout Sigil | — | — |
2 | `depin-studio` | DePIN Studio | Design device onboarding kit, simulate supply/demand incentives, and plan data validation pipelines. | 120 | 12 | DePIN Architect Token | 90 | — |
3 | `onchain-ai` | On-Chain Intelligence Lab | Deploy verifiable inference pipeline, design data provenance ledger, and implement privacy-preserving analytics. | 130 | 13 | AI Provenance Seal | — | — |
4 | `systems-hardening` | Systems Hardening Forge | Implement multi-region rollout plan, stress test consensus edges, and deploy observability dashboards. | 140 | 14 | Reliability Vanguard Patch | — | — |
5 | `synaptic-rollout` | Synaptic Rollout | Secure Synaptic Governance alignment, run guardian dry runs, and launch a public builder readiness kit. | 160 | 16 | Protocol Architect Laureate | — | ✅ |
6 | `launch-collaterize` | Launch via Collaterize | Run the Collaterize simulation, analyze your eligibility score, and review the launch plan. | 200 | 20 | Collaterize Launch Badge | — | — |

### Persona: The Experience Studio (`experience-studio`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `experience-discovery` | Experience Discovery | Run narrative interviews, map player motivations, and craft an experience compass for your concept. | 70 | 7 | Experience Strategist Pin | — | — |
2 | `nft-systems-lab` | NFT Systems Lab | Prototype collection logic, configure royalty routing, and test dynamic metadata automations. | 100 | 10 | Metaplex Creator Crest | — | — |
3 | `gameplay-lab` | Gameplay & Mechanics Forge | Implement wallet-aware UX, simulate token rewards, and design anti-abuse safeguards. | 120 | 12 | Gameplay Architect Badge | — | — |
4 | `ux-elevation` | UX Elevation Studio | Conduct usability labs, ship onboarding prototypes, and publish accessibility scorecards. | 130 | 13 | UX Maestro Token | — | — |
5 | `experience-launch` | Launch & Community Resonance | Run live mint or release event, activate Sovereign Builders partners, and ship a community care plan. | 150 | 15 | Cultural Impact Seal | — | — |
6 | `launch-collaterize` | Launch via Collaterize | Run the Collaterize simulation, analyze your eligibility score, and review the launch plan. | 200 | 20 | Collaterize Launch Badge | — | — |

### Persona: The Impact Engine (`impact-engine`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `impact-charter` | Mission Charter Lab | Draft an impact thesis, map stakeholder incentives, and codify guiding principles. | 75 | 7 | Purpose Architect Token | — | — |
2 | `dao-design` | DAO Design Workshop | Prototype DAO constitution, test voting simulations, and model contribution-based rewards. | 110 | 11 | Synaptic Governance Badge | — | — |
3 | `philanthropy-protocols` | Transparent Funding Protocols | Implement transparent treasury dashboards, launch grant proposal flows, and publish impact metrics. | 125 | 12 | Public Goods Laureate | — | — |
4 | `identity-reputation` | Identity & Reputation Mesh | Design soulbound credentials, integrate reputation oracles, and set moderation pathways. | 135 | 13 | Social Proof Seal | — | — |
5 | `synaptic-impact` | Synaptic Impact Launch | Present to Synaptic Governance, initiate Neuro-Dividend rewards, and launch a community impact sprint. | 150 | 15 | Impact Engine Proof | — | ✅ |
6 | `launch-collaterize` | Launch via Collaterize | Run the Collaterize simulation, analyze your eligibility score, and review the launch plan. | 200 | 20 | Collaterize Launch Badge | — | — |

### Persona: The Resilience Master (`resilience-master`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `security-baseline` | Security Baseline Forge | Complete Solana-specific threat model, deconstruct historical exploits, and assemble secure coding checklist. | 90 | 9 | Guardian Initiate Emblem | — | — |
2 | `exploit-hunt` | Exploit Hunter Arena | Run fuzzing gauntlets, craft exploit proofs-of-concept, and document responsible disclosure paths. | 120 | 12 | Offense-Informed Shield | — | — |
3 | `defense-systems` | Defense Systems Orchestrator | Implement guardian agents, configure circuit breakers, and deploy anomaly detection monitors. | 130 | 13 | Protocol Shield Token | — | — |
4 | `incident-response` | On-Chain Incident Command | Conduct on-chain forensic exercises, design comms templates, and coordinate with MFAI guardian network. | 140 | 14 | Forensic Vanguard Badge | — | — |
5 | `redblue-evolution` | Red/Blue Evolution | Lead live incident simulations, publish monthly threat intel, and activate Neuro-Dividends for vulnerability burns. | 170 | 17 | Resilience Master Seal | — | — |
6 | `launch-collaterize` | Launch via Collaterize | Run the Collaterize simulation, analyze your eligibility score, and review the launch plan. | 200 | 20 | Collaterize Launch Badge | — | — |

### Persona: E2E Test Persona (`e2e-persona`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `discovery` | Discovery | Analyze market trends | 10 | 1 | Test NFT 1 | — | — |
2 | `strategy` | Strategy | Strategize | 10 | 1 | Test NFT 2 | — | — |
3 | `plan` | Plan Generation | Plan | 10 | 1 | Test NFT 3 | — | — |

<!-- END AUTO-GENERATED: phases-table -->



---

## 🧩 Détail des steps par parcours (généré)

<a id="detail-steps-par-parcours"></a>

Ce bloc est généré depuis `journey-simulator/src/store/demoSequencer.ts` (séquences) et `journey-simulator/src/data/personas.ts` (personas). Il documente **les étapes réellement jouées en mode démo** (ordre, UI blocks, agent actions). En mode réel, ces steps sont produits par l’orchestrateur via `/journey/:id/step`.

> Note : les `agent_actions` du séquenceur démo sont des **labels UX** et ne correspondent pas toujours à un agent backend enregistré (ex: `FinanceAgent`, `RiskAgent`, `CollaterizeAgent`).

<!-- BEGIN AUTO-GENERATED: steps-by-journey -->
### Persona: The Cognitive Activation Hub (`cognitive-activation-hub`)

#### Phase: `cognitive-orientation`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Neural Handshake: Initiation | Establish cryptographic sovereignty with Ed25519 signature | `text_block`, `resource_block` | `GuideAgent`
2 | Wallet Connection & Ed25519 Init | Connect wallet and complete signature challenge | `mission_block`, `checklist_block` | `Web3LegalAgent`

#### Phase: `solana-fluency`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Memory Forge: PDA Introduction | Understanding Program Derived Addresses | `text_block`, `diagram_block` | `HubAgent`
2 | PDA Canonical Bump Search | Derive canonical bump seed for program-derived address | `mission_block`, `resource_block`, `checklist_block` | `HubAgent`

#### Phase: `token-design-lab`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Parallel Logic: Sealevel Runtime | Optimize execution via account locking | `text_block`, `indicator_block` | `HubAgent`
2 | Sealevel Optimization Simulation | Reorder instructions to minimize contention | `mission_block`, `resource_block` | `HubAgent`

#### Phase: `identity-proofing`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Hub Graduation: Final Assessment | Defend your architectural choices | `text_block`, `mission_block`, `evaluation_block` | `ZynoAgent`

#### Phase: `ecosystem-engagement`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Ecosystem Activation: Apply Your Knowledge | Convert insight into real-world contributions | `text_block`, `resource_block` | `CommunityAgent`
2 | Ship Your Activation Brief | Document and present your contribution plan | `mission_block`, `checklist_block`, `action_suggestions_block` | `CommunityAgent`
3 | DAO Governance Initiation | Participate in decentralized governance | `text_block`, `mission_block` | `GovernanceAgent`

#### Phase: `launch-collaterize`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch Simulation: Introduction | Understand the Collaterize launch platform | `text_block`, `diagram_block` | `CollaterizeAgent`
2 | Run Collaterize Simulation | Execute comprehensive launch assessment | `mission_block`, `checklist_block`, `indicator_block` | `CollaterizeAgent`
3 | Launch Assessment Results | Review eligibility score and launch plan | `evaluation_block`, `text_block`, `resource_block` | `ZynoAgent`


### Persona: The Capital Foundry (`capital-foundry`)

#### Phase: `capital-discovery`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | DeFi Landscape Analysis | Audit Solana DeFi protocols and identify opportunities | `text_block`, `resource_block`, `mission_block` | `FinanceAgent`

#### Phase: `program-forge`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Program Forge Lab | Build Solana programs with Anchor | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `oracle-integration`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Oracle & Liquidity Mesh | Integrate oracle feeds | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `risk-command`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Risk Command Center | Operationalize risk analytics with staking commitment | `text_block`, `bonding_curve_block`, `mission_block` | `RiskAgent`

#### Phase: `capital-launchpad`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch & Scale Deck | Prepare for production | `text_block`, `dao_dashboard_block`, `mission_block` | `GovernanceAgent`

#### Phase: `launch-collaterize`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch Simulation: Introduction | Understand the Collaterize launch platform | `text_block`, `diagram_block` | `CollaterizeAgent`
2 | Run Collaterize Simulation | Execute comprehensive launch assessment | `mission_block`, `checklist_block`, `indicator_block` | `CollaterizeAgent`
3 | Launch Assessment Results | Review eligibility score and launch plan | `evaluation_block`, `text_block`, `resource_block` | `ZynoAgent`


### Persona: The System Architect (`system-architect`)

#### Phase: `architecture-scan`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Topology Reconnaissance | Map decentralized infrastructure | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `depin-studio`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | DePIN Studio | Prototype decentralized physical infrastructure | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `onchain-ai`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | On-Chain Intelligence Lab | Fuse AI with verifiable execution | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `systems-hardening`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Systems Hardening Forge | Strengthen infrastructure | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `synaptic-rollout`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Synaptic Rollout | Orchestrate deployment | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `launch-collaterize`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch Simulation: Introduction | Understand the Collaterize launch platform | `text_block`, `diagram_block` | `CollaterizeAgent`
2 | Run Collaterize Simulation | Execute comprehensive launch assessment | `mission_block`, `checklist_block`, `indicator_block` | `CollaterizeAgent`
3 | Launch Assessment Results | Review eligibility score and launch plan | `evaluation_block`, `text_block`, `resource_block` | `ZynoAgent`


### Persona: The Experience Studio (`experience-studio`)

#### Phase: `experience-discovery`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Experience Discovery | Research cultural signals | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `nft-systems-lab`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | NFT Systems Lab | Engineer NFT economies | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `gameplay-lab`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Gameplay & Mechanics Forge | Integrate tokenized mechanics | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `ux-elevation`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | UX Elevation Studio | Polish interface flows | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `experience-launch`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch & Community Resonance | Deliver your experience | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `launch-collaterize`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch Simulation: Introduction | Understand the Collaterize launch platform | `text_block`, `diagram_block` | `CollaterizeAgent`
2 | Run Collaterize Simulation | Execute comprehensive launch assessment | `mission_block`, `checklist_block`, `indicator_block` | `CollaterizeAgent`
3 | Launch Assessment Results | Review eligibility score and launch plan | `evaluation_block`, `text_block`, `resource_block` | `ZynoAgent`


### Persona: The Impact Engine (`impact-engine`)

#### Phase: `impact-charter`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Mission Charter Lab | Define purpose and stakeholders | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `dao-design`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | DAO Design Workshop | Engineer equitable governance | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `philanthropy-protocols`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Transparent Funding Protocols | Construct philanthropy flows | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `identity-reputation`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Identity & Reputation Mesh | Deploy token-gated participation | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `synaptic-impact`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Synaptic Impact Launch | Activate your DAO | `text_block`, `dao_dashboard_block`, `mission_block` | `GovernanceAgent`

#### Phase: `launch-collaterize`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch Simulation: Introduction | Understand the Collaterize launch platform | `text_block`, `diagram_block` | `CollaterizeAgent`
2 | Run Collaterize Simulation | Execute comprehensive launch assessment | `mission_block`, `checklist_block`, `indicator_block` | `CollaterizeAgent`
3 | Launch Assessment Results | Review eligibility score and launch plan | `evaluation_block`, `text_block`, `resource_block` | `ZynoAgent`


### Persona: The Resilience Master (`resilience-master`)

#### Phase: `security-baseline`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Security Baseline Forge | Build auditing muscle memory | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `exploit-hunt`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Exploit Hunter Arena | Hone offensive security skills | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `defense-systems`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Defense Systems Orchestrator | Engineer runtime protections | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `incident-response`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | On-Chain Incident Command | Master forensic triage | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `redblue-evolution`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Red/Blue Evolution | Institutionalize security culture | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `launch-collaterize`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Launch Simulation: Introduction | Understand the Collaterize launch platform | `text_block`, `diagram_block` | `CollaterizeAgent`
2 | Run Collaterize Simulation | Execute comprehensive launch assessment | `mission_block`, `checklist_block`, `indicator_block` | `CollaterizeAgent`
3 | Launch Assessment Results | Review eligibility score and launch plan | `evaluation_block`, `text_block`, `resource_block` | `ZynoAgent`


### Persona: E2E Test Persona (`e2e-persona`)

#### Phase: `discovery`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Discovery | Discovery Phase | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `strategy`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Strategy | Strategy Phase | `text_block`, `mission_block`, `resource_block` | `GuideAgent`

#### Phase: `plan`

| # | Step title | Summary | UI blocks | Agent actions |
|---:|---|---|---|---|
1 | Plan Generation | Plan Phase | `text_block`, `mission_block`, `resource_block` | `GuideAgent`


<!-- END AUTO-GENERATED: steps-by-journey -->




---

## 🧱 UI Blocks, ressources & documents

<a id="ui-blocks"></a>

Le cœur “LLM → UI” du simulateur passe par un format de réponse structuré :

- `JourneyStepResponse` (voir `journey-simulator/src/types/uiBlocks.ts`)
  - contient `ui_blocks[]` (tableau de blocs typés)

### Renderer (front)

- `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx` :
  - mappe `block.kind` → composant React
  - rend l’interface de mission sous forme de blocs (quiz, ressources, diagrammes, etc.)
  - est conçu pour être **tolérant** (best-effort) quand des champs optionnels sont absents

### Kinds de blocs (catalogue)

Types **définis** (schema `UIBlock`) :

- `text_block`, `checklist_block`, `quiz_block`, `mission_block`
- `resource_block`, `document_block`, `evaluation_block`
- `action_suggestions_block`, `xp_block`, `diagram_block`
- `dao_dashboard_block`, `project_selection_block`, `narrative_choice_block`
- `indicator_block`, `interactive_template_block`, `hint_block`
- `bonding_curve_block`, `code_auditor_block`, `market_launchpad_block`

Types **rendus** par `UIBlocksRenderer` (actuel) :

- `text_block`, `checklist_block`, `quiz_block`, `mission_block`
- `resource_block`, `document_block`, `evaluation_block`
- `action_suggestions_block`, `xp_block`, `diagram_block`
- `dao_dashboard_block`, `bonding_curve_block`, `code_auditor_block`, `market_launchpad_block`

Types **déclarés mais non branchés** dans le renderer principal :

- `indicator_block`, `narrative_choice_block`, `interactive_template_block`, `project_selection_block`, `hint_block`

### Ressources (ResourceBlock)

Un `resource_block` expose typiquement `resources[]` (ex: liens, flashcards) ; l’UI peut :

- ouvrir un lien HTTP,
- afficher un toast “deliverable” (avec copie clipboard) si l’URL est absente,
- agréger ces ressources via `AgentDeliverables` (sidebar & feed).

## 🧩 UI Blocks renderer & interactions

<a id="ui-blocks-renderer"></a>

Points clés (frontend) :

- **Fallback offline** : si `ui_blocks` est vide → rendu des blocs `FALLBACK_BLOCKS`.
- **Streaming & rich content** : markdown simple, Mermaid lazy-load, KaTeX lazy-load.
- **Sources & reasoning** : `SourceBadges` filtre les sources (score ≥ 0.6), badge “UNVERIFIED_LOCAL” si fallback local ; `ThoughtProcess` affiche le raisonnement quand présent.
- **Actions utilisateur** :
  - `ActionSuggestionsBlock` → `POST /journey/:id/step` (chainage d’actions).
  - `MissionBlock` / `QuizBlock` → `api.submitMission()` (via `/journey/:id/submit`) puis mise à jour `lastStep` + XP.
- **Mode démo** : `submitDemoInteraction()` intercepte les validations et gère l’état `WAITING_FOR_INTERACTION`.

## 🖥️ Frontend & affichages (pages principales)

<a id="frontend-affichages"></a>

Routes UI (voir `journey-simulator/src/App.tsx`) :

- `/` : HomePage (hero + personas + CTA).
- `/journeys` & `/journeys/:journeyId` : Journey workspace (layout + UI blocks).
- `/journeys/demo` & `/journeys/demo/:journeyId` : demo (séquenceur).
- `/dashboard`, `/dao`, `/resources`, `/support`, `/playground`.
- `/zyno` : ZynoConsole.
- `/guide` : guide d’architecture (AEPO/AECO/Execution Gate).
- `/debug/mint` : debug minting (wallet).
- `/journeys/completed` : écran de fin de parcours.

---

## 🧰 Consoles & Debug (ZynoConsole, healthz/readyz, logs)

<a id="debug-consoles"></a>

Le simulateur embarque une console “investor/dev” pour observer Zyno et l’orchestration.

### ZynoConsole (front)

- `journey-simulator/src/components/Zyno/ZynoConsole.tsx`
  - **health checks** : ping périodique `GET /healthz` et `GET /readyz`
  - **orchestration** : `POST /api/agents/interact` via `zynoApi` (`journey-simulator/src/api/zyno.ts`)
  - **résumé mission** : rendu depuis `sample_mission_feedback.json` + timeline simulée
  - **outils** : viewer de logs agents, flow de mission, upload de ressources (RAG)

### DAO console (front)

- `journey-simulator/src/components/Dao/DaoDashboard.tsx`
  - snapshot `api.getDaoConfig()` + `api.getDaoProposals()`
  - panneau admin `ZynoDAOAdminPanel` (dev/investor)

### Journey dashboard (front)

- `journey-simulator/src/components/Journey/JourneyDashboard.tsx`
  - refresh périodique de progression + “last mint” best-effort via `GET /api/mint/last`

---

## 🧠 Orchestration agentique (résumé opérationnel)

- **Intent router + registry** : sélection d’agents par intents normalisés (`intentRouter`), ordre par priorité.
- **Scoring & synthèse** : `LogicCheckService` + `scoringService` → `overallStatus`, `topFindings`, `recommendedActions`.
- **Tools & executionPlan** : mapping actions → tools (`actionToolMapper` → `toolsRegistry`).
- **Execution Gate (HITL)** : gate `PENDING/APPROVED/REJECTED` requis pour outils `requiresConfirmation`.
- **Execution Engine** :
  - Mode par défaut : `DRY_RUN` (SIMULATED), aucun side-effect.
  - Mode réel : uniquement si `EXECUTION_ENABLED=true` **et** gate approuvé ; sinon fallback en dry-run.
  - `REAL_EXECUTION_MODE=shadow` : compare dry-run vs real-simulated.
- **Observabilité** : logs structurés par `traceId`, métriques et alertes (SLO).

## 🚀 Quick Start

Cette section te permet de lancer rapidement la stack de dev (frontend + backend), puis de valider un premier parcours (persona → phases → progression).

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Solana Wallet** (Phantom recommended)
- **Basic understanding** of React and TypeScript

### Installation

```bash
# Clone the repository
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator

# Install dependencies
npm install

# Install backend dependencies
npm install --prefix ../mf-back

# Start backend API (requires PostgreSQL running locally)
DATABASE_URL="postgresql://mfai:mfai_secure_2024@localhost:5432/mfai_db?schema=public" JWT_SECRET=dev-secret npm run dev --prefix ../mf-back

# Start frontend development server
npm run dev

# Open browser to http://127.0.0.1:5173
```

### Integration with Money Factory AI Website

This journey simulator is designed to be integrated into the main Money Factory AI website at [mfai.app](https://mfai.app). The integration will include:

1. **CTA Button**: A prominent call-to-action button on the main website inviting users to "Experience Your Journey"
2. **Seamless Navigation**: Direct linking from the main site to the journey simulator
3. **Consistent Branding**: Matching design language and user experience
4. **Data Integration**: Potential user data synchronization between platforms

#### Recommended Integration Points

- **Homepage Hero Section**: Primary CTA to start journey simulation
- **About Page**: Detailed explanation with link to try the simulator
- **Navigation Menu**: Direct access to journey simulator
- **Footer**: Secondary access point for interested users

### Wallet Setup for Development

1. **Install Phantom Wallet** browser extension
2. **Switch to Devnet**:
   - Open Phantom → Settings → Developer Settings
   - Change Network from "Mainnet" to "Devnet"
3. **Get Devnet SOL**:
   - Use the built-in faucet button in the app
   - Or visit [Solana Faucet](https://solfaucet.com/)

### First Run

1. Connect your wallet (set to Devnet)
2. Select a persona that matches your profile
3. Start your journey through the 6 phases
4. Earn XP, mint NFTs, and participate in governance

---

## 🏗️ Architecture

Vue d’ensemble des composants (frontend, API, RAG, DB) et de leurs relations. Les sections suivantes détaillent ensuite la hiérarchie UI et l’architecture fonctionnelle Zyno.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Blockchain    │    │   AI Services   │
│   (React/TS)    │◄──►│   (Solana)      │    │   (Zyno AI)     │
│                 │    │                 │    │                 │
│ • UI Components │    │ • Smart         │    │ • Contextual    │
│ • State Mgmt    │    │   Contracts     │    │   Guidance      │
│ • Wallet Conn   │    │ • NFT Minting   │    │ • Validation    │
│ • Animations    │    │ • Token Staking │    │ • Recommendations│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

```
User Action → State Update → Blockchain Transaction → UI Feedback
     ↓              ↓              ↓                    ↓
  Click Mint    Update Store    Sign with Wallet    Show Success
```

### Component Hierarchy

App
├── Header (Navigation + Wallet)
├── HeroSection (Landing + Skillchain Card)
├── JourneysPage
│   ├── PersonaSelector
│   ├── JourneyTimeline
│   ├── JourneyDashboard
│   └── PhaseSection[]
├── AccessPassHolders
├── Footer
└── Modals
    ├── JourneyModal
    ├── NFTProofModal
    ├── StakingModal
    └── DAOVoteModal

### Architecture Fonctionnelle de Zyno (MVP Multi-Agent)

+------------------------+
|     Utilisateur       |
+----------+------------+
           |
           v
+------------------------+
|  Interface Frontend    | ← ZynoConsole (React)
|  - Input utilisateur   |
|  - ZynoMissionFlow     |
|  - AgentLogViewer      |
+----------+------------+
           |
           v
+------------------------+
|     API Express.js     |
|  - /orchestration      |
|  - /admin/agent-logs   |
|  - /admin/rag/upload   |
+----------+------------+
           |
           v
+----------------------------+
|     Orchestrateur Zyno     |
|  (orchestrateZyno())       |
|  - Détection d’intention   |
|  - Sélection d’agents      |
|  - Chaînage & contexte     |
+-----+----------------------+
      |
      v
+---------------------------------------------+
|               Agents (registry)             |
| - BuilderAgent, CoachAgent, DAOAgent, etc.  |
| - Appels LLM via LLMClient/OpenAIClient     |
| - RAG optionnel par agent                   |
+------------------+--------------------------+
                     |
                     v
   +-------------------------+     +----------------------+
   |       RAG Client        |     |     LLM Helper        |
   |  - Ingestion/Search     |     |  - Appel LLM (OpenAI) |
   +-----------+-------------+     +----------+------------+
               |                             |
               v                             v
+----------------------------+   +------------------------------+
| Base de documents RAG     |   |   Résultat de complétion     |
| (.md, .pdf thématiques)   |   |   (prompt → réponse)         |
+----------------------------+   +------------------------------+

               |
               v
+----------------------------------------+
| Prisma/Postgres + stores in-memory     |
| - agent sessions/logs (Prisma)         |
| - auditTrail/memory (in-memory TTL)    |
+----------------------------------------+

Éléments clés :

Zyno agit comme chef d’orchestre intelligent, déclenchant les agents selon :

L’intention de l’utilisateur.

La phase du parcours (AECO).

Le profil AEPO (type d’apprenant).

Les agents utilisent :

des documents enrichis (RAG).

des modèles LLM externes (OpenAI).

la mémoire des interactions précédentes.

Interface ZynoConsole : offre un contrôle total :

Visualisation du parcours (ZynoMissionFlow).

Logs filtrables (AgentLogViewer).

Upload RAG et test prompt live.

---

## 🧠 Core Concepts

Les concepts ci-dessous sont le vocabulaire “produit” utilisé dans l’UI et les dashboards (phases, personas, token utility, certifications) ; la section “Détail phase par phase” est la source exhaustive pour les parcours.

### Cognitive Activation Protocol™

The foundation of the platform is a 6-phase progression model:

#### Phase 1: Learn

- **Objective**: Acquire foundational knowledge
- **Activities**: Interactive content, quizzes, videos
- **Rewards**: XP, $MFAI tokens, basic NFT badges
- **Duration**: 1-2 weeks

#### Phase 2: Build

- **Objective**: Apply knowledge to create projects
- **Activities**: Wallet setup, project creation, MVP development
- **Rewards**: Builder NFTs, increased XP, tool access
- **Duration**: 2-3 weeks

#### Phase 3: Prove

- **Objective**: Validate skills through challenges
- **Activities**: Skill assessments, peer review, certification
- **Rewards**: Proof-of-Skill™ NFTs, community recognition
- **Duration**: 1-2 weeks

#### Phase 4: Activate

- **Objective**: Engage in governance and staking
- **Activities**: DAO voting, token staking, community participation
- **Rewards**: Governance rights, staking rewards, voting power
- **Duration**: Ongoing

#### Phase 5: Scale

- **Objective**: Expand impact and earn passive income
- **Activities**: Teaching, project launching, ecosystem contribution
- **Rewards**: Neuro-Dividends™, leadership roles, revenue sharing
- **Duration**: Ongoing

#### Phase 6: Launch (Collaterize simulation)

- **Objective**: Simulate launch readiness and liquidity mechanics before mainnet
- **Activities**: Collaterize simulation, eligibility scoring, and launch plan review
- **Rewards**: Launch badges (testnet/devnet), exportable reports
- **Duration**: As needed

### User Personas (6 pathways)

Each persona follows the same 6-phase structure (ending with **Launch via Collaterize** simulation) but with tailored missions, tools, and rewards.

#### 1) The Cognitive Activation Hub (`cognitive-activation-hub`) 🧠

- **Target**: Web3 newcomers / cross-over builders
- **Focus**: Mental models + Solana fluency + activation rituals

#### 2) The Capital Foundry (`capital-foundry`) 🏛️

- **Target**: DeFi builders / investors / protocol strategists
- **Focus**: Capital design, risk, and launch preparation

#### 3) The System Architect (`system-architect`) 🧩

- **Target**: Infra / DePIN / systems engineers
- **Focus**: Architecture, scaling, and production hardening

#### 4) The Experience Studio (`experience-studio`) 🎨

- **Target**: Product / UX / creators
- **Focus**: Experience design, NFT systems, community loops

#### 5) The Impact Engine (`impact-engine`) 🌱

- **Target**: DAO operators / governance builders
- **Focus**: Governance design, reputation, coordination

#### 6) The Resilience Master (`resilience-master`) 🛡️

- **Target**: Security / risk / auditing profiles
- **Focus**: Resilience hardening and launch readiness

### Token Economics

Cette sous-section décrit les mécanismes économiques **présentés** à l’utilisateur (tokens, staking, governance) et où ils sont simulés vs réellement branchés.

#### $MFAI Token Utility

- **Learning Rewards**: Earned through phase completion
- **Staking**: Required for advanced phases and governance
- **Governance**: Voting power in DAO decisions
- **Access**: Premium features and exclusive content
- **Rewards**: Neuro-Dividends™ for active participants

#### NFT Certifications

- **Proof-of-Skill™**: Validates learning achievements
- **Proof-of-Vision™**: Recognizes innovative ideas
- **Proof-of-Build™**: Certifies technical contributions
- **Proof-of-Creation™**: Acknowledges creative work
- **Access Passes**: Gold, Platinum, Diamond tiers

---

## 🛠️ Technical Stack

Stack technique du simulateur (dépendances principales, outils, et cibles). Les versions exactes peuvent évoluer — le `package.json` fait foi, mais cette section donne le contexte.

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI framework |
| **TypeScript** | 5.3.3 | Type safety |
| **Vite** | 4.5.14 | Build tool & dev server |
| **Tailwind CSS** | 3.3.5 | Styling framework |
| **Framer Motion** | 12.23.0 | Animations |
| **Zustand** | 4.4.1 | State management |
| **Lucide React** | 0.556.0 | Icon library |

Notes:

- Les valeurs ci-dessus reflètent `journey-simulator/package.json` (la source de vérité).
- Les versions “mineures/patch” peuvent diverger si `package-lock.json` est différent sur une machine.

### Blockchain Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solana Web3.js** | 1.98.2 | Blockchain interaction |
| **Wallet Adapter** | 0.15.35 | Wallet integration |
| **SPL Token** | 0.4.13 | Token operations |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixes |

---

## 📁 Project Structure

```
money-factory-ai/
├── docs/                           # Documentation
│   ├── README.md                   # This file
│   ├── blockchain_integration_plan.md
│   ├── cahier_charges.md
│   ├── protocol_paper_en.md
│   └── project_documentation.md
├── public/                         # Static assets
│   ├── images/                     # Images and icons
│   │   ├── logo_mfai.png
│   │   ├── activation_loop.png
│   │   ├── solana.svg
│   │   └── personas/               # Persona-specific images
│   └── favicon.ico
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── Journey/               # Journey-specific components
│   │   │   ├── JourneyCard.tsx
│   │   │   ├── JourneyTimeline.tsx
│   │   │   ├── JourneyDashboard.tsx
│   │   │   ├── PhaseSection.tsx
│   │   │   ├── XPTracker.tsx
│   │   │   └── ZynoBox.tsx
│   │   ├── Header.tsx             # Navigation
│   │   ├── HeroSection.tsx        # Landing section
│   │   ├── JourneysPage.tsx       # Main journey interface
│   │   ├── SkillchainCard.tsx     # Interactive progress card
│   │   ├── WalletButton.tsx       # Wallet connection
│   │   ├── AccessPassHolders.tsx  # Success stories
│   │   ├── Footer.tsx             # Site footer
│   │   ├── ZynoAssistant.tsx      # AI assistant
│   │   └── [Modals]/              # Various modal components
│   ├── contexts/                  # React contexts
│   │   └── WalletContext.tsx      # Wallet provider
│   ├── data/                      # Static data
│   │   ├── personas.ts            # Journey definitions
│   │   ├── holders.ts             # Success stories
│   │   └── proofsData.ts          # NFT metadata
│   ├── store/                     # State management
│   │   ├── journeyStore.ts        # Main app state
│   │   └── themeStore.ts          # Theme state
│   ├── types/                     # TypeScript definitions
│   │   └── journey.ts             # Core type definitions
│   ├── utils/                     # Utility functions
│   │   ├── blockchain.ts          # Blockchain operations
│   │   └── particles.ts           # Background effects
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
└── README.md                      # This documentation
```

---

## 🧭 Cartographie du code (fichier par fichier)

Cette section est une **carte de lecture** du code “fichier par fichier” (par domaine). Elle répond à la question : *« où se trouve quoi ? »* et *« quel fichier fait quoi ? »*.

### Frontend (`journey-simulator/src/`)

Inventaire des fichiers côté UI (routing, contexts, stores, utils) et de leurs responsabilités.

#### Entrypoints

- `src/main.tsx` : bootstrap React + `BrowserRouter`, polyfills (`Buffer`, `process`) et (actuellement) **service worker désactivé**.
- `src/App.tsx` : configuration des routes React Router, providers (Wallet/Auth/Tutorial), thème, et init particules.
- `src/index.css` : styles globaux (Tailwind + classes utilitaires).

#### Routing (pages) — mapping réel

Les routes ci-dessous sont celles effectivement déclarées dans `src/App.tsx` :

| Route | Fichier | Rôle | Protégée |
|---|---|---|---|
| `/` | `src/pages/HomePage.tsx` | Landing “product” (AEPO/AECO, pitch UX) | Non |
| `/login` | `src/components/LoginPage.tsx` | Connection (email/wallet/démo) | Non |
| `/register` | `src/components/RegisterPage.tsx` | Inscription | Non |
| `/dashboard` | `src/pages/Dashboard.tsx` | Dashboard d’entrée + preview journeys | Oui |
| `/journeys` | `src/pages/Journey.tsx` | Liste journeys vs workspace selon `selectedPersona` | Oui |
| `/journeys/:journeyId` | `src/pages/Journey.tsx` | Deep link vers une persona (par `id`) | Oui |
| `/journeys/completed` | `src/pages/JourneyCompleted.tsx` | Écran “journey completed” | Oui |
| `/dao` | `src/pages/Dao.tsx` | Dashboard DAO | Oui |
| `/resources` | `src/pages/Resources.tsx` | Hub ressources | Oui |
| `/support` | `src/pages/Support.tsx` | Centre support | Oui |
| `/zyno` | `src/pages/Zyno.tsx` | Console Zyno + dashboard mission | Oui |
| `/playground` | `src/pages/Playground.tsx` | Playground interne | Oui |
| `/guide` | `src/pages/GuidePage.tsx` | Guide “in-app” (AEPO/AECO, workflow) | Oui |
| `/debug/mint` | `src/pages/DebugMint.tsx` | Debug UI mint (dev) | Oui |

La protection est assurée par :

- `src/components/ProtectedRoute.tsx` (garde auth)
- `src/components/layout/Layout.tsx` (layout shell commun)

#### Contexts (session, wallet, tutoriel, layout)

- `src/contexts/AuthContext.tsx` : auth JWT + refresh + “loginAsDemo”, chargement progress via `journeyStore.loadUserProgress()`.
- `src/contexts/WalletContext.tsx` : provider wallet (adapters Solana) + état connection.
- `src/contexts/TutorialContext.tsx` : moteur de tutoriel (steps, autoStart) utilisé par `Journey.tsx`.
- `src/contexts/WorkspaceLayoutContext.tsx` : état UI/layout du workspace (panneaux, focus mode, etc.).

#### Stores (Zustand)

- `src/store/journeyStore.ts` : état principal (persona sélectionnée, phases, progress, demo mode, exécution de steps, collaterize simulation, etc.).
- `src/store/themeStore.ts` : thème dark/light.
- `src/store/favoritesStore.ts` : favoris de ressources (liste, ajout/suppression, chargement).

#### API / types / utils

- `src/utils/api.ts` : client HTTP central (auth headers, refresh auto, **demo mode mock**, endpoints DAO/journey/user).
- `src/api/mf-back-client.ts` : types générés (OpenAPI) pour le backend.
- `src/api/mf-back.ts` : wrappers `journey.*`, `agents.*`.
- `src/types/uiBlocks.ts` : schéma des UI blocks (“LLM → UI”).
- `src/components/UIBlocks/UIBlocksRenderer.tsx` : renderer de `ui_blocks[]` (quiz/resources/diagram/etc.) + tolérance aux champs manquants.
- `src/utils/journeySignals.ts` : calcul des scores AEPO/AECO/Alignment côté UI (signaux d’affichage).
- `src/utils/blockchain.ts` : intégration/simulation blockchain (mint/stake/vote selon mode).
- `src/utils/sendToNotion.ts` : export Notion (si activé).
- `src/utils/exportToPDF.ts` : export PDF.
- `src/service-worker.js` : service worker (présent ; enregistrement actuellement désactivé dans `main.tsx`).

### Backend (`mf-back/`)

Le backend runtime actuel est une API Express **TypeScript** (`mf-back/src`) avec Prisma/Postgres (agents). Le dossier `mf-back/dist` contient le build JS (legacy/compat).

- l’authentification (`/user/*`)
- la progression journey (démo via `/journey/*`)
- l’interaction agents (`/api/agents/*`)
- la DAO (`/dao/*`)
- le RAG admin (`/admin/rag/*`, si activé).

#### Entrypoints & câblage

- `mf-back/src/app.ts` : Express app + middlewares + **mount** routes.
- `mf-back/src/server.ts` : démarrage serveur (dev/prod).
- `mf-back/dist/*` : build JS si `npm run build` (peut contenir des routes legacy).

#### Routes (fichiers)

Fichiers de routes (dans `mf-back/src/routes/`) :

- `auth.routes.ts`, `user.routes.ts`
- `journey.routes.ts` (demo endpoints)
- `agent.routes.ts`
- `health.routes.ts`, `index.routes.ts`

#### Controllers / Models / Services

- `mf-back/src/controllers/*.ts` : logique métier (auth, agent, health).
- `mf-back/src/services/*.ts` : mémoire agents, logs Prisma, etc.
- `mf-back/prisma/` : schémas DB.

#### Orchestration & agents

- `mf-back/src/orchestration/*` : pipeline Zyno (intent → agents → scoring → execution).
- `mf-back/src/agents/*` : catalogue d’agents.
- `mf-back/src/orchestration/llmClient.js` + `mf-back/src/llm/OpenAIClient.ts` : appels LLM.

#### RAG

- `mf-back/src/rag/ragClient.js` : client RAG HTTP + fallback.
- `mf-back/src/orchestration/ragClient.js` : RAG orchestration.

### Infra / CI / déploiement (monorepo)

À l’échelle du monorepo, les fichiers qui pilotent la CI et le déploiement sont notamment :

- `.github/workflows/*` : CI backend/frontend/e2e/verify.
- `docker-compose*.yml`, `journey-simulator/nginx.conf`, `journey-simulator/Dockerfile`, `mf-back/Dockerfile`.
- Scripts racine : `scripts/*`, `start_dev.sh`, `verify-production.sh`, etc.

---

## 🗂️ Index complet des fichiers (auto-généré)

<a id="file-index"></a>

Cette section liste **tous les fichiers** du monorepo (hors artefacts build/coverage/node_modules) avec un rôle court par fichier. Elle est générée automatiquement pour éviter tout oubli.

- Générateur : `journey-simulator/scripts/generate-file-index.mjs`
- Commande :

```bash
# Depuis la racine du monorepo
node journey-simulator/scripts/generate-file-index.mjs

# Ou depuis journey-simulator/
npm run generate:file-index
```

<!-- BEGIN AUTO-GENERATED: file-index -->

> Index auto-généré “fichier par fichier” du monorepo (frontend + backend + infra).

Commande: `node journey-simulator/scripts/generate-file-index.mjs`

<details>
<summary><strong>journey-simulator/src (frontend)</strong> (216)</summary>

- `journey-simulator/src/api/agentRuns.ts` — Client typé / wrappers API mf-back. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/api/mf-back-client.ts` — Client typé / wrappers API mf-back. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Th
- `journey-simulator/src/api/mf-back.ts` — Client typé / wrappers API mf-back. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/api/zyno.ts` — Client typé / wrappers API mf-back. Note: Zyno API Client - Connects to mf-back /api/agents/interact Project: Money Factory AI (MFAI) / import { tokenStore } from '../utils/tokenStor
- `journey-simulator/src/App.tsx` — Routeur (React Router) + providers + layout. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/assets/lottie/galaxy-reactive.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/dao-launchpad.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/feedback-stars.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/mission-flow.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/multi-agents.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/components/__tests__/NFTMintingModal.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/__tests__/UIBlocksRenderer.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/__tests__/WalletButton.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/AccessPassHolders.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Admin/AgentHealthCommandCenter.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA Glob
- `journey-simulator/src/components/AgentActivityFeed.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/AgentDeliverables.tsx` — Composant React UI.
- `journey-simulator/src/components/Artifacts/ArtifactCard.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Artifacts/ArtifactModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Artifacts/NeuralOverlay.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Artifacts/ProjectAssets.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/CertificateModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/CodeAuditor.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Dao/DaoDashboard.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/DAOVoteModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/DebugLogger.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/DeFi/BondingCurveVisualizer.tsx` — Composant React UI.
- `journey-simulator/src/components/Governance/GovernanceDashboard.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/HeroSection.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/__tests__/JourneyCard.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/__tests__/JourneyNextActionsPanel.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/__tests__/JourneyProgressBar.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/__tests__/JourneyTimeline.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/__tests__/JourneyWorkspace.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/__tests__/NFTIntegration.test.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/AgentActivityFeed.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/AgentHealthCommandCenter.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/charts/RadarChart.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/ConfettiBackground.tsx` — Composant React UI. Note: Confetti Background Component (Lazy Loaded) Separated for performance optimization / import { motion } from 'framer-motion'; export default 
- `journey-simulator/src/components/Journey/effects/MasteryConfetti.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/InvestorDemoMode.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/journey-simulator.code-workspace` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyCard.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneyDashboard.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneyDemoMode.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneyNextActionsPanel.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneyOverviewHeader.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneyProgressBar.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneySimulationMode.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneyTimeline.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/JourneyWorkspace.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/LaunchCollaterizePhase.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/LiveCommunicationThread.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/LiveSolanaPulse.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/MasteryGraduation.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA Mast
- `journey-simulator/src/components/Journey/MintMission.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/PhaseDetails.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/PhaseInteractionBlock.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/PhaseSection.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/XPTracker.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/ZynoBox.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/ZynoChat.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Journey/ZynoSignalSidebar.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/JourneyCompletedPage.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/JourneysPage.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/JourneysPreview.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/layout/Footer.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/layout/Header.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Layout/JourneyLayout.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/layout/Layout.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/layout/Main.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/layout/Sidebar.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/LoginPage.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/MarketLaunchpad.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/MentalModelMapper.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/MintCelebrationBanner.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Missions/MarketLaunchpad.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/navigation/MainNavigation.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/navigation/UserMetricsPanel.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/NFTMintingModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/NFTMintingTutorial.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/NFTProofModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/NodeAttestationSim.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/onboarding/OnboardingFlow.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/PlaygroundPage.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/ProofCertificationsBoard.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/ProtectedRoute.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/RegisterPage.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/ResetProgressButton.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Resources/ResourceHub.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Shared/AgentIconRegistry.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/BackToTopButton.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/Button.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/ContextualTutorial.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/EmptyState.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/InfoBadge.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/JourneyModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/LazyConfetti.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/LazyLoadList.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/MessageDisplay.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Shared/Odometer.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/Skeleton.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/VaultSyncAnimation.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA Vaul
- `journey-simulator/src/components/shared/WalletConnectionBanner.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/shared/ZynoAssistant.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/ShareModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/SkillchainBanner.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/SkillchainCard.css` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / .p
- `journey-simulator/src/components/SkillchainCard.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/StakingModal.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Support/SupportCenter.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/UIBlocks/IndicatorBlock.tsx` — Renderer UI Blocks (LLM → UI). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/UIBlocks/InteractiveTemplateBlock.tsx` — Renderer UI Blocks (LLM → UI). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/UIBlocks/NarrativeChoiceBlock.tsx` — Renderer UI Blocks (LLM → UI). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx` — Renderer UI Blocks (LLM → UI). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/wallet/LazyWalletMultiButton.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/WalletButton.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/WalletConnectionGuide.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/WalletFaucetButton.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/WalletStatusDisplay.tsx` — Composant React UI. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/__tests__/AgentFeedbackModal.test.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/__tests__/ZynoConsole.test.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/agent-card.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/AgentFeedbackForm.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/AgentFeedbackModal.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/AgentLogViewer.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/AgentScoreboardContext.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/DashboardZyno.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/LiveSolanaPulse.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA Live
- `journey-simulator/src/components/Zyno/MissionFeedbackSummary.stories.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/MissionFeedbackSummary.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/ResourceUploader.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/types.ts` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/components/Zyno/ZynoAgentScoreboard.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/ZynoChatSidebar.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/ZynoConsole.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/ZynoDAOAdminPanel.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/ZynoDecisionPanel.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/components/Zyno/ZynoMissionFlow.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/config/demoScenarios.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/config/journeyPhases.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/content/aepoAeco.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/contexts/__tests__/WalletContext.test.tsx` — Context React (auth, wallet, tutoriel, layout). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/contexts/AuthContext.tsx` — Context React (auth, wallet, tutoriel, layout). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/contexts/TutorialContext.tsx` — Context React (auth, wallet, tutoriel, layout). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/contexts/WalletContext.tsx` — Context React (auth, wallet, tutoriel, layout). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/contexts/WorkspaceLayoutContext.tsx` — Context React (auth, wallet, tutoriel, layout). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/hooks/useArtifacts.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/hooks/useDemoEngine.ts` — Fichier du monorepo (voir chemin). Note: useDemoEngine - Encapsulates the demo mode timing logic This hook manages the demo sequencer's heartbeat (tick loop). It ensures proper clea
- `journey-simulator/src/hooks/useOptimizedLoading.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/hooks/usePhaseData.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/index.css` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / @i
- `journey-simulator/src/lib/solana-config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Sh
- `journey-simulator/src/lib/walletAuth.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/main.tsx` — Entrypoint React + BrowserRouter + polyfills. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / /*
- `journey-simulator/src/pages/Dao.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/Dashboard.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/DebugMint.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/FavoritesPage.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/GuidePage.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/HomePage.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/Journey.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/JourneyCompleted.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/JourneyDemo.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/Playground.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/Resources.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/Support.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/pages/Zyno.tsx` — Page (route) React Router. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/service-worker.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/src/shims/empty.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/src/store/__tests__/demoIntegrity.test.ts` — Store Zustand (state management). Note: Demo Scenario Integrity Test Suite Validates that all demo scenarios generate valid, non-empty sequences with properly structured UIBlocks t
- `journey-simulator/src/store/__tests__/demoSequencer.comprehensive.test.ts` — Store Zustand (state management). Note: Comprehensive DemoSequencer Tests Tests all 6 personas and all phases for completeness and validity / import { describe, it, expect } from '
- `journey-simulator/src/store/__tests__/demoSequencer.verify.test.ts` — Store Zustand (state management). Note: FORMAL VERIFICATION TEST - demoSequencer Business Rules QA Audit: Capital Foundry, Impact Engine, Collaterize / import { describe, it, expec
- `journey-simulator/src/store/__tests__/journeyStore.comprehensive.test.ts` — Store Zustand (state management). Note: Comprehensive JourneyStore Tests Tests phase progression, state management, and demo functionality / import { describe, it, expect, beforeEa
- `journey-simulator/src/store/__tests__/journeyStore.test.ts` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/src/store/__tests__/journeyStore.wallet.test.ts` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/store/demoSequencer.ts` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Module: Demo Sequencer V2 - Reconstruction Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOU
- `journey-simulator/src/store/demoSequencer.ts.backup` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Module: Context-Aware Demo Sequencer V3 Contributors: Alaeddine BEN RHOUMA,
- `journey-simulator/src/store/favoritesStore.ts` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/store/journeyStore.ts` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/store/journeyStore.ts.backup` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/store/themeStore.ts` — Store Zustand (state management). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/test/Journey.deep-linking.test.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/test/journey.e2e.test.tsx` — Fichier du monorepo (voir chemin). Note: End-to-End Journey Tests Tests complete user flows through persona journeys / import { describe, it, expect, beforeEach, vi } from 'vitest';
- `journey-simulator/src/test/setup.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/types/artifact.ts` — Types TypeScript (contrats UI/Domain). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/types/journey.ts` — Types TypeScript (contrats UI/Domain). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/types/uiBlocks.ts` — Types TypeScript (contrats UI/Domain). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/utils/__tests__/ignoreExtensionErrors.test.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/utils/__tests__/sanitizeHeaders.test.ts` — Utilitaire (API client, scores, export, blockchain, etc.).
- `journey-simulator/src/utils/api-modules/auth.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Module: Authentication API Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / import 
- `journey-simulator/src/utils/api-modules/base.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Module: API Base & Core Networking Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA /
- `journey-simulator/src/utils/api-modules/demo.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/src/utils/api-modules/journey.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Module: Journey & Agent API Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Projec
- `journey-simulator/src/utils/api-modules/offline-fallback.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Module: Offline Fallback Logic Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / typ
- `journey-simulator/src/utils/api-modules/resources.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/utils/api-modules/web3.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/src/utils/api.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/utils/apiDemoHandlers.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / De
- `journey-simulator/src/utils/apiMiddleware.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Mi
- `journey-simulator/src/utils/blockchain.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/utils/demoSession.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/utils/exportToPDF.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/utils/generateStableKey.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Ge
- `journey-simulator/src/utils/ignoreExtensionErrors.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/src/utils/journeySignals.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/utils/logger.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ty
- `journey-simulator/src/utils/particles.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / de
- `journey-simulator/src/utils/personaStyles.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Sh
- `journey-simulator/src/utils/progress.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/utils/renderHighlightedText.tsx` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/src/utils/sanitizeHeaders.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Sanitize HTTP headers to prevent secret leakage in logs. Supports:  - Record<string, string | string[] | null | undefined>  - Web Headers (H
- `journey-simulator/src/utils/sendToNotion.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/src/utils/solanaWeb3.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ty
- `journey-simulator/src/utils/tokenStore.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ty
- `journey-simulator/src/vite-env.d.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //

</details>

<details>
<summary><strong>journey-simulator/tests (Playwright E2E)</strong> (60)</summary>

- `journey-simulator/tests/e2e-report/index.html` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/_support/fixtures.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/_support/route-tracker.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/00-preflight/runmode-guard-violation.spec.ts` — Tests Playwright (E2E). Note: Preuve C: Fail-Fast Guard Violation Test This test verifies that the E2E guard correctly crashes when: - __E2E_RUN_MODE_GUARD__ = 'real' (se
- `journey-simulator/tests/e2e/01-navigation/comprehensive-menu.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/01-navigation/error-pages.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/01-navigation/header-navigation.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/01-navigation/mode-persistence.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/02-agent-core/phase-1-discovery.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/02-agent-core/phase-2-strategy.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/02-agent-core/zyno-interaction.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/02-visual-regression/console-guard.spec.ts` — Tests Playwright (E2E). Note: Phase 2 — UX/UI Desktop: Console Guard (Runtime Error Detection) Validates zero unhandled console.error and page errors / import { test, exp
- `journey-simulator/tests/e2e/02-visual-regression/layout-trinity.spec.ts` — Tests Playwright (E2E). Note: Phase 2 — UX/UI Desktop: Trinity Layout Validation Validates Navigator, Zyno Pulse, and Central Stage layout invariants / import { test, exp
- `journey-simulator/tests/e2e/02-visual-regression/screenshots-desktop.spec.ts` — Tests Playwright (E2E). Note: Phase 2 — UX/UI Desktop: Screenshots (Visual Proofs) Captures screenshots at key states with zero-secrets validation / import { test, expect
- `journey-simulator/tests/e2e/03-agent-workflows/resource-production.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/03-user-workflows/journey-completion.spec.ts` — Tests Playwright (E2E). Note: Phase 3 — Journey Completion Test Validates journey completion state and rewards / import { test, expect } from '../fixtures/realModeTest'; 
- `journey-simulator/tests/e2e/03-user-workflows/persona-onboarding.spec.ts` — Tests Playwright (E2E). Note: Phase 3 — Persona Onboarding Test Validates each persona can onboard and access journey workspace / import { test, expect } from '../fixture
- `journey-simulator/tests/e2e/03-user-workflows/phase-progression.spec.ts` — Tests Playwright (E2E). Note: Phase 3 — Phase Progression Test Validates journey phase transitions and state persistence / import { test, expect } from '../fixtures/realM
- `journey-simulator/tests/e2e/03-user-workflows/rbac-enforcement.spec.ts` — Tests Playwright (E2E). Note: Phase 3 — RBAC Enforcement Test Validates UI and API access control for unauthorized actions / import { test, expect } from '../fixtures/rea
- `journey-simulator/tests/e2e/03-user-workflows/resource-unlock.spec.ts` — Tests Playwright (E2E). Note: Phase 3 — Resource Unlock Test Validates resources are locked before and unlocked after phase completion / import { test, expect } from '@pl
- `journey-simulator/tests/e2e/03-web3-simulation/dao-voting.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/03-web3-simulation/nft-minting.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/04-agents/resource-production.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Sp
- `journey-simulator/tests/e2e/04-agents/zyno-persistence.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/04-dashboard-intel/resource-rendering.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/04-dashboard-intel/zyno-chat-scroll.spec.ts` — Tests Playwright (E2E). Note: Phase 2 — UX/UI Desktop: Zyno Chat Scroll & Pagination Validates chat functionality, scroll behavior, and history persistence Language: Engl
- `journey-simulator/tests/e2e/04-data-validation/rag-upload.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/04-data-validation/request-smoke.spec.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/05-agents-orchestration/agent-contracts.spec.ts` — Tests Playwright (E2E). Note: Phase 4 — Agent Contracts Test Validates each agent's I/O contract compliance / import { test, expect } from '../fixtures/realModeTest'; imp
- `journey-simulator/tests/e2e/05-agents-orchestration/agent-sweep.spec.ts` — Tests Playwright (E2E). Note: Phase 4 — Exhaustive Agent Sweep Invokes ALL 45+ agents from inventory / import { test, expect } from '../fixtures/realModeTest'; import { m
- `journey-simulator/tests/e2e/05-agents-orchestration/features-validation.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/05-agents-orchestration/intent-routing.spec.ts` — Tests Playwright (E2E). Note: Phase 4 — Intent Routing Test (FIXED - Tier 1) Validates orchestrator routes explicit intents to expected agents Uses correct intent format 
- `journey-simulator/tests/e2e/05-agents-orchestration/multi-user-isolation.spec.ts` — Tests Playwright (E2E). Note: Phase 4 — Multi-User Isolation Test (FIXED) Validates user data isolation in orchestration Uses distinct auth states for userA and userB / i
- `journey-simulator/tests/e2e/05-agents-orchestration/orchestrator-resilience.spec.ts` — Tests Playwright (E2E). Note: Phase 4 — Orchestrator Resilience Test Validates orchestrator handles edge cases without silent crashes / import { test, expect } from '../f
- `journey-simulator/tests/e2e/05-agents-orchestration/rag-llm-proof.spec.ts` — Tests Playwright (E2E). Note: Phase 4 — RAG + LLM Deep Proof Captures verifiable evidence of retrieval and generative execution / import { test, expect } from '../fixture
- `journey-simulator/tests/e2e/05-agents-orchestration/veteran-flow.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/06-web3-persistence.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/0X-web3-simulation-only/connect-only.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/99-english-compliance/ui-runtime.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/99-gauntlet/gauntlet.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/debug_crash.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/debug-demo-flow.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/demo-interactive-integrity.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/final-demo-verification.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/fixtures/realModeTest.ts` — Tests Playwright (E2E). Note: Shared Playwright test fixture enforcing real-mode executions and unified auth. Ensures all tests run with the storage state produced by glo
- `journey-simulator/tests/e2e/fixtures/test-data.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Te
- `journey-simulator/tests/e2e/helpers/authStates.ts` — Tests Playwright (E2E). Note: Phase 4 — Auth States Helper Creates distinct auth states for multi-user isolation testing / import * as path from 'path'; import * as fs fr
- `journey-simulator/tests/e2e/helpers/console-guard.ts` — Tests Playwright (E2E). Note: Console guard helper for Phase 2 UX/UI tests Captures and validates console errors and page errors at runtime / import type { Page, ConsoleM
- `journey-simulator/tests/e2e/helpers/hardening.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/helpers/layout.ts` — Tests Playwright (E2E). Note: Layout validation helpers for Phase 2 UX/UI tests Provides utilities for checking dimensions, overlap, and viewport constraints / export int
- `journey-simulator/tests/e2e/helpers/progression.ts` — Tests Playwright (E2E). Note: Phase 3 — Progression Helper Exports sanitized progression data without secrets / import { Page } from '../_support/fixtures'; import * as f
- `journey-simulator/tests/e2e/helpers/rbac.ts` — Tests Playwright (E2E). Note: Phase 3 — RBAC Helper Validates UI and API access control enforcement / import { Page, expect, APIRequestContext } from '../_support/fixture
- `journey-simulator/tests/e2e/helpers/timeline.ts` — Tests Playwright (E2E). Note: Phase 4 — Timeline Helper Generates sanitized timeline evidence for agent orchestration / import * as fs from 'fs'; import * as path from 'p
- `journey-simulator/tests/e2e/helpers/ui-security.ts` — Tests Playwright (E2E). Note: UI security helper for Phase 2 UX/UI tests Validates that no tokens/secrets are rendered in the UI Complements zero-secrets policy for scree
- `journey-simulator/tests/e2e/interaction-gate.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/README.md` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/utils/journeyMocks.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/utils/navigation-helpers.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/utils/pageStability.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/tests/e2e/utils/uiActions.ts` — Tests Playwright (E2E). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im

</details>

<details>
<summary><strong>journey-simulator/docs (docs)</strong> (36)</summary>

- `journey-simulator/docs/agents/prompts/compliance.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/data.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/evaluator.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/onchain.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/orchestrator_zyno.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/simulation.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/blockchain_integration_plan.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/BUG_FIXES_2026-01-20.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/community_voice_to_synaptic_strategy.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/Content_Maker_to_Cognitive_Publisher.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/contenu_parcours.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/c4_context.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/seq_login_siws.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/seq_mint.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/seq_simulation.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/From_Project_Manager_to_Mission_Commander.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/JOURNEY_COMPLETION_REPORT.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/mfai_mvp_spec_english_final.pdf` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/openapi/journey-simulator.yaml` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/project_documentation.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/protocol_paper_en.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/protocol_paper_en.pdf` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/RECONSTRUCTION_REPORT.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/Event.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/Journey.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/JourneyStepResponse.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/SimulationRun.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/security_headers.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/solana/idl/journey_simulator.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/system_blueprint.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/TESTING_REPORT_FINAL.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/ui-ux/checklist.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/ui-ux/components.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/ui-ux/guide.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/web2_to_web3.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/web3_explorer_to_protocol_architect.md` — Documentation (diagrammes, schémas, specs).

</details>

<details>
<summary><strong>journey-simulator/public (assets)</strong> (92)</summary>

- `journey-simulator/public/assets/badges/cognitive_master.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/identity_artifact.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/phase_1.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/phase_2.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/phase_3.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/phase_4.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/phase_5.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/phase_6.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/assets/badges/veteran_master.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/dao-launch-starter-kit.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/mfai-protocol-whitepaper-en.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/mfai-system-blueprint.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/mission-feedback-loops.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/pitch-deck-narrative-framework.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/rag-ingestion-playbook.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/token-strategy-sprint-template.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/web2-to-web3-activation-guide.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/business_model.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/investor_memo.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/litepaper_sim.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/migration_blueprint.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/neural_swarm.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/pitch_deck_slide.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/rwa_property_sim.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/soulbound_cert.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/generated/tokenomics_sim.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/activation_loop.svg` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/AECO_AEPO.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/certificates/capital-foundry.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/certificates/cognitive-activation-hub.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/certificates/experience-studio.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/certificates/impact-engine.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/certificates/resilience-master.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/certificates/system-architect.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/coming_soon.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/Developer_use_cases_products.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/Developer_use_cases.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/Investor_testimonials.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/logo_mfai.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/capital-foundry/capital-discovery.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/capital-foundry/capital-launchpad.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/capital-foundry/launch-collaterize.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/capital-foundry/oracle-integration.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/capital-foundry/program-forge.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/capital-foundry/risk-command.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/cognitive-activation-hub/Cognition_Ignition.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/cognitive-activation-hub/cognitive-orientation.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/cognitive-activation-hub/ecosystem-engagement.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/cognitive-activation-hub/identity-proofing.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/cognitive-activation-hub/launch_collaterize.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/cognitive-activation-hub/solana-fluency.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/cognitive-activation-hub/token-design-lab.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/experience-studio/experience-discovery.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/experience-studio/experience-launch.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/experience-studio/gameplay-lab.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/experience-studio/launch-collaterize.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/experience-studio/nft-systems-lab.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/experience-studio/ux-elevation.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/impact-engine/dao-design.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/impact-engine/identity-reputation.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/impact-engine/impact-charter.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/impact-engine/launch-collaterize.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/impact-engine/philanthropy-protocols.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/impact-engine/synaptic-impact.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/resilience-master/defense-systems.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/resilience-master/exploit-hunt.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/resilience-master/incident-response.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/resilience-master/launch-collaterize.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/resilience-master/redblue-evolution.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/resilience-master/security-baseline.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/system-architect/architecture-scan.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/system-architect/depin-studio.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/system-architect/launch-collaterize.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/system-architect/onchain-ai.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/system-architect/synaptic-rollout.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/nfts/system-architect/systems-hardening.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/Smart_contract_audit_badge.png` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/solana.svg` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/zyno/agent_avatar.svg` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/images/zyno/zyno_avatar.svg` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/dao-launch-starter-kit.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/mfai-protocol-whitepaper-en.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/mfai-system-blueprint.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/mission-feedback-loops.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/rag-ingestion-playbook.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/web2-to-web3-activation-guide.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/manifest.json` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/neural_swarm.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/playground/index.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/polyfills-init.js` — Assets statiques servis par Vite/Nginx. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/public/sw.js` — Assets statiques servis par Vite/Nginx. Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `journey-simulator/public/vendor/README.md` — Assets statiques servis par Vite/Nginx.

</details>

<details>
<summary><strong>mf-back/routes (Express routes)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/controllers (business logic)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/models (Mongo schemas)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/services (services)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/orchestration (Zyno orchestration)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/agents (agents catalog)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/rag (RAG clients)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/middleware (middlewares)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/llm (LLM integration)</strong> (0)</summary>


</details>

<details>
<summary><strong>mf-back/scripts (utility scripts)</strong> (23)</summary>

- `mf-back/scripts/agent_mapping_final.md` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/audit-agents-config.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/scripts/check-rag-connection.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/scripts/clear-agent-cache.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/memory-test-get.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/memory-test-set.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/phase5_agent_sweep_full.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/phase5_agent_sweep_mini.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/phase5_list_models.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/phase5_llm_real.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/phase5_observability_check.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/prove-nft-agent.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/rag_upload.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `mf-back/scripts/seed-test-user.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/scripts/stress-test-orchestrator.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/scripts/test-chain-of-truth.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/test-conflict-growth.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/test-e2e-pipeline.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/test-tokenomics-validation.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/test-zyno-transition.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/verify-consumability.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/scripts/verify-journey-flow.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/scripts/verify-tokenomics.js` — Scripts utilitaires backend (RAG, verify flow). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co

</details>

<details>
<summary><strong>mf-back/__tests__ (backend tests)</strong> (0)</summary>


</details>

<details>
<summary><strong>.github/workflows (CI/CD)</strong> (7)</summary>

- `.github/workflows/backend-tests.yml` — CI/CD (GitHub Actions).
- `.github/workflows/ci.yml` — CI/CD (GitHub Actions).
- `.github/workflows/e2e-nightly.yml` — CI/CD (GitHub Actions).
- `.github/workflows/mcp-selftest.yml` — CI/CD (GitHub Actions).
- `.github/workflows/release.yml` — CI/CD (GitHub Actions).
- `.github/workflows/test-agents.yml` — CI/CD (GitHub Actions).
- `.github/workflows/verify.yml` — CI/CD (GitHub Actions).

</details>

<details>
<summary><strong>scripts (monorepo scripts)</strong> (64)</summary>

- `scripts/audit_compliance.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/audit_server.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/check-env-vars.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/check-liveness.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/ci-verify.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/collaterize-handshake.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/compliance/check-compliance.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/db-seed-demo.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/deep-audit.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/deploy_docker.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/deploy_pm2.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/deploy_rc_v1.0.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/deploy.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/dump_project.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/extract_error.py` — Scripts monorepo (verify, smoke, deploy).
- `scripts/extract_mfai_audit.py` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `scripts/fix-r1.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/full_stack_smoke.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/generate_agent_inventory.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/generate_full_mfai_audit.py` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `scripts/generate_matrix.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/generate_tree.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/generate-protocol-paper.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/launch-sovereign.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/local-clean.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/local-restart-prod.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/local-verify.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/mcp-selftest.mjs` — Scripts monorepo (verify, smoke, deploy).
- `scripts/mfai_full_audit_orchestrator.py` — Scripts monorepo (verify, smoke, deploy).
- `scripts/mfai_integrity_check.py` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `scripts/orchestration-diagnose.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/performance-check.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/pre-flight-check.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/prod-local-down.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/prod-local-up.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/proof_lead10_r01.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/proof_lead11.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/qa-runner.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/rag-contract-test.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/release/go-live.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/release/preflight.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/release/rollback.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/release/smoke-e2e.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/release/smoke.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/relentless-precision-scan.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/repro_orchestration_real.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/repro-orchestration.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/rseries-check.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/run-3-matrix-telemetry.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/run-mfai-flow.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/run-with-backend-telemetry.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/runs-memory-audit.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `scripts/s0_smoke_server.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/sign_project.py` — Scripts monorepo (verify, smoke, deploy).
- `scripts/smoke-test-final.js` — Scripts monorepo (verify, smoke, deploy).
- `scripts/sovereign-snapshot.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/sovereign-up.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/start_stack.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/test_import.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `scripts/testing/simulate-chaos.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/testing/simulate-load.js` — Scripts monorepo (verify, smoke, deploy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `scripts/verify-production.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/verify-server-env.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/write-integrity-check.js` — Scripts monorepo (verify, smoke, deploy).

</details>

<details>
<summary><strong>Autres fichiers (root / infra / configs)</strong> (696)</summary>

- `.agent/memory/agent_memory.json` — Fichier du monorepo (voir chemin).
- `.agent/rules/architect.glob.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/compliance.sentinel.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/context-optimization.global.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/defi.glob.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/model-hybrid.strategy.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/observability.log-sleuth.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/security.glob.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/self-healing.global.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/sovereign-audit.global.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/swarm-orchestration.manager.md` — Fichier du monorepo (voir chemin).
- `.agent/rules/visual-validation.glassmorphism.md` — Fichier du monorepo (voir chemin).
- `.agent/skills/creative-studio/SKILL.md` — Fichier du monorepo (voir chemin).
- `.agent/skills/defi-expert/SKILL.md` — Fichier du monorepo (voir chemin).
- `.agent/skills/depin-builder/SKILL.md` — Fichier du monorepo (voir chemin).
- `.agent/skills/impact-governance/SKILL.md` — Fichier du monorepo (voir chemin).
- `.agent/skills/security-sentinel/SKILL.md` — Fichier du monorepo (voir chemin).
- `.agent/skills/solana-architect/SKILL.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/clean-slate.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/debug-agent.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/generate-protocol-paper.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/seed-sovereign.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/ship-it.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/sovereign-status.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/verify_demo_mode.md` — Fichier du monorepo (voir chemin).
- `.agent/workflows/verify-compliance.md` — Fichier du monorepo (voir chemin).
- `.antigravity/rules/compliance.sentinel.global.md` — Fichier du monorepo (voir chemin).
- `.antigravity/rules/dependency-shield.global.md` — Fichier du monorepo (voir chemin).
- `.antigravity/rules/security-vault.global.md` — Fichier du monorepo (voir chemin).
- `.antigravity/skills/Log-Sleuth/SKILL.md` — Fichier du monorepo (voir chemin).
- `.antigravity/skills/Persistence-Guard/SKILL.md` — Fichier du monorepo (voir chemin).
- `.antigravity/skills/sovereign-maintenance/SKILL.md` — Fichier du monorepo (voir chemin).
- `.antigravity/skills/Web3-Solana-Sentinel/SKILL.md` — Fichier du monorepo (voir chemin).
- `.antigravity/skills/Zyno-Architect/SKILL.md` — Fichier du monorepo (voir chemin).
- `.antigravity/workflows/Audit-Commander.md` — Fichier du monorepo (voir chemin).
- `.antigravity/workflows/Persona-Switch.md` — Fichier du monorepo (voir chemin).
- `.antigravity/workflows/Testing-Pyramid.md` — Fichier du monorepo (voir chemin).
- `.antigravity/workflows/UX-Optimizer.md` — Fichier du monorepo (voir chemin).
- `.antigravity/workspace-context.json` — Fichier du monorepo (voir chemin).
- `.context/AUDIT.md` — Fichier du monorepo (voir chemin).
- `.context/MANUAL.md` — Fichier du monorepo (voir chemin).
- `.context/PROTOCOL_PAPER_V1.md` — Fichier du monorepo (voir chemin).
- `.context/README.md` — Fichier du monorepo (voir chemin).
- `.context/UI_GUIDELINES.md` — Fichier du monorepo (voir chemin).
- `.context/VIBE_PROTOCOLS.md` — Fichier du monorepo (voir chemin).
- `.deploy.env.bak_20260103_015403` — Fichier du monorepo (voir chemin).
- `.deploy.env.example` — Fichier du monorepo (voir chemin).
- `.env` — Fichier du monorepo (voir chemin).
- `.eslintignore` — Fichier du monorepo (voir chemin).
- `.github/copilot-instructions.md` — Fichier du monorepo (voir chemin).
- `.github/dependabot.yml` — Fichier du monorepo (voir chemin).
- `.github/ISSUE_TEMPLATE.md` — Fichier du monorepo (voir chemin).
- `.github/pull_request_template.md` — Fichier du monorepo (voir chemin).
- `.github/PULL_REQUEST_TEMPLATE.md` — Fichier du monorepo (voir chemin).
- `.gitignore` — Fichier du monorepo (voir chemin).
- `.hintrc` — Fichier du monorepo (voir chemin).
- `.husky/_/.gitignore` — Fichier du monorepo (voir chemin).
- `.husky/_/applypatch-msg` — Fichier du monorepo (voir chemin).
- `.husky/_/commit-msg` — Fichier du monorepo (voir chemin).
- `.husky/_/h` — Fichier du monorepo (voir chemin).
- `.husky/_/husky.sh` — Fichier du monorepo (voir chemin).
- `.husky/_/post-applypatch` — Fichier du monorepo (voir chemin).
- `.husky/_/post-checkout` — Fichier du monorepo (voir chemin).
- `.husky/_/post-commit` — Fichier du monorepo (voir chemin).
- `.husky/_/post-merge` — Fichier du monorepo (voir chemin).
- `.husky/_/post-rewrite` — Fichier du monorepo (voir chemin).
- `.husky/_/pre-applypatch` — Fichier du monorepo (voir chemin).
- `.husky/_/pre-auto-gc` — Fichier du monorepo (voir chemin).
- `.husky/_/pre-commit` — Fichier du monorepo (voir chemin).
- `.husky/_/pre-merge-commit` — Fichier du monorepo (voir chemin).
- `.husky/_/pre-push` — Fichier du monorepo (voir chemin).
- `.husky/_/pre-rebase` — Fichier du monorepo (voir chemin).
- `.husky/_/prepare-commit-msg` — Fichier du monorepo (voir chemin).
- `.husky/pre-commit` — Fichier du monorepo (voir chemin).
- `.secrets-backup/.env` — Fichier du monorepo (voir chemin).
- `.secrets-backup/.env.example` — Fichier du monorepo (voir chemin).
- `.secrets-backup/.env.local` — Fichier du monorepo (voir chemin).
- `.secrets-backup/.env.production` — Fichier du monorepo (voir chemin).
- `.secrets-backup/docs-.env.example` — Fichier du monorepo (voir chemin).
- `.secrets-backup/web.env.example` — Fichier du monorepo (voir chemin).
- `.serena/.gitignore` — Fichier du monorepo (voir chemin).
- `.serena/memories/audit-2025-11-16.md` — Fichier du monorepo (voir chemin).
- `.serena/memories/react-peer-warning.md` — Fichier du monorepo (voir chemin).
- `.serena/project.yml` — Fichier du monorepo (voir chemin).
- `.vscode/settings.json` — Fichier du monorepo (voir chemin).
- `.vscode/tasks.json` — Fichier du monorepo (voir chemin).
- `arborescence.txt` — Fichier du monorepo (voir chemin).
- `CHANGELOG.md` — Fichier du monorepo (voir chemin).
- `CONTRIBUTING.md` — Fichier du monorepo (voir chemin).
- `DEMO_QUICKSTART.md` — Fichier du monorepo (voir chemin).
- `docker-compose.audit.yml` — Docker Compose (dev/prod).
- `docker-compose.deploy.yml` — Docker Compose (dev/prod).
- `docker-compose.override.yml` — Docker Compose (dev/prod).
- `docker-compose.prod.yml` — Docker Compose (dev/prod).
- `docker-compose.yml` — Docker Compose (dev/prod).
- `docs/_source_of_truth/README.md` — Fichier du monorepo (voir chemin).
- `docs/_source_of_truth/RUNTIME_REALITY.md` — Fichier du monorepo (voir chemin).
- `docs/_source_of_truth/S0_SMOKE_RUNBOOK.md` — Fichier du monorepo (voir chemin).
- `docs/00_HOME.md` — Fichier du monorepo (voir chemin).
- `docs/acceptance/checklist.md` — Fichier du monorepo (voir chemin).
- `docs/acceptance/validation_plan.md` — Fichier du monorepo (voir chemin).
- `docs/AGENT_RUNS.md` — Fichier du monorepo (voir chemin).
- `docs/agents/AGENT_COVERAGE.md` — Fichier du monorepo (voir chemin).
- `docs/agents/PLANS_ACTIONS.md` — Fichier du monorepo (voir chemin).
- `docs/ANALYSIS_S2.1.md` — Fichier du monorepo (voir chemin).
- `docs/API_CONTRACT_MF_BACK.md` — Fichier du monorepo (voir chemin).
- `docs/ARCHITECTURE_DATA.md` — Fichier du monorepo (voir chemin).
- `docs/ARCHITECTURE_DIAGRAMS.md` — Fichier du monorepo (voir chemin).
- `docs/architecture_multi_agents.md` — Fichier du monorepo (voir chemin).
- `docs/ARCHITECTURE.md` — Fichier du monorepo (voir chemin).
- `docs/archive/audit.md` — Fichier du monorepo (voir chemin).
- `docs/archive/cahier_charges_agents.md` — Fichier du monorepo (voir chemin).
- `docs/archive/cahier_charges_demo_artefacts.md` — Fichier du monorepo (voir chemin).
- `docs/archive/cahier_charges_high_fidelity_simulation.md` — Fichier du monorepo (voir chemin).
- `docs/archive/cahier_charges_ressources_html.md` — Fichier du monorepo (voir chemin).
- `docs/archive/CERTIFICATION.md` — Fichier du monorepo (voir chemin).
- `docs/archive/checklist.md` — Fichier du monorepo (voir chemin).
- `docs/archive/COMPREHENSIVE_SONAR_AUDIT.md` — Fichier du monorepo (voir chemin).
- `docs/archive/contributing.md` — Fichier du monorepo (voir chemin).
- `docs/archive/DEPLOY_SERVER.md` — Fichier du monorepo (voir chemin).
- `docs/archive/DEPLOY.md` — Fichier du monorepo (voir chemin).
- `docs/archive/DEPLOYMENT_INSTRUCTIONS.md` — Fichier du monorepo (voir chemin).
- `docs/archive/FINAL_COMPLETE_AUDIT.md` — Fichier du monorepo (voir chemin).
- `docs/archive/FINAL_MASTERY_REPORT.md` — Fichier du monorepo (voir chemin).
- `docs/archive/FULL_AUDIT_REPORT.md` — Fichier du monorepo (voir chemin).
- `docs/archive/FULL_STACK_ALIGNMENT_REPORT.md` — Fichier du monorepo (voir chemin).
- `docs/archive/GUIDE_PLATFORM.md` — Fichier du monorepo (voir chemin).
- `docs/archive/Intégration Realms pour la DAO.md` — Fichier du monorepo (voir chemin).
- `docs/archive/MVP_STATUS.md` — Fichier du monorepo (voir chemin).
- `docs/archive/PROJECT_KNOWLEDGE_BASE.md` — Fichier du monorepo (voir chemin).
- `docs/archive/README.qa.md` — Fichier du monorepo (voir chemin).
- `docs/archive/RELEASE_CANDIDATE_V1.0.md` — Fichier du monorepo (voir chemin).
- `docs/archive/RELEASE_SUMMARY.md` — Fichier du monorepo (voir chemin).
- `docs/archive/RESUME_REVUE_FINALE.md` — Fichier du monorepo (voir chemin).
- `docs/archive/REVUE_CODE_AUDIT.md` — Fichier du monorepo (voir chemin).
- `docs/archive/task.md` — Fichier du monorepo (voir chemin).
- `docs/archive/TEST_PLAN.md` — Fichier du monorepo (voir chemin).
- `docs/archive/TODO_CLEANUP.md` — Fichier du monorepo (voir chemin).
- `docs/archive/WORKFLOW_MATRIX.md` — Fichier du monorepo (voir chemin).
- `docs/archive/ZERO_DEFECT_DEPLOYMENT_REPORT.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/AMELIORATIONS_APPLIQUEES.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/audit_11_12_25.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/SYNTHESE_AUDIT_CORRECTIONS.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/VERIFICATION_FINALE_AUDIT.md` — Fichier du monorepo (voir chemin).
- `docs/audit/AUDIT_FINDINGS.md` — Fichier du monorepo (voir chemin).
- `docs/audit/audit_report.md` — Fichier du monorepo (voir chemin).
- `docs/audit/AUDITOR_STATEMENT.md` — Fichier du monorepo (voir chemin).
- `docs/audit/EVIDENCE_MAP.md` — Fichier du monorepo (voir chemin).
- `docs/audit/ISO_DORA_EVIDENCE.md` — Fichier du monorepo (voir chemin).
- `docs/audit/PRE_AUDIT_ISO27001_DORA.md` — Fichier du monorepo (voir chemin).
- `docs/audit/SOC2_SIMULATED_AUDIT.md` — Fichier du monorepo (voir chemin).
- `docs/AUTH_FLOWS.md` — Fichier du monorepo (voir chemin).
- `docs/cicd/pipeline.md` — Fichier du monorepo (voir chemin).
- `docs/cicd/rollback.md` — Fichier du monorepo (voir chemin).
- `docs/CONTRIBUTEURS.md` — Fichier du monorepo (voir chemin).
- `docs/dataroom/INDEX.md` — Fichier du monorepo (voir chemin).
- `docs/dataroom/INVESTOR_SUMMARY.md` — Fichier du monorepo (voir chemin).
- `docs/demo_script.md` — Fichier du monorepo (voir chemin).
- `docs/demo/fallbacks.md` — Fichier du monorepo (voir chemin).
- `docs/demo/script.md` — Fichier du monorepo (voir chemin).
- `docs/DEPENDENCIES_JOURNEY_SIMULATOR.md` — Fichier du monorepo (voir chemin).
- `docs/GOLDEN_PATH_DEMO.md` — Fichier du monorepo (voir chemin).
- `docs/HEALTHCHECK.md` — Fichier du monorepo (voir chemin).
- `docs/idl/solana_devnet_flow.md` — Fichier du monorepo (voir chemin).
- `docs/INVESTOR_DEMO_FLOW.md` — Fichier du monorepo (voir chemin).
- `docs/journey_mfai_back_front.code-workspace` — Fichier du monorepo (voir chemin).
- `docs/JOURNEY_STATE_MACHINE.md` — Fichier du monorepo (voir chemin).
- `docs/journeys/JOURNEY_AGENT_MAP.md` — Fichier du monorepo (voir chemin).
- `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` — Fichier du monorepo (voir chemin).
- `docs/legal/SAAS_CONTRACT_APPENDIX.md` — Fichier du monorepo (voir chemin).
- `docs/MAINTENANCE.md` — Fichier du monorepo (voir chemin).
- `docs/MCP_RUNBOOK_FR.md` — Fichier du monorepo (voir chemin).
- `docs/MCP_SETUP_FR.md` — Fichier du monorepo (voir chemin).
- `docs/MOBILE_WALLET_TESTING.md` — Fichier du monorepo (voir chemin).
- `docs/MONOREPO_DX.md` — Fichier du monorepo (voir chemin).
- `docs/next_steps_ui_rework.md` — Fichier du monorepo (voir chemin).
- `docs/observability/grafana/GRAFANA_DASHBOARD.json` — Fichier du monorepo (voir chemin).
- `docs/observability/grafana/README.md` — Fichier du monorepo (voir chemin).
- `docs/observability/METRICS_MODEL.md` — Fichier du monorepo (voir chemin).
- `docs/observability/metrics.md` — Fichier du monorepo (voir chemin).
- `docs/onboarding/quickstart.md` — Fichier du monorepo (voir chemin).
- `docs/openapi/journey-simulator.yaml` — Fichier du monorepo (voir chemin).
- `docs/openapi/mf-back.openapi.yaml` — Fichier du monorepo (voir chemin).
- `docs/openapi/preview.html` — Fichier du monorepo (voir chemin).
- `docs/ops/DEPLOY_HARDENING.md` — Fichier du monorepo (voir chemin).
- `docs/ops/ENV_VARIABLES_CHECKLIST.md` — Fichier du monorepo (voir chemin).
- `docs/ops/FINAL_RELEASE_REPORT.md` — Fichier du monorepo (voir chemin).
- `docs/ops/GO_LIVE_CHECKLIST.md` — Fichier du monorepo (voir chemin).
- `docs/ops/INCIDENT_MATRIX.md` — Fichier du monorepo (voir chemin).
- `docs/ops/RUNBOOK_PROD.md` — Fichier du monorepo (voir chemin).
- `docs/PLATFORM_DEEP_DIVE_FR.md` — Fichier du monorepo (voir chemin).
- `docs/process/DoR_DoD.md` — Fichier du monorepo (voir chemin).
- `docs/product/cahier_TOC.md` — Fichier du monorepo (voir chemin).
- `docs/product/vision_mvp_personas_stories.md` — Fichier du monorepo (voir chemin).
- `docs/prompts/evaluator.md` — Fichier du monorepo (voir chemin).
- `docs/prompts/zyno.md` — Fichier du monorepo (voir chemin).
- `docs/QUALITY_EVIDENCE.md` — Fichier du monorepo (voir chemin).
- `docs/releases/CHANGELOG.md` — Fichier du monorepo (voir chemin).
- `docs/releases/RELEASE_CHECKLIST.md` — Fichier du monorepo (voir chemin).
- `docs/releases/RELEASE_v1.0.md` — Fichier du monorepo (voir chemin).
- `docs/risk_register.md` — Fichier du monorepo (voir chemin).
- `docs/roadmap/vNext.md` — Fichier du monorepo (voir chemin).
- `docs/S2.2_DELIVERY.md` — Fichier du monorepo (voir chemin).
- `docs/S2.3_DELIVERY.md` — Fichier du monorepo (voir chemin).
- `docs/S2.4_DELIVERY.md` — Fichier du monorepo (voir chemin).
- `docs/schemas/README.md` — Fichier du monorepo (voir chemin).
- `docs/SECURITY.md` — Fichier du monorepo (voir chemin).
- `docs/security/CHECKLISTS_SECURITY.md` — Fichier du monorepo (voir chemin).
- `docs/security/compliance_check.md` — Fichier du monorepo (voir chemin).
- `docs/security/COMPLIANCE_TRACEABILITY.md` — Fichier du monorepo (voir chemin).
- `docs/security/hardening.md` — Fichier du monorepo (voir chemin).
- `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` — Fichier du monorepo (voir chemin).
- `docs/solana_spec.md` — Fichier du monorepo (voir chemin).
- `docs/system_blueprint.md` — Fichier du monorepo (voir chemin).
- `docs/testing/CHAOS_PLAN.md` — Fichier du monorepo (voir chemin).
- `docs/testing/LOAD_TEST_PLAN.md` — Fichier du monorepo (voir chemin).
- `docs/testing/RESILIENCE_REPORT.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/CAHIER_CHARGES_UI_UX.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/ab_toasts.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/erreur_rollback.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/escalade_alertes.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/ab_toasts.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/erreur_rollback.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/escalade_alertes.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/flux_principal.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/hierarchie_composants.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/persona_journey_blocks.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/slo_alertes.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/ui_trinity.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/exports/web3_flow.png` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/flux_principal.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/hierarchie_composants.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/persona_journey_blocks.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/slo_alertes.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/ui_trinity.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/diagrams/web3_flow.mmd` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/MERMAIDCHART_GUIDE.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/README.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_AUDIT_REPORT_V2.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_COMPONENT_LIBRARY.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_DESIGN_GUIDE.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_DIAGRAMS.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_INDEX.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_QUICK_START.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_TECHNICAL_REFERENCE.md` — Fichier du monorepo (voir chemin).
- `docs/ui-ux/UI_UX_USER_FLOWS.md` — Fichier du monorepo (voir chemin).
- `docs/WEB3_INTEGRATION.md` — Fichier du monorepo (voir chemin).
- `docs/zyno_interaction_improvement.md` — Fichier du monorepo (voir chemin).
- `ecosystem.config.cjs` — Fichier du monorepo (voir chemin).
- `env.example` — Fichier du monorepo (voir chemin).
- `journey-simulator/.dockerignore` — Fichier du monorepo (voir chemin).
- `journey-simulator/.env.local` — Fichier du monorepo (voir chemin).
- `journey-simulator/.eslintignore` — Fichier du monorepo (voir chemin).
- `journey-simulator/.eslintrc.cjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/.github/workflows/ci.yml` — Fichier du monorepo (voir chemin).
- `journey-simulator/.github/workflows/release.yml` — Fichier du monorepo (voir chemin).
- `journey-simulator/.gitignore` — Fichier du monorepo (voir chemin).
- `journey-simulator/.storybook/main.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/.storybook/preview.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/.vscode/settings.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/.vscode/tasks.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/components.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/cypress.config.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `journey-simulator/cypress/e2e/navigation.cy.js` — Tests Cypress (optionnel/legacy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / de
- `journey-simulator/cypress/support/commands.js` — Tests Cypress (optionnel/legacy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Cy
- `journey-simulator/cypress/support/index.js` — Tests Cypress (optionnel/legacy). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/Dockerfile` — Dockerfile (build image).
- `journey-simulator/env.example` — Fichier du monorepo (voir chemin).
- `journey-simulator/FROZEN_README.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/global-setup.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/index.html` — Fichier du monorepo (voir chemin).
- `journey-simulator/integration_guide_journey.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/LICENSE` — Fichier du monorepo (voir chemin).
- `journey-simulator/nginx.conf` — Fichier du monorepo (voir chemin).
- `journey-simulator/package-lock.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/package.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/playwright.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/playwright.prod.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/postcss.config.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `journey-simulator/README.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-agents-registry.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-api-surface.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-file-index.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-phases-table.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-steps-by-journey.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/simulate-demo-flow.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/smoke-test.sh` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/update-readme-autogen.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/tailwind.config.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/todo_refonte_frontend_zyno.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/tsconfig.e2e.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/tsconfig.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/tsconfig.node.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/vite.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `journey-simulator/vite.config.ts.timestamp-1768940033633-5982f8f31a674.mjs` — Fichier du monorepo (voir chemin). Note: vite.config.ts
- `journey-simulator/vitest.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `LICENSE` — Fichier du monorepo (voir chemin).
- `Makefile` — Fichier du monorepo (voir chemin).
- `mcp.json` — Fichier du monorepo (voir chemin).
- `mf-back/__fixtures__/golden/composite_intent.json` — Fichier du monorepo (voir chemin).
- `mf-back/__fixtures__/golden/cost_block.json` — Fichier du monorepo (voir chemin).
- `mf-back/__fixtures__/golden/demo_mode.json` — Fichier du monorepo (voir chemin).
- `mf-back/__fixtures__/golden/preset_audit_dao.json` — Fichier du monorepo (voir chemin).
- `mf-back/__fixtures__/golden/quota_warn.json` — Fichier du monorepo (voir chemin).
- `mf-back/__fixtures__/golden/simple_intent.json` — Fichier du monorepo (voir chemin).
- `mf-back/__fixtures__/golden/web3_block.json` — Fichier du monorepo (voir chemin).
- `mf-back/.dockerignore` — Fichier du monorepo (voir chemin).
- `mf-back/.env` — Fichier du monorepo (voir chemin).
- `mf-back/.env.production` — Fichier du monorepo (voir chemin).
- `mf-back/.gitignore` — Fichier du monorepo (voir chemin).
- `mf-back/docker-entrypoint.sh` — Fichier du monorepo (voir chemin).
- `mf-back/Dockerfile` — Dockerfile (build image).
- `mf-back/docs/backend-architecture.md` — Fichier du monorepo (voir chemin).
- `mf-back/docs/knowledge_base/solana_fees.md` — Fichier du monorepo (voir chemin).
- `mf-back/env.development.example` — Fichier du monorepo (voir chemin).
- `mf-back/env.example` — Fichier du monorepo (voir chemin).
- `mf-back/env.production.example` — Fichier du monorepo (voir chemin).
- `mf-back/FROZEN_README.md` — Fichier du monorepo (voir chemin).
- `mf-back/jest.config.cjs` — Fichier du monorepo (voir chemin).
- `mf-back/nodemon.json` — Fichier du monorepo (voir chemin).
- `mf-back/package-lock.json` — Fichier du monorepo (voir chemin).
- `mf-back/package.json` — Fichier du monorepo (voir chemin).
- `mf-back/prisma/schema.prisma` — Fichier du monorepo (voir chemin). Note: schema.prisma - MFAI Unified PostgreSQL Schema
- `mf-back/README.md` — Fichier du monorepo (voir chemin).
- `mf-back/src/__tests__/demoRoutes.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/src/agents/agent_template.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/src/agents/agentContract.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Ag
- `mf-back/src/agents/AgentFactory.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/agentUtils.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / fu
- `mf-back/src/agents/AnalyticsAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/APIContractAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/ArchitectAgent.ts` — Fichier du monorepo (voir chemin). Note: ArchitectAgent - Technical Architecture Specialist Project: Money Factory AI (MFAI) / import BaseAgent from './BaseAgent'; interface AgentCo
- `mf-back/src/agents/AuditAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/BaseAgent.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) BaseAgent - TypeScript/Prisma Version Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISS
- `mf-back/src/agents/BuilderAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/CFOAgent.ts` — Fichier du monorepo (voir chemin). Note: CFOAgent - Financial Strategy & Tokenomics Specialist Project: Money Factory AI (MFAI) / import BaseAgent from './BaseAgent'; interface Agen
- `mf-back/src/agents/CoachAgent.js` — Fichier du monorepo (voir chemin).
- `mf-back/src/agents/CommunityAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/ComplianceAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/CurriculumAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/DAOAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/DataIntegrityAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/DeFiAgent.js` — Fichier du monorepo (voir chemin).
- `mf-back/src/agents/DesignAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/DevAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/DevOpsAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/EducationAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/EngineerAgent.ts` — Fichier du monorepo (voir chemin). Note: EngineerAgent - Smart Contract & Backend Engineering Specialist Project: Money Factory AI (MFAI) / import BaseAgent from './BaseAgent'; inte
- `mf-back/src/agents/EvaluationAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/extended/registry-extra.js` — Fichier du monorepo (voir chemin).
- `mf-back/src/agents/GovernanceAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/GovernanceDAOAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/GrowthAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/GuideAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/HubAgent.js` — Fichier du monorepo (voir chemin).
- `mf-back/src/agents/InvestorAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/InvestorDemoAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/JourneyDesignAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/LaunchpadAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/MarketplaceAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/MintingAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/NFTAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/ObservabilityAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/OnboardingAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/PerformanceAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/PitchAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/ProductAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/ProductSpecAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/prompts.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/ProtocolAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/QAPlaywrightAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/RAGOpsAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / cl
- `mf-back/src/agents/ReflectionAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/registry.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/RiskFraudAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/SecurityAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/SecurityAuditAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/SolanaAnchorAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/telemetryUtils.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / 'u
- `mf-back/src/agents/TokenAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/TokenomicsAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/UXWritingAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/WalletAuthAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/Web3LegalAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/agents/ZynoAgent.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/app.ts` — Fichier du monorepo (voir chemin). Note: MFAI Backend - Main Application Entry Point TypeScript/Prisma Professional Architecture / import express, { Application, Request, Response, 
- `mf-back/src/config/database.ts` — Fichier du monorepo (voir chemin). Note: Prisma Client Singleton Single source of truth for database access / import { PrismaClient } from '@prisma/client'; declare global { var pri
- `mf-back/src/constants/project_schemas.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/controllers/agent.controller.ts` — Fichier du monorepo (voir chemin). Note: Agent Controller - Express routes for agent interactions Replaces Mongoose-based logic with Prisma/PostgreSQL / import { Request, Response }
- `mf-back/src/controllers/auth.controller.ts` — Fichier du monorepo (voir chemin). Note: Auth Controller - TypeScript/Prisma / import { Request, Response } from 'express'; import jwt from 'jsonwebtoken'; import { prisma } from '.
- `mf-back/src/controllers/health.controller.ts` — Fichier du monorepo (voir chemin). Note: Health Controller - TypeScript/Prisma / import { Request, Response } from 'express'; import { prisma } from '../config/database'; export con
- `mf-back/src/controllers/user.controller.ts` — Fichier du monorepo (voir chemin). Note: User Controller - TypeScript/Prisma / import { Request, Response } from 'express'; import jwt from 'jsonwebtoken'; import crypto from 'crypt
- `mf-back/src/llm/OpenAIClient.ts` — Fichier du monorepo (voir chemin). Note: OpenAI Client - TypeScript/Production Ready with Fallback Mode Project: Money Factory AI (MFAI) / import OpenAI from 'openai'; // Types expo
- `mf-back/src/metrics/computeAEPO.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / fu
- `mf-back/src/middleware/auth.ts` — Fichier du monorepo (voir chemin). Note: Authentication Middleware / import { Request, Response, NextFunction } from 'express'; import jwt from 'jsonwebtoken'; import { prisma } fro
- `mf-back/src/middleware/errorHandler.ts` — Fichier du monorepo (voir chemin). Note: Global Error Handler Middleware Handles Prisma errors and other exceptions / import { Request, Response, NextFunction } from 'express'; impo
- `mf-back/src/orchestration/actionToolMapper.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/agentProtocol.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/agentsRegistry.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / mo
- `mf-back/src/orchestration/alertingEngine.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/artifactStore.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/auditTrailStore.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/circuitBreaker.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/concurrencyManager.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/costModel.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/degradationPolicy.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/executionEngine.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Dr
- `mf-back/src/orchestration/executionGate.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/idempotencyStore.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/intentRouter.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/journey-tasks.json` — Fichier du monorepo (voir chemin).
- `mf-back/src/orchestration/killSwitch.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/llmCache.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/llmClient.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/memoryStore.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / In
- `mf-back/src/orchestration/metricsStore.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/presets/audit-dao.json` — Fichier du monorepo (voir chemin).
- `mf-back/src/orchestration/presets/investor-diligence.json` — Fichier du monorepo (voir chemin).
- `mf-back/src/orchestration/presets/product-onboarding.json` — Fichier du monorepo (voir chemin).
- `mf-back/src/orchestration/productionGuards.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/ragClient.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/ragPolicy.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/runtimeMode.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/secretsPolicy.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/services/executionService.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/services/logicCheckService.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/services/ragService.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/services/scoringService.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/services/validationService.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/sloExporter.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/sloRegistry.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/specializedValidators.js` — Fichier du monorepo (voir chemin). Note: Specialized Validators for MFAI - Relentless Precision Edition Enforces R3: State Truth & Mathematical Integrity. / const specializedValidat
- `mf-back/src/orchestration/telemetryAdapter.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Te
- `mf-back/src/orchestration/tenantQuotaRegistry.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/timelineSanitizer.js` — Fichier du monorepo (voir chemin).
- `mf-back/src/orchestration/timeoutGuard.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Pr
- `mf-back/src/orchestration/toolsRegistry.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/src/orchestration/vsliceSchema.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/web3Guards.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/src/orchestration/web3Pipeline.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/orchestration/workflowMap.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/src/orchestration/zynoOrchestrator.js` — Fichier du monorepo (voir chemin). Note: 🔁 Zyno Orchestrator (Hardened - Relentless Precision + Sub-Step Engine)
- `mf-back/src/orchestration/zynoVerticalSlice.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/rag/rag_client.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/src/rag/ragClient.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/src/routes/agent.routes.ts` — Fichier du monorepo (voir chemin). Note: Agent Routes - Express routes for AI agent interactions Uses Zod for request validation / import { Router, Request, Response, NextFunction }
- `mf-back/src/routes/auth.routes.ts` — Fichier du monorepo (voir chemin). Note: Auth Routes - TypeScript / import { Router } from 'express'; import * as authController from '../controllers/auth.controller'; const router 
- `mf-back/src/routes/health.routes.ts` — Fichier du monorepo (voir chemin). Note: Health Routes - TypeScript / import { Router } from 'express'; import * as healthController from '../controllers/health.controller'; const r
- `mf-back/src/routes/index.routes.ts` — Fichier du monorepo (voir chemin). Note: Index Routes - TypeScript / import { Router, Request, Response } from 'express'; const router = Router(); router.get('/', (_req: Request, re
- `mf-back/src/routes/journey.routes.ts` — Fichier du monorepo (voir chemin). Note: Journey Routes - Demo endpoints / import { Router, Request, Response } from 'express'; const router = Router(); // Demo bootstrap payload — 
- `mf-back/src/routes/user.routes.ts` — Fichier du monorepo (voir chemin). Note: User Routes - TypeScript / import { Router } from 'express'; import rateLimit from 'express-rate-limit'; import { protect, adminOnly } from 
- `mf-back/src/scripts/audit-db-integrity.ts` — Fichier du monorepo (voir chemin). Note: Database Integrity Audit Script Verifies that agent sessions and messages are properly stored Project: Money Factory AI (MFAI) / import { Pr
- `mf-back/src/scripts/test-agent-init.ts` — Fichier du monorepo (voir chemin). Note: Smoke Test: Agent Initialization Verifies that agents can be loaded without mongoose/models errors / import { PrismaClient } from '@prisma/c
- `mf-back/src/scripts/test-real-llm.ts` — Fichier du monorepo (voir chemin). Note: Test Real LLM - Validates actual OpenAI integration Project: Money Factory AI (MFAI) / import ArchitectAgent from '../agents/ArchitectAgent'
- `mf-back/src/server.ts` — Fichier du monorepo (voir chemin). Note: MFAI Backend - Server Entry Point / import { prisma } from './config/database'; import { startServer } from './app'; // Handle graceful shut
- `mf-back/src/services/agent_memory.ts` — Fichier du monorepo (voir chemin). Note: Agent Memory Service - Prisma Version In-memory + PostgreSQL persistence for agent state / import { PrismaClient } from '@prisma/client'; co
- `mf-back/src/services/AgentMemoryService.ts` — Fichier du monorepo (voir chemin). Note: AgentMemoryService - Central Brain for MFAI Agents Manages conversation state and context via Prisma/PostgreSQL / import { PrismaClient, Age
- `mf-back/src/types/express.d.ts` — Fichier du monorepo (voir chemin). Note: Express Request Type Extensions / import { User } from '@prisma/client'; declare global { namespace Express { interface Request { user?: Use
- `mf-back/src/utils/aepoAeco.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / AE
- `mf-back/src/utils/agent-idempotence.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Agent Idempotence Utilities - Prisma Version Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BEL
- `mf-back/src/utils/computeAEPO.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/src/utils/llmLogger.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / LL
- `mf-back/src/utils/logger.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/utils/openaiClient.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/utils/resourceValidator.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/src/utils/solana.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/test-dao-backend.sh` — Fichier du monorepo (voir chemin).
- `mf-back/test-demo-mode.sh` — Fichier du monorepo (voir chemin).
- `mf-back/tests/admin.rag.e2e.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/agent-idempotence.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/agent-runs.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/tests/agents.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/agents/agentsImpl.e2e-lite.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/baseAgent_resilience.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/cache-key.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/controllers.spec.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/tests/demoMission.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / 'u
- `mf-back/tests/e2e/orchestration.e2e.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/tests/e2e/orchestrator_with_feedback.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/exec/actionToolMapper.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/exec/toolsRegistry.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/feedback.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / @f
- `mf-back/tests/fixtures/demo_mission.json` — Fichier du monorepo (voir chemin).
- `mf-back/tests/full_pipeline_resilience.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/golden/goldenOutputs.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/growth_tokenomics_conflict.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/integration/multiAgentFeedback.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/integration/resourceValidator.integration.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/intentRouter.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/journey-metrics.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/tests/journey-state.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/journeyController.step.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/manual_rag.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/memory_persistence.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/orchestrator_history_window.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/parcoursTemplates.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/ragClient.fallback.integration.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/ragClient.remote.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/ragClient.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/ragops_strict_grounding.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/registry.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/reproduce_quiz_error.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/routes.admin.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/tests/routes.dao.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/tests/routes.export.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/tests/routes.orchestration.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/tests/routes.supertest.spec.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / pr
- `mf-back/tests/runtimeMode.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/s2_api.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/s2_evaluation.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/s2_logic.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/s2_models.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/setup.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / te
- `mf-back/tests/sloExporter.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/unit/BaseAgent.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/unit/computeAEPO.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/unit/consortium_simulation.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/journeyController.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/unit/nft_verification.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/unit/orchestrator_collision.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/unit/phase4-contracts.test.js` — Fichier du monorepo (voir chemin). Note: Force production mode to load ALL 45+ agents for Action G verification
- `mf-back/tests/unit/phase5_rag_contract.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/phase6_llm_failure.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/phase6_rag_failure.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/phase6_rate_limit.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/phase6_timeout.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/phaseTestnetV0_onchain_disabled.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/phaseTestnetV0_web3_agents_sim_only.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/resourceValidator.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/unit/specializedValidators.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/user-guardrails.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `mf-back/tests/verify_phase_mapping.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/verticalSliceOrchestration.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / le
- `mf-back/tests/wallet-auth.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `mf-back/tests/web3/web3Pipeline.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/workflows/workflowPhases.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tests/zynoOrchestrator.test.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / re
- `mf-back/tools/audit_bonding_curve_stress.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / Bo
- `mf-back/tools/audit_reward_mechanics.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `mf-back/tsconfig.json` — Fichier du monorepo (voir chemin).
- `package-lock.json` — Fichier du monorepo (voir chemin).
- `package.json` — Fichier du monorepo (voir chemin).
- `sonar-project.properties` — Fichier du monorepo (voir chemin).
- `start.sh` — Fichier du monorepo (voir chemin).
- `tools/audit_csrf_strict.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/audit_memory_growth.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/audit_router_ambiguity.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/audit_tokenomics_resilience.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/audit_tokenomics_stress.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/mcp/fetch-server.mjs` — Fichier du monorepo (voir chemin).
- `tools/mcp/filesystem-ro.mjs` — Fichier du monorepo (voir chemin).
- `tools/mcp/git-server.mjs` — Fichier du monorepo (voir chemin).
- `tools/produce_evidence.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/produce_supreme_evidence.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/security_probe.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tools/system-health.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / #!
- `tools/verify_memory_depth.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `tous_les_markdowns.txt` — Fichier du monorepo (voir chemin).
- `ui-e2e/index.html` — Fichier du monorepo (voir chemin).
- `web/.dockerignore` — Fichier du monorepo (voir chemin).
- `web/.env` — Fichier du monorepo (voir chemin).
- `web/.eslintrc.json` — Fichier du monorepo (voir chemin).
- `web/.github/workflows/ci.yml` — Fichier du monorepo (voir chemin).
- `web/.gitignore` — Fichier du monorepo (voir chemin).
- `web/.nvmrc` — Fichier du monorepo (voir chemin).
- `web/.prettierrc` — Fichier du monorepo (voir chemin).
- `web/app/api/agents/logs/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/ai/echo/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/auth/nonce/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/auth/siws/challenge/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/auth/siws/verify/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/auth/verify/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/dao/vote/simulate/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/health/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/healthz/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/integrations/collaterize/simulate/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/journeys/[id]/state/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/journeys/[id]/step/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/journeys/[id]/submit/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/journeys/audit/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/journeys/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/metadata/pass/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/metadata/proof-of-skill/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/metrics/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/mint/execute/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/mint/last/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/mint/simulate/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/mint/status/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/pass/check/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/rag/doc/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/rag/ingest-batch/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/rag/ingest/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/rag/query/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/rag/search/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/stake/simulate/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/api/tx/prepare/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/global-error.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / 'u
- `web/app/globals.css` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / @t
- `web/app/instrumentation.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `web/app/journey/user-progress/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/layout.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/page.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / /*
- `web/app/user/login/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/user/logout/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/user/profile/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/user/refresh/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/app/user/register/route.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/cache/config.json` — Fichier du monorepo (voir chemin).
- `web/CHANGELOG.md` — Fichier du monorepo (voir chemin).
- `web/deploy/nginx/next.conf.sample` — Fichier du monorepo (voir chemin).
- `web/deploy/systemd/journey-web.service` — Fichier du monorepo (voir chemin).
- `web/Dockerfile` — Dockerfile (build image).
- `web/e2e/basic.spec.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/env.example` — Fichier du monorepo (voir chemin).
- `web/jest.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/jest.setup.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/middleware.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/minter.json` — Fichier du monorepo (voir chemin).
- `web/next-env.d.ts` — Fichier du monorepo (voir chemin). Note: / <reference types="next" />
- `web/next.config.mjs` — Fichier du monorepo (voir chemin).
- `web/package-lock.json` — Fichier du monorepo (voir chemin).
- `web/package.json` — Fichier du monorepo (voir chemin).
- `web/packages/agents/orchestrator/index.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `web/packages/agents/patterns/safety.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `web/packages/agents/tools/solana.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/playwright.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/postcss.config.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `web/prisma/migrations/20251118155543_add_agentlog_user_idx/migration.sql` — Fichier du monorepo (voir chemin).
- `web/prisma/migrations/migration_lock.toml` — Fichier du monorepo (voir chemin).
- `web/prisma/schema.prisma` — Fichier du monorepo (voir chemin). Note: schema.prisma - MFAI Unified PostgreSQL Schema
- `web/prisma/seed.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/public/grid.svg` — Fichier du monorepo (voir chemin).
- `web/public/openapi.yaml` — Fichier du monorepo (voir chemin).
- `web/README.md` — Fichier du monorepo (voir chemin).
- `web/scripts/check-minter-balance.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/scripts/check-minter-status.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/scripts/gen-minter.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/scripts/run-mint-worker.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `web/sentry.client.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/server/metrics.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `web/server/signer.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/agents.orchestrator.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.ai.echo.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.collaterize.logic.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.health.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.journeys.state.logs.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.journeys.step.actionId.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.journeys.step.audit.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.journeys.step.bad.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / de
- `web/src/__tests__/api.journeys.step.llm.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.journeys.step.replay.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.journeys.submit.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.journeys.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.metrics.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.mint.execute.error.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / je
- `web/src/__tests__/api.mint.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.misc.coverage.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.rag.batch.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.rag.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.siws.redis.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/api.tx.prepare.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/embeddings.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/walletProvider.test.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/__tests__/worker.mint.test.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/components/Artifacts/ArtifactModal.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/components/Artifacts/NeuralOverlay.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/components/AuthProvider.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / 'u
- `web/src/components/Journey/UIBlocksRenderer.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / 'u
- `web/src/components/WalletProvider.tsx` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / 'u
- `web/src/hooks/useAuth.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/infra/openaiConfig.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `web/src/lib/prisma.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/lib/solana/checkPassOnChain.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `web/src/mocks/handlers.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/mocks/msw-node.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / fu
- `web/src/mocks/msw.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / co
- `web/src/mocks/server.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/mocks/setup.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/mocks/until-async.js` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / mo
- `web/src/server/db.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/server/demoArtifacts.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/server/embeddings.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `web/src/server/journeyStepResponse.schema.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `web/src/server/logger.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ex
- `web/src/server/metrics.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / /*
- `web/src/server/queue.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/server/ragStore.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/server/rateLimit.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / /*
- `web/src/server/redis.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/server/signer.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / //
- `web/src/server/siwsStore.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/src/server/state.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ty
- `web/src/server/zyno.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / ty
- `web/src/workers/mintWorker.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/tailwind.config.ts` — Fichier du monorepo (voir chemin). Note: Project: Money Factory AI (MFAI) Status: Production Ready - 2026 Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA / im
- `web/tsconfig.json` — Fichier du monorepo (voir chemin).

</details>

<!-- END AUTO-GENERATED: file-index -->



---

## 🔌 API surface index (auto-généré)

<a id="api-surface-index"></a>

Cette section liste **toutes les routes** côté frontend et **tous les endpoints** côté backend (en tenant compte des `app.use(mount, router)`), afin d’éviter que des routes restent implicites.

- Générateur : `journey-simulator/scripts/generate-api-surface.mjs`
- Commande :

```bash
# Depuis journey-simulator/
npm run generate:api-surface
```

<!-- BEGIN AUTO-GENERATED: api-surface -->

> Index auto-généré des surfaces API: routes frontend + endpoints backend.

Commande: `node journey-simulator/scripts/generate-api-surface.mjs`

### Routes frontend (React Router)

| Route | Protégée (auth) | Source |
|---|---|---|
| `/` | — | `journey-simulator/src/App.tsx` |
| `/*` | — | `journey-simulator/src/App.tsx` |
| `/dao` | — | `journey-simulator/src/App.tsx` |
| `/dashboard` | ✅ | `journey-simulator/src/App.tsx` |
| `/debug/mint` | — | `journey-simulator/src/App.tsx` |
| `/guide` | ✅ | `journey-simulator/src/App.tsx` |
| `/journeys` | — | `journey-simulator/src/App.tsx` |
| `/journeys/:journeyId` | — | `journey-simulator/src/App.tsx` |
| `/journeys/completed` | — | `journey-simulator/src/App.tsx` |
| `/journeys/demo` | — | `journey-simulator/src/App.tsx` |
| `/journeys/demo/:journeyId` | — | `journey-simulator/src/App.tsx` |
| `/login` | — | `journey-simulator/src/App.tsx` |
| `/playground` | ✅ | `journey-simulator/src/App.tsx` |
| `/register` | — | `journey-simulator/src/App.tsx` |
| `/resources` | ✅ | `journey-simulator/src/App.tsx` |
| `/support` | ✅ | `journey-simulator/src/App.tsx` |
| `/zyno` | ✅ | `journey-simulator/src/App.tsx` |

### Endpoints backend (Express)

| Method | Path | Source (route file) |
|---|---|---|
| `MOUNT` | `/` | `mf-back/app.js (mount indexRoutes)` |
| `MOUNT` | `/api/agents` | `mf-back/app.js (mount agentRoutes)` |
| `MOUNT` | `/auth` | `mf-back/app.js (mount authRoutes)` |
| `MOUNT` | `/journey` | `mf-back/app.js (mount journeyRoutes)` |
| `MOUNT` | `/user` | `mf-back/app.js (mount userRoutes)` |

### Notes (cohérence)

- Cet index reflète **le câblage actuel** (mounts dans `mf-back/app.js`).
- Si une route semble “doublée” (ex: `/orchestration/orchestration`), cela indique un **mismatch** entre le `mount` et le `router.*("/...")` dans le fichier de routes.

<!-- END AUTO-GENERATED: api-surface -->


## 🧩 Component Architecture

Description structurée des composants React majeurs : rôle, responsabilités, et points de connection (stores, context, API).

### Core Components

Les composants ci-dessous constituent le “squelette” de l’app : routeur, page principale, affichage progression, et connection wallet.

#### App.tsx

**Purpose**: Main application orchestrator
**Responsibilities**:

- Route management
- Global layout
- Context providers
- Modal management

```typescript
function App() {
  const { isDark } = useThemeStore()
  const { selectedPersona } = useJourneyStore()

  return (
    <WalletContextProvider>
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <Header />
        <WalletConnectionBanner />
        <SkillchainBanner />
        <main>
          {!selectedPersona && <HeroSection />}
          <JourneysPage />
          {!selectedPersona && <AccessPassHolders />}
        </main>
        <Footer />
        <JourneyModal />
        <ZynoAssistant />
      </div>
    </WalletContextProvider>
  )
}
```

#### JourneysPage.tsx

**Purpose**: Main journey interface
**Responsibilities**:

- Persona selection
- Journey timeline display
- Phase management
- Progress tracking

**Key Features**:

- Dynamic persona switching
- Real-time progress updates
- Modal management for phases
- NFT minting integration

#### SkillchainCard.tsx

**Purpose**: Interactive progress visualization
**Responsibilities**:

- User progress display
- 3D flip animation
- Wallet status integration
- NFT collection showcase

**Technical Implementation**:

```typescript
const [isFlipped, setIsFlipped] = useState(false)

return (
  <div className="perspective">
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Front and back card content */}
    </motion.div>
  </div>
)
```

#### WalletButton.tsx

**Purpose**: Wallet connection and management
**Responsibilities**:

- Multi-wallet support
- Connection status display
- Transaction history
- Network detection

**Supported Wallets**:

- Phantom
- Solflare
- Torus
- Ledger
- MathWallet
- TokenPocket
- Coinbase Wallet

### Modal Components

Les modales encapsulent les workflows transactionnels (mint, staking, vote) et évitent de polluer la navigation principale. Elles consomment l’état Zustand et/ou l’API selon le mode (démo vs réel).

#### NFTProofModal.tsx

**Purpose**: NFT certification display and minting
**Features**:

- Proof-of-Skill™ visualization
- Minting workflow
- Metadata display
- Social sharing
- Download functionality

#### StakingModal.tsx

**Purpose**: Token staking interface
**Features**:

- Staking amount selection
- APY calculation
- Reward estimation
- Cognitive Lock™ implementation

#### DAOVoteModal.tsx

**Purpose**: Governance participation
**Features**:

- Proposal display
- Voting interface
- Voting power calculation
- Results visualization

---

## 🗄️ State Management

Le state est centralisé dans Zustand et persiste une partie de l’expérience utilisateur. Cette section explique la structure, ce qui est persisté, et ce qui est recalculé au runtime.

### Zustand Stores

Les stores fournissent une API stable au reste de l’application (actions) et découpent les préoccupations (journey vs thème).

#### journeyStore.ts

**Purpose**: Main application state management

**State Structure**:

```typescript
interface JourneyState {
  // Core journey data
  selectedPersona: Persona | null
  currentPhase: number
  userProgress: UserProgress

  // UI state
  isModalOpen: boolean
  modalContent: any

  // Blockchain features
  testnetFeatures: TestnetFeatures

  // Actions
  setSelectedPersona: (persona: Persona | null) => void
  updateProgress: (xp: number, nfts?: string[], mfai?: number) => void
  completePhase: (phaseIndex: number) => void
  mintNFT: (nftName: string) => Promise<string>
  updateStaking: (amount: number) => void
  updateVotingPower: (newPower: number) => void
  updateWalletConnection: (connected: boolean, address?: string) => void
  // ... other actions
}
```

**Key Features**:

- Persistent storage with Zustand persist middleware
- Automatic XP and level calculation
- NFT collection management
- Wallet state synchronization

#### themeStore.ts

**Purpose**: Theme management

```typescript
interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
}
```

### Data Persistence

**Local Storage**: User progress, selected persona, and preferences are automatically persisted using Zustand's persist middleware.

**Session Storage**: Temporary UI state like modal content and current phase.

**Blockchain State**: NFT ownership and token balances are fetched from the blockchain on wallet connection.

---

## ⛓️ Blockchain Integration

La blockchain est actuellement **principalement simulée** côté UI (devnet / mocks) ; cette section explique ce qui est déjà intégré (wallet), ce qui est simulé (mint/stake/vote) et la trajectoire vers du mainnet.

### Current Implementation

The platform currently operates in **simulation mode** with the following blockchain integrations:

#### Wallet Connection

- **Network**: Solana Devnet
- **Auto-connect**: Disabled (user-initiated)
- **Error Handling**: Comprehensive error states and user feedback

```typescript
// src/contexts/WalletContext.tsx
export const WalletContextProvider: React.FC = ({ children }) => {
  const network = 'devnet'
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // ... other adapters
  ], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
```

#### Transaction Simulation

All blockchain operations are currently simulated with realistic delays and responses:

```typescript
// Example: NFT Minting Simulation
mintNFT: async (nftName: string) => {
  // Simulate minting delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Generate mock mint address
  const mintAddress = `${Math.random().toString(36).substr(2, 8)}${Math.random().toString(36).substr(2, 8)}`

  // Update state
  set((state) => ({
    userProgress: {
      ...state.userProgress,
      nfts: [...state.userProgress.nfts, nftName],
    }
  }))

  return mintAddress
}
```

### Blockchain Utilities

Cette sous-section recense les fonctions utilitaires qui encapsulent les appels Solana (ou les simulations) afin de garder les composants UI simples.

#### src/utils/blockchain.ts

Provides utility functions for blockchain operations:

- `getConnection()`: Initialize Solana connection
- `requestAirdrop()`: Request devnet SOL
- `getWalletBalance()`: Fetch wallet balance
- `mintProofOfSkill()`: Mint NFT certification
- `stakeMFAI()`: Stake tokens
- `submitDAOVote()`: Submit governance vote
- `verifyTransaction()`: Verify transaction status

### Future Blockchain Integration

See `docs/blockchain_integration_plan.md` for detailed implementation roadmap including:

- Smart contract deployment
- Real NFT minting with Metaplex
- Token staking contracts
- DAO governance implementation
- AI validation integration

---

## 🎨 User Interface

Cette section documente les conventions UI/UX : design system, responsive, animations, accessibilité, et règles d’implémentation.

### Design System

Le design system est une “grille” de styles (couleurs, typographies, gradients) utilisée dans l’ensemble des composants pour assurer cohérence et lisibilité.

#### Color Palette

```css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-500: #4361ee;
--primary-900: #0f172a;

/* Accent Colors */
--accent-cyan: #22D3EE;
--accent-purple: #C084FC;
--accent-gold: #FFD700;
--accent-mint: #14F195;
```

#### Typography

- **Headings**: Space Grotesk (modern, tech-focused)
- **Body**: Inter (readable, professional)
- **Code**: Monospace (for addresses, hashes)

#### Gradients

```css
.bg-gradient-primary { background: linear-gradient(90deg, #4361ee, #7209b7); }
.bg-gradient-solana { background: linear-gradient(90deg, #9945FF, #14F195); }
.bg-gradient-gold { background: linear-gradient(90deg, #FFD700, #FFA500); }
```

### Responsive Design

Le responsive suit une approche mobile-first et adapte les grilles/cartes/modales par breakpoints. Les exemples ci-dessous montrent la stratégie de base.

#### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Mobile-First Approach

All components are designed mobile-first with progressive enhancement:

```css
/* Mobile base styles */
.card { padding: 1rem; }

/* Tablet enhancement */
@media (min-width: 768px) {
  .card { padding: 1.5rem; }
}

/* Desktop enhancement */
@media (min-width: 1024px) {
  .card { padding: 2rem; }
}
```

### Animation System

Les animations sont utilisées pour guider l’attention (montage de listes, transitions) et donner un feedback d’interaction, tout en gardant une option “reduced motion”.

#### Framer Motion Integration

- **Page transitions**: Smooth enter/exit animations
- **Component mounting**: Staggered animations for lists
- **Interactions**: Hover and tap feedback
- **Progress indicators**: Animated progress bars and counters

#### Key Animation Patterns

```typescript
// Staggered list animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

### Accessibility

L’accessibilité vise la compatibilité clavier + lecteurs d’écran, et une lisibilité correcte (contrastes/ARIA). Les snippets ci-dessous servent de référence d’implémentation.

#### WCAG 2.1 Compliance

- **Color contrast**: Minimum 4.5:1 ratio
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Proper ARIA labels and roles
- **Focus management**: Visible focus indicators

#### Implementation

```typescript
// Example: Accessible button
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary"
  aria-label="Connect your Solana wallet"
  disabled={connecting}
>
  {connecting ? 'Connecting...' : 'Connect Wallet'}
</motion.button>
```

---

## 🔧 Development Workflow

Cette section décrit comment travailler sur le code (setup, scripts, conventions, Git). Elle sert de guide d’onboarding pour contributeurs.

### Getting Started

Étapes minimales pour lancer le projet localement et obtenir un environnement cohérent (Node, env vars, dev server).

#### Environment Setup

```bash
# Clone repository
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

#### Development Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format (prettier)
npm run format

# Full check (lint + unit tests)
npm run check

# Build for production
npm run build

# Optimized production build
npm run build:optimized

# Preview production build
npm run preview

# OpenAPI types generation (mf-back → frontend client types)
npm run generate:api

# Personas/phases documentation generation
npm run generate:phases-table
```

### Code Standards

Règles de code pour garder le repo maintenable : TypeScript strict, structure des composants, conventions de style, et bonnes pratiques.

#### TypeScript Configuration

- **Strict mode**: Enabled for type safety
- **Path mapping**: Configured for clean imports
- **ESLint integration**: Automatic linting

#### Component Structure

```typescript
// Standard component template
interface ComponentProps {
  // Props with clear types
}

const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2
}) => {
  // Hooks at the top
  const [state, setState] = useState()
  const { storeValue } = useStore()

  // Event handlers
  const handleEvent = () => {
    // Implementation
  }

  // Render
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  )
}

export default Component
```

#### Styling Guidelines

- **Tailwind-first**: Use Tailwind utilities
- **Component classes**: For reusable patterns
- **CSS modules**: For complex component-specific styles
- **Responsive design**: Mobile-first approach

### Git Workflow

Convention de branches/commits et règles de contribution pour garder une histoire Git lisible (et faciliter CI/CD).

#### Branch Strategy

```
main                    # Production-ready code
├── develop            # Integration branch
├── feature/xyz        # Feature development
├── bugfix/abc         # Bug fixes
└── hotfix/urgent      # Critical fixes
```

#### Commit Convention

```
feat: add NFT minting functionality
fix: resolve wallet connection issue
docs: update README with setup instructions
style: improve button hover animations
refactor: optimize state management
test: add unit tests for journey store
```

---

## ⚙️ Configuration

Variables d’environnement et configurations tooling (Tailwind/Vite) qui influencent le runtime, le build, et l’intégration à la stack backend.

### Environment Variables

Variables nécessaires au fonctionnement (API base, wallets, flags) et variables optionnelles (logs, démo, tooling).

#### Required Variables

```bash
# .env.local
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_APP_VERSION=1.0.0
```

#### Optional Variables

```bash
# Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Feature flags
VITE_ENABLE_ZYNO_AI=true
VITE_ENABLE_REAL_BLOCKCHAIN=false

# API endpoints
VITE_API_BASE_URL=https://api.moneyfactory.ai
VITE_ZYNO_API_URL=https://zyno.moneyfactory.ai
VITE_SOLANA_API_BASE_URL=http://127.0.0.1:3001

# Knowledge base distribution
VITE_RESOURCE_LIBRARY_BASE_URL=https://cdn.moneyfactory.ai/knowledge-vault
```

### API usage example: trigger next step with actionId

Use actionId to chain the scenario from an ActionSuggestionsBlock. The backend will forward it to Zyno.

```ts
async function triggerNextStep(journeyId: string, actionId: string){
  const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000'
  const body = {
    phaseId: 'learn',
    trackId: 'builder',
    actionId,
    language: 'fr',
    journeyState: { /* your persisted state */ }
  }
  const res = await fetch(`${BASE}/api/journeys/${journeyId}/step?llm=1`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })
  if(!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
```

### Tailwind Configuration

Extension du thème Tailwind (couleurs, animations) et principes d’utilisation (utilities-first + classes réutilisables).

#### Custom Theme Extensions

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#4361ee',
          900: '#0f172a',
        },
        accent: {
          cyan: '#22D3EE',
          purple: '#C084FC',
          gold: '#FFD700',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      }
    }
  }
}
```

### Vite Configuration

Paramètres Vite importants pour le build (chunks, perf) et le dev (HMR). Les extraits ci-dessous illustrent la configuration.

#### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          blockchain: ['@solana/web3.js', '@solana/wallet-adapter-react'],
        }
      }
    }
  }
})
```

---

## 🧪 Testing

Approche de test multi-niveaux : unit/integration/e2e, avec un focus sur les parcours critiques (onboarding, demo mode, missions, DAO).

### Testing Strategy

Chaque niveau a un rôle : unit pour la logique, integration pour l’UI/stores, e2e pour les flows “réels” utilisateur.

#### Unit Tests

- **Components**: React Testing Library
- **Runner**: Vitest
- **Stores**: Zustand testing utilities

#### Integration Tests

- **User flows**: Vitest + React Testing Library (tests d’intégration UI)
- **Wallet integration**: Mock wallet providers
- **Cypress**: présent dans le repo (dossier `cypress/`) mais non exposé par un script `npm` dans cette app (usage optionnel/legacy).

#### E2E Tests

- **Critical paths**: Playwright
- **Cross-browser**: Chrome, Firefox, Safari
- **Mobile testing**: Device simulation

### Test Structure

```
src/
├── __tests__/              # Test files
│   ├── components/         # Component tests
│   ├── stores/            # Store tests
│   ├── utils/             # Utility tests
│   └── integration/       # Integration tests
├── __mocks__/             # Mock files
│   ├── wallet.ts          # Wallet mocks
│   └── blockchain.ts      # Blockchain mocks
└── test-utils.tsx         # Test utilities
```

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Playwright smoke (fast path)
npm run test:e2e:smoke

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

> `npm run test:e2e:smoke` now covers both the builder journey and the investor demo on Chromium to guard the most common onboarding flows.

> Manual QA: After the automated suite, run the wallet connection journey in a browser with Phantom and Torus to verify the modal flow, reconnect behaviour, and persisted session before marking the build investor-ready.

---

## 🚀 Deployment

Déploiement du frontend seul (hébergeurs) ou du monorepo complet (Docker Compose). Cette section précise les commandes et les variables d’env nécessaires.

### Build Process

Étapes de build/preview et structure de sortie (`dist/`) pour comprendre ce qui est réellement déployé.

#### Production Build

```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Analyze bundle size
npm run analyze
```

#### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main application bundle
│   ├── vendor-[hash].js     # Third-party dependencies
│   └── index-[hash].css     # Compiled styles
├── images/                  # Optimized images
└── index.html              # Entry point
```

### Deployment Targets

Différentes options d’hébergement selon le besoin (SPA seule vs stack complète). Pour un serveur dédié, privilégier Docker Compose.

#### Dedicated Server (Recommended for the monorepo) — Docker Compose

In production for this repository, the most reliable approach is to deploy the **full stack** (frontend + `mf-back` API + DB) via Docker Compose from the **monorepo root**.

High-level:

- **Frontend container** serves the SPA and proxies API calls to the backend (Nginx template uses `API_UPSTREAM`).
- **Backend container** exposes `/user/*`, `/journey/*`, `/api/agents/*`, `/healthz`, `/readyz`, etc.
- **PostgreSQL** stores agents sessions/logs (Prisma) and other backend data.

Typical commands (run from the monorepo root, not inside `journey-simulator/`):

```bash
# Build & start the production stack
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# Tail logs (example)
docker compose -f docker-compose.prod.yml logs -f --tail=200
```

Environment variables:

- Put production secrets in a root `.env` file (do **not** commit it).
- Backend essentials usually include: `JWT_SECRET`, `DATABASE_URL`, `ADMIN_API_KEY`, `OPENAI_API_KEY` (or other LLM key), `RAG_SEARCH_URL`, `RAG_INGEST_URL`, `RAG_API_KEY`, `RAG_COLLECTION`.
- Frontend essentials usually include: `VITE_API_BASE_URL` (must be the origin root, without `/api`).

Reverse proxy note:

- The frontend Nginx config is templated to point to the right backend service name/port via `API_UPSTREAM`.

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Netlify

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_SOLANA_NETWORK=mainnet-beta
```

#### Custom Server

```bash
# Build and serve
npm run build
npx serve dist

# With custom server
npm run build
node server.js
```

### Environment-Specific Configurations

Différences attendues entre environnements (dev/staging/prod) : réseaux Solana, logs, monitoring, feature flags, et niveaux d’optimisation.

#### Development

- Solana Devnet
- Debug logging enabled
- Hot module replacement
- Source maps

#### Staging

- Solana Testnet
- Error tracking
- Performance monitoring
- Feature flags

#### Production

- Solana Mainnet
- Optimized bundles
- CDN assets
- Analytics tracking

---

## 🐛 Known Issues

Problèmes connus, impacts, et contournements. Cette section doit être mise à jour quand un incident est reproduit/confirmé.

### Critical Issues

Issues bloquantes pour une démo ou une mise en prod, avec workaround immédiat quand possible.

#### 1. Wallet Connection on Mobile

**Issue**: Phantom wallet connection may fail on mobile browsers
**Workaround**: Use desktop browser or Phantom mobile app
**Status**: Under investigation
**Priority**: High

#### 2. Torus Wallet Adapter Deprecation Warning

**Issue**: `@solana/wallet-adapter-torus` currently depends on the deprecated `@toruslabs/solana-embed@2.x`, which emits maintenance warnings at install time
**Impact**: No functional regression observed, but production rollout should either track the upstream fix or migrate to the new Web3Auth WS Embed SDK
**Workaround**: Continue using Phantom/Solflare for demos; monitor Solana wallet adapter releases for an updated dependency
**Status**: Open (tracking with wallet team)
**Priority**: Medium

#### 3. Transaction Simulation

**Issue**: All blockchain transactions are currently simulated
**Impact**: No real NFTs or tokens are minted
**Solution**: Implement real blockchain integration (see roadmap)
**Priority**: High

### Minor Issues

Issues non bloquantes (perf, UX, compat) qui peuvent être planifiées et traitées en itérations.

#### 4. Animation Performance

**Issue**: Complex animations may lag on older devices
**Workaround**: Reduce motion in accessibility settings
**Status**: Optimization in progress
**Priority**: Medium

#### 5. Image Loading

**Issue**: Some persona images may load slowly
**Workaround**: Images are lazy-loaded
**Status**: Considering CDN implementation
**Priority**: Low

#### 6. Noisy console errors from browser extensions (dev only)

**Issue**: In local development, extensions may inject scripts (e.g., AdUnit) that trigger errors like `index.browser.js:507 Cannot access <x> before initialization`.
**Workaround**: A dev-only guard ignores errors from `chrome-extension://` / `moz-extension://` script origins to keep the console clean.
**Disable the guard**: set `VITE_DISABLE_EXTENSION_ERROR_FILTER=true` or run `localStorage.setItem('debug:allow-extension-errors','1')` then refresh.
**Status**: Documented; production not affected.
**Priority**: Low

### Browser Compatibility

Navigateurs supportés et limitations connues. Objectif : éviter des surprises lors de démos sur environnements variés.

#### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

#### Known Limitations

- ❌ Internet Explorer (not supported)
- ⚠️ Safari < 14 (limited Web3 support)
- ⚠️ Mobile browsers (wallet integration issues)

---

## 🗺️ Roadmap

Feuille de route indicative (ordre de grandeur) : passage de la simulation vers des intégrations on-chain réelles, amélioration UX, et évolution IA/agents.

### Phase 1: Real Blockchain Integration (Q1 2024)

- [ ] Deploy smart contracts on Solana Devnet
- [ ] Implement real NFT minting with Metaplex
- [ ] Connect staking to actual token contracts
- [ ] Enable real DAO voting
- [ ] Add transaction history and verification

### Phase 2: Enhanced User Experience (Q2 2024)

- [ ] Improve mobile responsiveness
- [ ] Add advanced animations and micro-interactions
- [ ] Implement progressive web app (PWA) features
- [ ] Add multi-language support
- [ ] Enhance accessibility features

### Phase 3: AI Integration (Q3 2024)

- [ ] Connect Zyno to real AI backend
- [ ] Implement contextual guidance system
- [ ] Add personalized learning paths
- [ ] Create AI-powered validation
- [ ] Develop intelligent mission generation

### Phase 4: Advanced Features (Q4 2024)

- [ ] Launch marketplace for NFT certifications
- [ ] Implement mentorship system
- [ ] Create project launchpad
- [ ] Add social features and community
- [ ] Develop mobile applications

### Phase 5: Ecosystem Expansion (2025)

- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Enterprise partnerships
- [ ] Educational institution integration
- [ ] Corporate training programs
- [ ] Global scaling and localization

---

## 🤝 Contributing

Guide de contribution pour maintenir la qualité (setup, style, PR). Même en repo privé, ces règles évitent les divergences et les régressions.

### Development Setup

Pré-requis et séquence de démarrage pour un contributeur (ou un nouvel environnement CI/dev).

#### Prerequisites

- Node.js 18+
- Git
- Solana CLI (for blockchain development)
- Phantom wallet (for testing)

#### Setup Process

```bash
# Fork the repository
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature-name

# Start development
npm run dev
```

### Contribution Guidelines

Règles pour soumettre des changements : style, tests minimaux, PRs, et scope des modifications.

#### Code Style

- Follow existing TypeScript and React patterns
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

#### Pull Request Process

1. **Create Issue**: Describe the feature or bug
2. **Fork & Branch**: Create a feature branch
3. **Develop**: Implement changes with tests
4. **Test**: Ensure all tests pass
5. **Document**: Update relevant documentation
6. **Submit PR**: Create pull request with description
7. **Review**: Address feedback from maintainers
8. **Merge**: Approved PRs are merged to develop

#### Areas for Contribution

- 🐛 **Bug Fixes**: Resolve existing issues
- ✨ **Features**: Implement new functionality
- 📚 **Documentation**: Improve guides and docs
- 🎨 **Design**: Enhance UI/UX components
- 🧪 **Testing**: Add test coverage
- 🌐 **Localization**: Add language support

### Community

Canaux et règles de communication (quand applicable) pour coordonner les contributions et remonter les problèmes.

#### Communication Channels

- **Website**: [mfai.app](https://mfai.app)
- **GitHub**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and ideas

#### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

**Copyright © 2024 Money Factory AI**

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited. This software is provided for evaluation and development purposes only under the terms of the signed agreement.

For licensing inquiries, contact: [legal@moneyfactory.ai](mailto:legal@moneyfactory.ai)

---

## 📞 Support & Contact

Contacts et points d’entrée selon le type de demande (tech, business, légal).

### Technical Support

- **Website**: [mfai.app](https://mfai.app)
- **GitHub Issues**: For bug reports and feature requests

### Business Inquiries

- **Website**: [mfai.app](https://mfai.app)
- **GitHub**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)

### Development Team

- **Chief Operator & Blockchain Officer**: Alaeddine BEN RHOUMA
- **GitHub**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)

## 🔗 Website Integration Guide

Guide d’intégration du simulateur dans le site principal (routing, iframe/subdomain, analytics, SEO).

### For Website Developers

To integrate this journey simulator into the main Money Factory AI website at [mfai.app](https://mfai.app), follow these guidelines:

#### 1. CTA Button Implementation

```html
<!-- Primary CTA on homepage -->
<a href="/journey-simulator" class="cta-button-primary">
  <span>Experience Your Cognitive Journey</span>
  <span class="cta-subtitle">Discover how your skills become capital</span>
</a>

<!-- Secondary CTA -->
<a href="/journey-simulator" class="cta-button-secondary">
  Try Journey Simulator
</a>
```

#### 2. Routing Setup

```javascript
// Next.js routing example
// pages/journey-simulator.js or app/journey-simulator/page.js
export default function JourneySimulator() {
  return (
    <iframe
      src="https://journey-simulator.mfai.app"
      width="100%"
      height="100vh"
      frameBorder="0"
      title="Money Factory AI Journey Simulator"
    />
  );
}
```

#### 3. Subdomain Setup

For optimal integration, consider hosting the simulator on a subdomain:

- **Simulator URL**: `journey.mfai.app` or `simulator.mfai.app`
- **Main Website**: `mfai.app`
- **API Endpoint**: `api.mfai.app`

#### 4. Analytics Integration

```javascript
// Track journey simulator engagement
gtag('event', 'journey_simulator_start', {
  'event_category': 'engagement',
  'event_label': 'persona_selection'
});
```

#### 5. SEO Considerations

```html
<!-- Meta tags for journey simulator page -->
<meta name="description" content="Experience the Cognitive Activation Protocol™ - Transform your skills into digital capital through Money Factory AI's interactive journey simulator">
<meta property="og:title" content="Money Factory AI Journey Simulator">
<meta property="og:description" content="Discover how to transform your skills into capital in the Proof Economy">
<meta property="og:url" content="https://mfai.app/journey-simulator">
```

---

## 🙏 Acknowledgments

Remerciements aux technologies et communautés qui rendent possible l’écosystème (frameworks, outils, et contributeurs).

### Technologies

- **Solana Foundation** for blockchain infrastructure
- **React Team** for the amazing framework
- **Tailwind Labs** for the utility-first CSS framework
- **Framer** for the motion library
- **Lucide** for the beautiful icons

### Community

- **Early Adopters** who provided valuable feedback
- **Beta Testers** who helped identify and resolve issues
- **Contributors** who helped improve the platform
- **Solana Developer Community** for support and guidance

---

**Built with ❤️ by the Money Factory AI Team**

*Transforming skills into capital through the Cognitive Activation Protocol™*

*Last updated: January 23, 2026*
*Version: 1.0.0*

---

### Exemple (test local) — intégrer `sample_mission_feedback.json` dans React

Cet exemple sert à valider rapidement le rendu du composant `MissionFeedbackSummary` avec un payload statique (utile en dev pour tester UI/typographie sans backend).

```tsx
import React from 'react'
import MissionFeedbackSummary from './MissionFeedbackSummary'
import feedbackMock from './sample_mission_feedback.json'

const TestFeedbackSummary = () => (
  <div className="max-w-3xl mx-auto mt-10">
    <MissionFeedbackSummary summary={feedbackMock} />
  </div>
)

export default TestFeedbackSummary
```

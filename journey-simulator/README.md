![Coverage Badge](https://img.shields.io/badge/coverage-Jest-green?style=flat-square)

# Money Factory AI - Journey Simulator

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
- [RAG (Retrieval-Augmented Generation)](#rag)
- [API (contrats, endpoints, auth)](#api)
- [Données & bases (MongoDB, Postgres/Prisma)](#donnees-et-bases)
- [Scores AEPO / AECO / Alignment (ce qui est calculé)](#scores-aepo-aeco-alignment)
- [Mode Démo / Investor Mode (mock vs réel)](#mode-demo)
- [Modèle de parcours (Personas & Phases)](#modele-parcours)
- [Détail phase par phase (généré)](#detail-phase-par-phase)
- [Index complet des fichiers (auto-généré)](#file-index)
- [API surface index (auto-généré)](#api-surface-index)
- [UI Blocks, ressources & documents](#ui-blocks)
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

# (2) Index complet des fichiers (scan monorepo)
npm run generate:file-index
# ou (depuis la racine)
node journey-simulator/scripts/generate-file-index.mjs

# (3) API surface index (routes frontend + endpoints backend)
npm run generate:api-surface
# ou (depuis la racine)
node journey-simulator/scripts/generate-api-surface.mjs
```

Ce script met à jour automatiquement :

- **Détail phase par phase** (source: `src/data/personas.ts`) → `npm run generate:phases-table`
- **Index complet des fichiers** (scan monorepo) → `npm run generate:file-index`
- **API surface index** (routes frontend + endpoints backend) → `npm run generate:api-surface`

---

## 🧭 Guide de lecture (réel vs simulation)

<a id="guide-reel-vs-simulation"></a>

Ce dépôt est un **monorepo full-stack**. Le dossier `journey-simulator/` (ce README) décrit surtout l’expérience **frontend** (React/Vite). Mais, dans la pratique, la plateforme s’appuie aussi sur :

- `mf-back/` : **API Express + MongoDB** + **orchestration multi-agents Zyno** + **RAG** (ingestion/retrieval) + endpoints admin.
- `web/` : une couche **web/Prisma/Postgres** utilisée par certains scripts/tests/CI (ex: table `MintLog`) et des services “site”.

### Carte “réel vs placeholder” (ce qui tourne réellement)

| Domaine | Réel (implémenté et utilisé) | Simulation / placeholder (MVP) |
|---|---|---|
| Auth | JWT + refresh token + endpoints `mf-back` (`/user/*`) ; **demo-login** via token local | Certaines valeurs user “demo” fictives (email, wallet, role) |
| Progression | Stockage côté backend (Mongo) + état UI Zustand | En **mode démo**, persistence en `localStorage` (datastore mock) |
| Zyno / Agents | Orchestrateur backend (`mf-back/orchestration/zynoOrchestrator.js`) + agents (registry) + logs Mongo | Certains “agents” peuvent retourner des textes/structures de démonstration selon config |
| RAG | Client RAG backend (`mf-back/rag/ragClient.js`) ; upload admin `POST /admin/rag/upload` | Fallback local sur fichiers `.md/.txt` en cas d’échec réseau |
| UI Blocks | Renderer robuste (tolérant aux arrays manquants) + mapping `kind → composant` | Certaines briques/blocks sont “design-first” (contenu fictif selon la persona/phase) |
| Blockchain (Solana) | Wallet connect (adapters) + utilitaires | Beaucoup de “transactions” sont simulées en UI (selon le mode) |
| DAO / staking | UI + endpoints (selon stack) | Plusieurs métriques/retours peuvent être “mockés” pour démo investisseur |

### Fichiers “source de vérité” (à lire pour comprendre)

- **API + orchestration Zyno** : `mf-back/routes/zyno-routes.js`, `mf-back/orchestration/zynoOrchestrator.js`
- **RAG** : `mf-back/rag/ragClient.js`, `mf-back/routes/rag-routes.js`
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

1. Upload de documents RAG (protégé par `ADMIN_API_KEY`) : `POST /admin/rag/upload`
2. Lecture de documents : `GET /admin/rag/documents`
3. Analyse d’orchestrations / logs agents : endpoints “orchestration/logs” (Mongo).

---

## 🤖 Zyno (orchestrateur) & Agents (backend)

<a id="zyno-orchestrateur-agents"></a>

Cette section documente le **backend Zyno** : orchestration multi-agents, logique d’exécution, endpoints, et mécanismes d’audit (timeline/logs/mémoire) utilisés par l’UI et les consoles.

### Vue d’ensemble

Zyno est un orchestrateur multi-agents côté backend (`mf-back`) qui :

1. **Détecte l’intention** de l’utilisateur (`detectIntent(userInput)`).
2. **Mappe l’intention → liste d’agents** (`mapIntentToAgents(intent)`).
3. **Détermine un mode d’exécution** (`determineExecutionMode(intent)`).
4. **Charge un template de parcours** (“parcoursTemplate”) selon l’intention.
5. **Exécute les agents** et produit :
   - `results`: un dictionnaire `agentName → payload`
   - `timeline`: la séquence d’exécution (pour audit/UX)
   - `currentStep`: dernier step

### Endpoint principal

- `POST /orchestration` (voir `mf-back/routes/zyno-routes.js`)
  - input : `{ input, userId, journey, phase, objective }`
  - output : `{ executedAgents, intent, mode, parcoursTemplate, results, timeline, meta.orchestration }`

### Logs & mémoire (MongoDB)

Après exécution, le backend persiste :

- **Agent logs** (ex: modèle `agentFeedbackLog`) : prompt, réponse, sources RAG, métriques, feedback, etc.
- **Mémoire d’agent / utilisateur** (ex: `agent_memory`) : derniers steps / intent / timeline.

### AEPO “backend” (important : définition MVP)

Dans `mf-back`, “AEPO” apparaît aussi comme **signal d’exécution par agent** :

- Il est calculé à partir de `durationMs / success / retries` dans l’orchestrateur,
- puis sauvegardé via `saveMetric(agentName, userId, 'AEPO', metricPayload, missionId)`.

Ce “AEPO backend” est donc **une métrique qualité d’exécution** (MVP), à ne pas confondre avec la couche “AEPO/AECO” présentée au niveau produit (roadmap solo vs cohort).

---

## 📚 RAG (Retrieval-Augmented Generation)

<a id="rag"></a>

Le RAG est implémenté côté backend (`mf-back`) via un client HTTP + fallback local.

### Composants

- **Client** : `mf-back/rag/ragClient.js`
  - `getRagSnippets(...)` : recherche des extraits (snippets) pour enrichir le contexte agent/LLM
  - `ingestDocument(...)` / `ingestDocumentsIfNeeded(...)` : ingestion
- **Routes admin** : `mf-back/routes/rag-routes.js`
  - `POST /admin/rag/upload` (upload d’un document ; nécessite `ADMIN_API_KEY`)
  - `GET /admin/rag/documents` (liste)

### Variables d’environnement (backend)

- `RAG_SEARCH_URL` (défaut: `http://localhost:8000/kb/search`)
- `RAG_INGEST_URL` (défaut: `http://localhost:8000/kb/ingest`)
- `RAG_API_KEY` (clé d’accès au service RAG)
- `RAG_COLLECTION` (défaut: `mfai-knowledge`)
- `RAG_DATA_PATH` (fallback local, défaut: `mf-back/data/rag-documents`)
- `ADMIN_API_KEY` (protection upload admin)

### Fallback (quand le RAG distant est indisponible)

Si la recherche HTTP échoue, le backend lit des fichiers `.md/.txt` depuis `RAG_DATA_PATH` et renvoie des “snippets” de secours. C’est **volontaire** pour garder une démo fonctionnelle sans dépendance externe.

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

- l’app traite certaines routes “step/submit” comme **appels IA réels même en mode démo** (voir `isAIAgentCall` dans `journey-simulator/src/utils/api.ts`).

### Contrats typés (recommandé pour audit)

- `journey-simulator/src/api/mf-back-client.ts` : définitions OpenAPI-like (paths/components)
- `journey-simulator/src/api/mf-back.ts` : quelques wrappers (`journey.getUserProgress`, `agents.listRuns`, …)

---

## 🗄️ Données & bases (MongoDB, Postgres/Prisma)

<a id="donnees-et-bases"></a>

Cette section clarifie **où vivent les données** selon les sous-systèmes (journeys/agents vs autres modules du monorepo) afin d’éviter les confusions “Mongo vs Postgres”.

### MongoDB (stack principale “Journey + Agents”)

`mf-back` utilise MongoDB pour :

- la progression utilisateur “journey”
- la mémoire
- les logs d’agents (audit, timeline, sources RAG)

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
1 | `cognitive-orientation` | Cognition Ignition | Complete the Web3 paradigm deep-dive, map legacy vs. decentralized architecture, and articulate your mission statement. | 60 | 6 | Proof-of-Skill™: Web3 Orientation | — | — |
2 | `solana-fluency` | Solana Systems Lab | Complete validator walk-throughs, inspect transaction flows, and prototype a Solana interaction in the playground. | 80 | 8 | Solana Fluency Patch | 50 | — |
3 | `token-design-lab` | Token Design Studio | Model a token incentive map, stress-test governance edge cases, and publish a protocol impact canvas. | 90 | 9 | Tokenomics Architect Badge | — | ✅ |
4 | `identity-proofing` | Identity & Security Forge | Harden your wallet stack, evaluate custody trade-offs, and design a DeID onboarding flow. | 100 | 10 | Sovereign Identity Seal | — | — |
5 | `ecosystem-engagement` | Ecosystem Activation | Ship a community contribution, present your activation brief to peers, and initiate DAO participation. | 120 | 12 | Proof-of-Skill™: Activation | — | — |
6 | `launch-collaterize` | Launch via Collaterize | Run the Collaterize simulation, analyze your eligibility score, and review the launch plan. | 200 | 20 | Collaterize Launch Badge | — | — |

### Persona: The Capital Foundry (`capital-foundry`)

| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |
|---:|---|---|---|---:|---:|---|---:|---|
1 | `capital-discovery` | Protocol Discovery Sprint | Benchmark leading Solana protocols, analyze composability patterns, and publish an opportunity matrix. | 80 | 8 | DeFi Recon Marker | — | — |
2 | `program-forge` | Program Forge Lab | Ship a core lending or AMM module, integrate deterministic tests, and validate with fuzzing harnesses. | 110 | 11 | Anchor Mastery Crest | — | — |
3 | `oracle-integration` | Oracle & Liquidity Mesh | Integrate oracle feeds, simulate liquidity shocks, and design cross-chain contingency flows. | 120 | 12 | Liquidity Architect Token | — | — |
4 | `risk-command` | Risk Command Center | Define circuit breakers, craft adaptive fee policies, and build DAO-ready reporting dashboards. | 130 | 13 | Proof-of-Yield™ Sentinel | 75 | — |
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
5 | `synaptic-impact` | Synaptic Impact Launch | Present to Synaptic Governance, initiate Neuro-Dividend rewards, and launch a community impact sprint. | 150 | 15 | Impact Engine Proof | — | — |
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

<!-- END AUTO-GENERATED: phases-table -->

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

Le renderer gère (selon versions) :

- `text_block`, `checklist_block`, `quiz_block`, `mission_block`
- `resource_block`, `document_block`, `evaluation_block`
- `action_suggestions_block`, `xp_block`, `diagram_block`
- `dao_dashboard_block`, `project_selection_block`, `narrative_choice_block`
- `indicator_block`, `interactive_template_block`

### Ressources (ResourceBlock)

Un `resource_block` expose typiquement `resources[]` (ex: liens, flashcards) ; l’UI peut activer des actions comme copier un deck, ouvrir une ressource, ou afficher un fallback “No resources available”.

---

## 🧰 Consoles & Debug (ZynoConsole, healthz/readyz, logs)

<a id="debug-consoles"></a>

Le simulateur embarque une console “investor/dev” pour observer Zyno et l’orchestration.

### ZynoConsole (front)

- `journey-simulator/src/components/Zyno/ZynoConsole.tsx`
  - **health checks** : ping périodique `GET /healthz` et `GET /readyz`
  - **orchestration** : `POST /orchestration` (timeout 10s côté UI) avec `{ input, userId }`
  - **résumé mission** : construit un `MissionSummary` depuis la timeline (moyenne des scores AEPO agent)
  - **outils** : viewer de logs agents, flow de mission, upload de ressources (RAG)

### DAO console (front)

- `journey-simulator/src/components/Dao/DaoDashboard.tsx`
  - snapshot `api.getDaoConfig()` + `api.getDaoProposals()`
  - panneau admin `ZynoDAOAdminPanel` (dev/investor)

### Journey dashboard (front)

- `journey-simulator/src/components/Journey/JourneyDashboard.tsx`
  - refresh périodique de progression + “last mint” best-effort via `GET /api/mint/last`

---

## 🧠 Orchestration agentique (R2.x — résumé)

- Intent router + registry enrichi : sélection déterministe d’agents (sécurité/produit), scoring pondéré par `confidenceWeight` + `learningScore`.
- Arbitrage Zyno : contradictions détectées, décision structurée (`overallStatus`, `topFindings`, `recommendedActions`, `actionPlan` dédupliqué).
- Mémoire & apprentissage : mémoire TTL/FIFO (in-memory), ajustement de confiance via historique (OK/FAIL/TIMEOUT/contradictions).
- Tooling & executionPlan : mapping actions → tools (`enable_checklist` seul tool autorisé en exécution réelle, autres en dry-run/skipped).
- Execution Gate (HITL) : gate PENDING/APPROVED/REJECTED/EXPIRED requis avant toute exécution réelle.
- Execution Engine :
  - Mode par défaut : `DRY_RUN` (SIMULATED), aucun side-effect.
  - Mode réel (opt-in) : uniquement si `EXECUTION_ENABLED=true` **et** gate `APPROVED`, un seul tool exécuté, les autres `SKIPPED_REAL_EXECUTION`; fallback automatique en dry-run si blocage.
- Observabilité : logs structurés avec `traceId`, statut des steps (SIMULATED/EXECUTED/SKIPPED), réponse toujours structurée (pas de throw).
- Variables env : `EXECUTION_ENABLED` (par défaut false) pour autoriser le mode réel ; ne l’activer qu’avec un gate approuvé.

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

# Start backend API (requires MongoDB running locally)
JWT_SECRET=dev-secret MONGO_URI="mongodb://127.0.0.1:27017/mfai" npm run dev --prefix ../mf-back

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
|               Agents (17)                   |
| - BuilderAgent, CoachAgent, DAOAgent, etc.  |
| - Tous héritent de AgentTemplate            |
| - Appellent RAG + LLM via helpers           |
+------------------+--------------------------+
                     |
                     v
   +-------------------------+     +----------------------+
   |       RAG Client        |     |     LLM Helper        |
   |  - Ingestion/Search     |     |  - Appel OpenAI/Gemini|
   +-----------+-------------+     +----------+------------+
               |                             |
               v                             v
+----------------------------+   +------------------------------+
| Base de documents RAG     |   |   Résultat de complétion     |
| (.md, .pdf thématiques)   |   |   (prompt → réponse)         |
+----------------------------+   +------------------------------+

               |
               v
+-----------------------------------+
| Base MongoDB (Logs & Mémoire)     |
| - agentFeedbackLog                |
| - journeyHistory / memoryProfile |
+-----------------------------------+

Éléments clés :

Zyno agit comme chef d’orchestre intelligent, déclenchant les agents selon :

L’intention de l’utilisateur.

La phase du parcours (AECO).

Le profil AEPO (type d’apprenant).

Les agents utilisent :

des documents enrichis (RAG).

des modèles LLM externes (OpenAI, Gemini).

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
| `/login` | `src/components/LoginPage.tsx` | Connexion (email/wallet/démo) | Non |
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
- `src/contexts/WalletContext.tsx` : provider wallet (adapters Solana) + état connexion.
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

Le backend est une API Express + MongoDB qui sert :

- l’authentification (`/user/*`)
- la progression journey (`/journey/*`)
- l’orchestration Zyno (`/orchestration`)
- la DAO (`/dao/*`)
- le RAG admin (`/admin/rag/*`) et d’autres endpoints auxiliaires.

#### Entrypoints & câblage

- `mf-back/app.js` : configuration Express, connexion Mongo, et **mount** des routes :
  - `/auth` → `routes/auth-routes.js`
  - `/journey` → `routes/journey-routes.js`
  - `/orchestration` → `routes/zyno-routes.js`
  - `/dao` → `routes/dao-routes.js`
  - `/demo` → `routes/demo-routes.js`
  - `/user` → `routes/user-routes.js`
  - `/healthz`, `/readyz` probes.
- `mf-back/server.js` + `mf-back/bin/www` : démarrage serveur (selon environnement).

#### Routes (fichiers)

Fichiers de routes (tous dans `mf-back/routes/`) :

- `auth-routes.js`, `user-routes.js`
- `journey-routes.js`, `journeyLaunchRoutes.js`
- `zyno-routes.js` (orchestration)
- `dao-routes.js`
- `rag-routes.js`
- `favorites.js`, `feedback.js`
- `agent-routes.js`, `analytics-routes.js`, `export-routes.js`, `demo-routes.js`, `solana-routes.js`, `cours-routes.js`, `health-routes.js`

#### Controllers / Models / Services

- `mf-back/controllers/*.js` : logique métier (journey, user, dao, analytics, demo, agent runs, metrics).
- `mf-back/models/*.js` : schémas Mongo (User, Journeys, Agent logs, DAO proposals, favorites, submissions…).
- `mf-back/services/*.js` : services transverses (state, metrics, collaterize simulation).
- `mf-back/middleware/*.js` : auth + feature flags.

#### Orchestration & agents

- `mf-back/orchestration/zynoOrchestrator.js` : orchestration (detect intent → map agents → exécuter → timeline/results).
- `mf-back/orchestration/agentsRegistry.js` : registry/resolve des agents.
- `mf-back/agents/*.js` : catalogue d’agents (Builder, Growth, Tokenomics, Security, Legal, DAO, etc.).
- `mf-back/llm/*.js` et `mf-back/utils/openaiClient.js` : appels LLM (OpenAI/GPT-5, etc.) + logging.

#### RAG

- `mf-back/rag/ragClient.js` et/ou `mf-back/rag/rag_client.js` : client RAG HTTP + fallback.
- `mf-back/routes/rag-routes.js` : upload admin + listing documents.
- `mf-back/scripts/check-rag-connection.js` : check connectivité RAG.

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
<summary><strong>journey-simulator/src (frontend)</strong> (159)</summary>

- `journey-simulator/src/api/agentRuns.ts` — Client typé / wrappers API mf-back.
- `journey-simulator/src/api/mf-back-client.ts` — Client typé / wrappers API mf-back. Note: This file was auto-generated by openapi-typescript. Do not make direct changes to the file. / export interface paths { "/user/wallet-challen
- `journey-simulator/src/api/mf-back.ts` — Client typé / wrappers API mf-back.
- `journey-simulator/src/App.tsx` — Routeur (React Router) + providers + layout.
- `journey-simulator/src/assets/lottie/galaxy-reactive.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/dao-launchpad.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/feedback-stars.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/mission-flow.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/assets/svg/multi-agents.svg` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/components/__tests__/NFTMintingModal.test.tsx` — Composant React UI.
- `journey-simulator/src/components/__tests__/UIBlocksRenderer.test.tsx` — Composant React UI.
- `journey-simulator/src/components/__tests__/WalletButton.test.tsx` — Composant React UI.
- `journey-simulator/src/components/AccessPassHolders.tsx` — Composant React UI.
- `journey-simulator/src/components/AgentActivityFeed.tsx` — Composant React UI.
- `journey-simulator/src/components/Artifacts/ArtifactCard.tsx` — Composant React UI.
- `journey-simulator/src/components/Artifacts/ArtifactModal.tsx` — Composant React UI.
- `journey-simulator/src/components/Artifacts/NeuralOverlay.tsx` — Composant React UI.
- `journey-simulator/src/components/Artifacts/ProjectAssets.tsx` — Composant React UI.
- `journey-simulator/src/components/CertificationModal.tsx` — Composant React UI.
- `journey-simulator/src/components/Dao/DaoDashboard.tsx` — Composant React UI.
- `journey-simulator/src/components/DAOVoteModal.tsx` — Composant React UI.
- `journey-simulator/src/components/DebugLogger.tsx` — Composant React UI.
- `journey-simulator/src/components/Governance/GovernanceDashboard.tsx` — Composant React UI.
- `journey-simulator/src/components/HeroSection.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/__tests__/JourneyCard.test.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/__tests__/JourneyNextActionsPanel.test.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/__tests__/JourneyProgressBar.test.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/__tests__/JourneyTimeline.test.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/__tests__/JourneyWorkspace.test.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/__tests__/NFTIntegration.test.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/AgentActivityFeed.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/InvestorDemoMode.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/journey-simulator.code-workspace` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyCard.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyDashboard.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyNextActionsPanel.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyOverviewHeader.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyProgressBar.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyTimeline.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/JourneyWorkspace.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/LaunchCollaterizePhase.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/PhaseDetails.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/PhaseInteractionBlock.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/PhaseSection.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/XPTracker.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/ZynoBox.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/ZynoChat.tsx` — Composant React UI.
- `journey-simulator/src/components/Journey/ZynoSignalSidebar.tsx` — Composant React UI.
- `journey-simulator/src/components/JourneyCompletedPage.tsx` — Composant React UI.
- `journey-simulator/src/components/JourneysPage.tsx` — Composant React UI.
- `journey-simulator/src/components/JourneysPreview.tsx` — Composant React UI.
- `journey-simulator/src/components/layout/Footer.tsx` — Composant React UI.
- `journey-simulator/src/components/layout/Header.tsx` — Composant React UI.
- `journey-simulator/src/components/Layout/JourneyLayout.tsx` — Composant React UI.
- `journey-simulator/src/components/layout/Layout.tsx` — Composant React UI.
- `journey-simulator/src/components/layout/Main.tsx` — Composant React UI.
- `journey-simulator/src/components/layout/Sidebar.tsx` — Composant React UI.
- `journey-simulator/src/components/LoginPage.tsx` — Composant React UI.
- `journey-simulator/src/components/MintCelebrationBanner.tsx` — Composant React UI.
- `journey-simulator/src/components/navigation/MainNavigation.tsx` — Composant React UI.
- `journey-simulator/src/components/navigation/UserMetricsPanel.tsx` — Composant React UI.
- `journey-simulator/src/components/NFTMintingModal.tsx` — Composant React UI.
- `journey-simulator/src/components/NFTMintingTutorial.tsx` — Composant React UI.
- `journey-simulator/src/components/NFTProofModal.tsx` — Composant React UI.
- `journey-simulator/src/components/onboarding/OnboardingFlow.tsx` — Composant React UI.
- `journey-simulator/src/components/PlaygroundPage.tsx` — Composant React UI.
- `journey-simulator/src/components/ProofCertificationsBoard.tsx` — Composant React UI.
- `journey-simulator/src/components/ProtectedRoute.tsx` — Composant React UI.
- `journey-simulator/src/components/RegisterPage.tsx` — Composant React UI.
- `journey-simulator/src/components/ResetProgressButton.tsx` — Composant React UI.
- `journey-simulator/src/components/Resources/ResourceHub.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/BackToTopButton.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/Button.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/ContextualTutorial.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/JourneyModal.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/LazyLoadList.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/MessageDisplay.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/Skeleton.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/WalletConnectionBanner.tsx` — Composant React UI.
- `journey-simulator/src/components/shared/ZynoAssistant.tsx` — Composant React UI.
- `journey-simulator/src/components/ShareModal.tsx` — Composant React UI.
- `journey-simulator/src/components/SkillchainBanner.tsx` — Composant React UI.
- `journey-simulator/src/components/SkillchainCard.css` — Composant React UI.
- `journey-simulator/src/components/SkillchainCard.tsx` — Composant React UI.
- `journey-simulator/src/components/StakingModal.tsx` — Composant React UI.
- `journey-simulator/src/components/Support/SupportCenter.tsx` — Composant React UI.
- `journey-simulator/src/components/UIBlocks/IndicatorBlock.tsx` — Renderer UI Blocks (LLM → UI).
- `journey-simulator/src/components/UIBlocks/InteractiveTemplateBlock.tsx` — Renderer UI Blocks (LLM → UI).
- `journey-simulator/src/components/UIBlocks/NarrativeChoiceBlock.tsx` — Renderer UI Blocks (LLM → UI).
- `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx` — Renderer UI Blocks (LLM → UI).
- `journey-simulator/src/components/wallet/LazyWalletMultiButton.tsx` — Composant React UI.
- `journey-simulator/src/components/WalletButton.tsx` — Composant React UI.
- `journey-simulator/src/components/WalletConnectionGuide.tsx` — Composant React UI.
- `journey-simulator/src/components/WalletFaucetButton.tsx` — Composant React UI.
- `journey-simulator/src/components/WalletStatusDisplay.tsx` — Composant React UI.
- `journey-simulator/src/components/Zyno/__tests__/AgentFeedbackModal.test.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/__tests__/ZynoConsole.test.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/agent-card.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/AgentFeedbackForm.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/AgentFeedbackModal.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/AgentLogViewer.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/AgentScoreboardContext.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/DashboardZyno.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/MissionFeedbackSummary.stories.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/MissionFeedbackSummary.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/ResourceUploader.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/types.ts` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/ZynoAgentScoreboard.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/ZynoChatSidebar.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/ZynoConsole.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/ZynoDAOAdminPanel.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/ZynoDecisionPanel.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/components/Zyno/ZynoMissionFlow.tsx` — Console Zyno (orchestration, logs, RAG admin, dashboards).
- `journey-simulator/src/config/journeyPhases.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/content/aepoAeco.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/contexts/__tests__/WalletContext.test.tsx` — Context React (auth, wallet, tutoriel, layout).
- `journey-simulator/src/contexts/AuthContext.tsx` — Context React (auth, wallet, tutoriel, layout).
- `journey-simulator/src/contexts/TutorialContext.tsx` — Context React (auth, wallet, tutoriel, layout).
- `journey-simulator/src/contexts/WalletContext.tsx` — Context React (auth, wallet, tutoriel, layout).
- `journey-simulator/src/contexts/WorkspaceLayoutContext.tsx` — Context React (auth, wallet, tutoriel, layout).
- `journey-simulator/src/hooks/useArtifacts.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/hooks/useOptimizedLoading.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/index.css` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/lib/solana-config.ts` — Fichier du monorepo (voir chemin). Note: Shared Solana Configuration Module Centralizes wallet configuration, RPC endpoints, and network settings Used by both journey-simulator (fro
- `journey-simulator/src/lib/walletAuth.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/main.tsx` — Entrypoint React + BrowserRouter + polyfills.
- `journey-simulator/src/pages/Dao.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/Dashboard.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/DebugMint.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/FavoritesPage.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/GuidePage.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/HomePage.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/Journey.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/JourneyCompleted.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/Playground.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/Resources.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/Support.tsx` — Page (route) React Router.
- `journey-simulator/src/pages/Zyno.tsx` — Page (route) React Router.
- `journey-simulator/src/service-worker.js` — Fichier du monorepo (voir chemin). Note: src/service-worker.js - Service Worker for offline caching
- `journey-simulator/src/store/__tests__/journeyStore.test.ts` — Store Zustand (state management). Note: src/store/**tests**/journeyStore.test.ts
- `journey-simulator/src/store/__tests__/journeyStore.wallet.test.ts` — Store Zustand (state management).
- `journey-simulator/src/store/favoritesStore.ts` — Store Zustand (state management).
- `journey-simulator/src/store/journeyStore.ts` — Store Zustand (state management).
- `journey-simulator/src/store/themeStore.ts` — Store Zustand (state management).
- `journey-simulator/src/test-favorites-store.ts` — Fichier du monorepo (voir chemin). Note: Test simple pour vérifier que le store fonctionne
- `journey-simulator/src/test/Journey.deep-linking.test.tsx` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/test/setup.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/src/types/artifact.ts` — Types TypeScript (contrats UI/Domain).
- `journey-simulator/src/types/journey.ts` — Types TypeScript (contrats UI/Domain).
- `journey-simulator/src/types/personas.ts` — Types TypeScript (contrats UI/Domain).
- `journey-simulator/src/types/uiBlocks.ts` — Types TypeScript (contrats UI/Domain).
- `journey-simulator/src/utils/api.ts` — Utilitaire (API client, scores, export, blockchain, etc.). Note: API base URL - configurable via environment variable for different deployments.
- `journey-simulator/src/utils/blockchain.ts` — Utilitaire (API client, scores, export, blockchain, etc.).
- `journey-simulator/src/utils/exportToPDF.ts` — Utilitaire (API client, scores, export, blockchain, etc.).
- `journey-simulator/src/utils/journeySignals.ts` — Utilitaire (API client, scores, export, blockchain, etc.).
- `journey-simulator/src/utils/particles.ts` — Utilitaire (API client, scores, export, blockchain, etc.).
- `journey-simulator/src/utils/progress.ts` — Utilitaire (API client, scores, export, blockchain, etc.).
- `journey-simulator/src/utils/sendToNotion.ts` — Utilitaire (API client, scores, export, blockchain, etc.).
- `journey-simulator/src/vite-env.d.ts` — Fichier du monorepo (voir chemin). Note: / <reference types="vite/client" />

</details>

<details>
<summary><strong>journey-simulator/tests (Playwright E2E)</strong> (22)</summary>

- `journey-simulator/tests/e2e-report/index.html` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/action-suggestions.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/builder-journey.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/dao-governance.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/deep-linking.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/demo-artifacts.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/demo-mode.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/full-journey.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/growth-agent.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/investor-demo-flow.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/investor-demo.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/journey-flow.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/journey-navigation-workflow.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/login-success.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/login.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/mint-debug.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/resource-validation.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/submit-mission.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/utils/journeyMocks.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/utils/pageStability.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/ux-enhancement.spec.ts` — Tests Playwright (E2E).
- `journey-simulator/tests/e2e/wallet-modal.spec.ts` — Tests Playwright (E2E).

</details>

<details>
<summary><strong>journey-simulator/docs (docs)</strong> (33)</summary>

- `journey-simulator/docs/agents/prompts/compliance.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/data.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/evaluator.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/onchain.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/orchestrator_zyno.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/agents/prompts/simulation.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/blockchain_integration_plan.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/cahier_charges_parcours_react.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/cahier_charges.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/community_voice_to_synaptic_strategy.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/Content_Maker_to_Cognitive_Publisher.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/contenu_parcours.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/c4_context.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/seq_login_siws.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/seq_mint.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/diagrams/seq_simulation.mmd` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/From_Project_Manager_to_Mission_Commander.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/mfai_mvp_spec_english_final.pdf` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/openapi/journey-simulator.yaml` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/project_documentation.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/protocol_paper_en.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/protocol_paper_en.pdf` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/Event.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/Journey.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/JourneyStepResponse.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/schemas/SimulationRun.schema.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/solana/idl/journey_simulator.json` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/system_blueprint.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/ui-ux/checklist.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/ui-ux/components.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/ui-ux/guide.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/web2_to_web3.md` — Documentation (diagrammes, schémas, specs).
- `journey-simulator/docs/web3_explorer_to_protocol_architect.md` — Documentation (diagrammes, schémas, specs).

</details>

<details>
<summary><strong>journey-simulator/public (assets)</strong> (84)</summary>

- `journey-simulator/public/documents/dao-launch-starter-kit.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/mfai-protocol-whitepaper-en.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/mfai-system-blueprint.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/mission-feedback-loops.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/pitch-deck-narrative-framework.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/rag-ingestion-playbook.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/token-strategy-sprint-template.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/documents/web2-to-web3-activation-guide.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/favicon.ico` — Assets statiques servis par Vite/Nginx.
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
- `journey-simulator/public/knowledge-vault/pitch-deck-narrative-framework.pptx` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/rag-ingestion-playbook.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/token-strategy-sprint-template.zip` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/knowledge-vault/web2-to-web3-activation-guide.pdf` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/manifest.json` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/playground/index.html` — Assets statiques servis par Vite/Nginx.
- `journey-simulator/public/polyfills-init.js` — Assets statiques servis par Vite/Nginx. Note: Critical polyfills that MUST load before any other code
- `journey-simulator/public/sw.js` — Assets statiques servis par Vite/Nginx. Note: Service Worker désactivé pour les tests

</details>

<details>
<summary><strong>mf-back/routes (Express routes)</strong> (17)</summary>

- `mf-back/routes/agent-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/analytics-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/auth-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/cours-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/dao-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/demo-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/export-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/favorites.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/feedback.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/health-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/index.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/journey-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/journeyLaunchRoutes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/rag-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/solana-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/user-routes.js` — Routes Express (endpoints HTTP).
- `mf-back/routes/zyno-routes.js` — Routes Express (endpoints HTTP).

</details>

<details>
<summary><strong>mf-back/controllers (business logic)</strong> (8)</summary>

- `mf-back/controllers/agent-run-controller.js` — Controllers (logique métier des endpoints).
- `mf-back/controllers/analytics-controller.js` — Controllers (logique métier des endpoints).
- `mf-back/controllers/cours-controller.js` — Controllers (logique métier des endpoints).
- `mf-back/controllers/dao-controller.js` — Controllers (logique métier des endpoints).
- `mf-back/controllers/demo-controller.js` — Controllers (logique métier des endpoints).
- `mf-back/controllers/journey-controller.js` — Controllers (logique métier des endpoints). Note: Stub for demo mode route to fix test errors
- `mf-back/controllers/journey-metrics-controller.js` — Controllers (logique métier des endpoints).
- `mf-back/controllers/user-controller.js` — Controllers (logique métier des endpoints).

</details>

<details>
<summary><strong>mf-back/models (Mongo schemas)</strong> (9)</summary>

- `mf-back/models/agent-run.js` — Models MongoDB (Mongoose schemas).
- `mf-back/models/agentFeedbackLog.js` — Models MongoDB (Mongoose schemas). Note: 📦 agentFeedbackLog.js — Mongoose model to log agent executions
- `mf-back/models/cours.js` — Models MongoDB (Mongoose schemas).
- `mf-back/models/DaoProposal.js` — Models MongoDB (Mongoose schemas).
- `mf-back/models/FavoriteResource.js` — Models MongoDB (Mongoose schemas).
- `mf-back/models/Journeys.js` — Models MongoDB (Mongoose schemas).
- `mf-back/models/MissionSubmission.js` — Models MongoDB (Mongoose schemas).
- `mf-back/models/user.js` — Models MongoDB (Mongoose schemas).
- `mf-back/models/userCoursProgress.js` — Models MongoDB (Mongoose schemas).

</details>

<details>
<summary><strong>mf-back/services (services)</strong> (3)</summary>

- `mf-back/services/collaterizeSimService.js` — Services (state, métriques, simulation).
- `mf-back/services/journey-metrics-service.js` — Services (state, métriques, simulation).
- `mf-back/services/journey-state-service.js` — Services (state, métriques, simulation).

</details>

<details>
<summary><strong>mf-back/orchestration (Zyno orchestration)</strong> (3)</summary>

- `mf-back/orchestration/agentsRegistry.js` — Orchestration Zyno (intent → agents → timeline).
- `mf-back/orchestration/journey-tasks.json` — Orchestration Zyno (intent → agents → timeline).
- `mf-back/orchestration/zynoOrchestrator.js` — Orchestration Zyno (intent → agents → timeline). Note: 🔁 Zyno Orchestrator (full logic)

</details>

<details>
<summary><strong>mf-back/agents (agents catalog)</strong> (28)</summary>

- `mf-back/agents/agent_template.js` — Agent IA (spécialisé). Note: 📄 agents/AgentTemplate.js
- `mf-back/agents/AgentFactory.js` — Agent IA (spécialisé).
- `mf-back/agents/AuditAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/BaseAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/BuilderAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/CoachAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/CommunityAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/DAOAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/DesignAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/DevAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/EducationAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/GovernanceAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/GrowthAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/GuideAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/InvestorAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/LaunchpadAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/NFTAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/OnboardingAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/PitchAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/ProductAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/ProtocolAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/ReflectionAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/SecurityAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/telemetryUtils.js` — Agent IA (spécialisé).
- `mf-back/agents/TokenAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/TokenomicsAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/Web3LegalAgent.js` — Agent IA (spécialisé).
- `mf-back/agents/ZynoAgent.js` — Agent IA (spécialisé).

</details>

<details>
<summary><strong>mf-back/rag (RAG clients)</strong> (2)</summary>

- `mf-back/rag/rag_client.js` — Client RAG (search/ingest + fallback). Note: 📄 rag/ragClient.js
- `mf-back/rag/ragClient.js` — Client RAG (search/ingest + fallback). Note: 📄 rag/ragClient.js

</details>

<details>
<summary><strong>mf-back/middleware (middlewares)</strong> (2)</summary>

- `mf-back/middleware/auth.js` — Middleware (auth, feature flags).
- `mf-back/middleware/featureFlags.js` — Middleware (auth, feature flags). Note: Feature flag middleware for gradual feature rollout

</details>

<details>
<summary><strong>mf-back/llm (LLM integration)</strong> (2)</summary>

- `mf-back/llm/callGpt5.js` — Intégration LLM (OpenAI/GPT-5, etc.).
- `mf-back/llm/openaiClient.js` — Intégration LLM (OpenAI/GPT-5, etc.).

</details>

<details>
<summary><strong>mf-back/scripts (utility scripts)</strong> (3)</summary>

- `mf-back/scripts/check-rag-connection.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/rag_upload.js` — Scripts utilitaires backend (RAG, verify flow).
- `mf-back/scripts/verify-journey-flow.js` — Scripts utilitaires backend (RAG, verify flow).

</details>

<details>
<summary><strong>mf-back/__tests__ (backend tests)</strong> (14)</summary>

- `mf-back/__tests__/admin.rag.e2e.test.js` — Tests backend.
- `mf-back/__tests__/agents.test.js` — Tests backend.
- `mf-back/__tests__/demoMission.test.js` — Tests backend.
- `mf-back/__tests__/fixtures/demo_mission.json` — Tests backend.
- `mf-back/__tests__/journeyController.step.test.js` — Tests backend.
- `mf-back/__tests__/parcoursTemplates.test.js` — Tests backend.
- `mf-back/__tests__/ragClient.fallback.integration.test.js` — Tests backend.
- `mf-back/__tests__/ragClient.remote.test.js` — Tests backend.
- `mf-back/__tests__/ragClient.test.js` — Tests backend.
- `mf-back/__tests__/routes.admin.test.js` — Tests backend.
- `mf-back/__tests__/routes.dao.test.js` — Tests backend.
- `mf-back/__tests__/routes.export.test.js` — Tests backend.
- `mf-back/__tests__/routes.orchestration.test.js` — Tests backend.
- `mf-back/__tests__/zynoOrchestrator.test.js` — Tests backend.

</details>

<details>
<summary><strong>.github/workflows (CI/CD)</strong> (6)</summary>

- `.github/workflows/backend-tests.yml` — CI/CD (GitHub Actions).
- `.github/workflows/ci.yml` — CI/CD (GitHub Actions).
- `.github/workflows/e2e-nightly.yml` — CI/CD (GitHub Actions).
- `.github/workflows/release.yml` — CI/CD (GitHub Actions).
- `.github/workflows/test-agents.yml` — CI/CD (GitHub Actions).
- `.github/workflows/verify.yml` — CI/CD (GitHub Actions).

</details>

<details>
<summary><strong>scripts (monorepo scripts)</strong> (7)</summary>

- `scripts/ci-verify.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/deploy_docker.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/deploy_pm2.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/full_stack_smoke.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/mcp-selftest.mjs` — Scripts monorepo (verify, smoke, deploy).
- `scripts/prod-local-down.sh` — Scripts monorepo (verify, smoke, deploy).
- `scripts/prod-local-up.sh` — Scripts monorepo (verify, smoke, deploy).

</details>

<details>
<summary><strong>Autres fichiers (root / infra / configs)</strong> (412)</summary>

- `.agent/workflows/verify_demo_mode.md` — Fichier du monorepo (voir chemin).
- `.cursor/mcp.json` — Fichier du monorepo (voir chemin).
- `.deploy.env` — Fichier du monorepo (voir chemin).
- `.deploy.env.example` — Fichier du monorepo (voir chemin).
- `.eslintignore` — Fichier du monorepo (voir chemin).
- `.gemini/AUDIT_COMPLET.md` — Fichier du monorepo (voir chemin).
- `.gemini/AUDIT_SUMMARY.md` — Fichier du monorepo (voir chemin).
- `.gemini/BACKEND_VERIFICATION_REPORT.md` — Fichier du monorepo (voir chemin).
- `.gemini/COMPLETE_SYSTEM_VERIFICATION.md` — Fichier du monorepo (voir chemin).
- `.gemini/CURRENT_TEST_SETUP.md` — Fichier du monorepo (voir chemin).
- `.gemini/E2E_TESTS_FIX_SUMMARY.md` — Fichier du monorepo (voir chemin).
- `.gemini/FINAL_TEST_REPORT.md` — Fichier du monorepo (voir chemin).
- `.gemini/FIX_COMPLETE_PHASE_BUTTON.md` — Fichier du monorepo (voir chemin).
- `.gemini/FIX_DEVTOOLS_AUTO_OPEN.md` — Fichier du monorepo (voir chemin).
- `.gemini/FIX_LLM_MODEL_DEFAULT.md` — Fichier du monorepo (voir chemin).
- `.gemini/FIX_OPENAI_MOCK.md` — Fichier du monorepo (voir chemin).
- `.gemini/FIX_OPENAI_VERSION.md` — Fichier du monorepo (voir chemin).
- `.gemini/FIX_UI_SELECTS.md` — Fichier du monorepo (voir chemin).
- `.gemini/FIXES_APPLIED.md` — Fichier du monorepo (voir chemin).
- `.gemini/IMPLEMENTATION_PLAN.md` — Fichier du monorepo (voir chemin).
- `.gemini/IMPLEMENTATION_PROGRESS.md` — Fichier du monorepo (voir chemin).
- `.gemini/MANUAL_TESTING_GUIDE.md` — Fichier du monorepo (voir chemin).
- `.gemini/MIGRATION_GPT_5_1.md` — Fichier du monorepo (voir chemin).
- `.gemini/MISSION_ACCOMPLISHED.md` — Fichier du monorepo (voir chemin).
- `.gemini/MVP_COMPLETION_CHECKLIST.md` — Fichier du monorepo (voir chemin).
- `.gemini/OPENAI_API_DIAGNOSTIC.md` — Fichier du monorepo (voir chemin).
- `.gemini/PLAN_ACTION_URGENT.md` — Fichier du monorepo (voir chemin).
- `.gemini/PRIORITY_4_COMPLETE.md` — Fichier du monorepo (voir chemin).
- `.gemini/PRIORITY_5_COMPLETE.md` — Fichier du monorepo (voir chemin).
- `.gemini/PROJECT_AUDIT_REPORT.md` — Fichier du monorepo (voir chemin).
- `.gemini/README.md` — Fichier du monorepo (voir chemin).
- `.gemini/READY_FOR_TESTING.md` — Fichier du monorepo (voir chemin).
- `.gemini/RESOURCE_IMPROVEMENTS.md` — Fichier du monorepo (voir chemin).
- `.gemini/RESUME_FINAL_TESTS.md` — Fichier du monorepo (voir chemin).
- `.gemini/ROLLBACK_GPT_4O.md` — Fichier du monorepo (voir chemin).
- `.gemini/SESSION_COMPLETE.md` — Fichier du monorepo (voir chemin).
- `.gemini/SW_DISABLE_INSTRUCTIONS.md` — Fichier du monorepo (voir chemin).
- `.gemini/SYNTHESE_AUDIT.md` — Fichier du monorepo (voir chemin).
- `.gemini/TEST_CREDENTIALS.md` — Fichier du monorepo (voir chemin).
- `.gemini/TEST_RESULTS_E2E.md` — Fichier du monorepo (voir chemin).
- `.gemini/TEST_RESULTS_FINAL.md` — Fichier du monorepo (voir chemin).
- `.gemini/TEST_RESULTS_PARTIAL.md` — Fichier du monorepo (voir chemin).
- `.gemini/TESTING_GUIDE_PRIORITY_4.md` — Fichier du monorepo (voir chemin).
- `.gemini/TESTING_PLAN.md` — Fichier du monorepo (voir chemin).
- `.gemini/TESTING_RESOURCES_SUMMARY.md` — Fichier du monorepo (voir chemin).
- `.gemini/TESTS_DEEP_LINKING_RESOURCES.md` — Fichier du monorepo (voir chemin).
- `.gemini/UI_HEADER_IMPROVEMENTS.md` — Fichier du monorepo (voir chemin).
- `.gemini/UI_IMPROVEMENTS.md` — Fichier du monorepo (voir chemin).
- `.github/copilot-instructions.md` — Fichier du monorepo (voir chemin).
- `.github/dependabot.yml` — Fichier du monorepo (voir chemin).
- `.github/ISSUE_TEMPLATE.md` — Fichier du monorepo (voir chemin).
- `.github/pull_request_template.md` — Fichier du monorepo (voir chemin).
- `.github/PULL_REQUEST_TEMPLATE.md` — Fichier du monorepo (voir chemin).
- `.gitignore` — Fichier du monorepo (voir chemin).
- `.hintrc` — Fichier du monorepo (voir chemin).
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
- `audit_compliance.sh` — Fichier du monorepo (voir chemin).
- `audit.md` — Fichier du monorepo (voir chemin).
- `cahier_charges_agents.md` — Fichier du monorepo (voir chemin).
- `cahier_charges_ameliorations_UI_UX.md` — Fichier du monorepo (voir chemin).
- `cahier_charges_demo_artefacts.md` — Fichier du monorepo (voir chemin).
- `cahier_charges_gpt5_1_zyno.md` — Fichier du monorepo (voir chemin).
- `cahier_charges_gpt5_1.md` — Fichier du monorepo (voir chemin).
- `cahier_charges_high_fidelity_simulation.md` — Fichier du monorepo (voir chemin).
- `cahier_charges_ressources_html.md` — Fichier du monorepo (voir chemin).
- `CHANGELOG.md` — Fichier du monorepo (voir chemin).
- `checklist.md` — Fichier du monorepo (voir chemin).
- `contributing.md` — Fichier du monorepo (voir chemin).
- `CONTRIBUTING.md` — Fichier du monorepo (voir chemin).
- `DEPLOY_SERVER.md` — Fichier du monorepo (voir chemin).
- `DEPLOY.md` — Fichier du monorepo (voir chemin).
- `deploy.sh` — Fichier du monorepo (voir chemin).
- `DEPLOYMENT_INSTRUCTIONS.md` — Fichier du monorepo (voir chemin).
- `docker_output.log` — Fichier du monorepo (voir chemin).
- `docker-compose.deploy.yml` — Docker Compose (dev/prod).
- `docker-compose.prod.yml` — Docker Compose (dev/prod).
- `docker-compose.yml` — Docker Compose (dev/prod).
- `docs/acceptance/checklist.md` — Fichier du monorepo (voir chemin).
- `docs/acceptance/validation_plan.md` — Fichier du monorepo (voir chemin).
- `docs/AGENT_RUNS.md` — Fichier du monorepo (voir chemin).
- `docs/API_CONTRACT_MF_BACK.md` — Fichier du monorepo (voir chemin).
- `docs/ARCHITECTURE_DATA.md` — Fichier du monorepo (voir chemin).
- `docs/architecture_multi_agents.md` — Fichier du monorepo (voir chemin).
- `docs/ARCHITECTURE.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/AMELIORATIONS_APPLIQUEES.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/audit_11_12_25.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/SYNTHESE_AUDIT_CORRECTIONS.md` — Fichier du monorepo (voir chemin).
- `docs/audit/archive/VERIFICATION_FINALE_AUDIT.md` — Fichier du monorepo (voir chemin).
- `docs/audit/audit_report.md` — Fichier du monorepo (voir chemin).
- `docs/AUTH_FLOWS.md` — Fichier du monorepo (voir chemin).
- `docs/cicd/pipeline.md` — Fichier du monorepo (voir chemin).
- `docs/cicd/rollback.md` — Fichier du monorepo (voir chemin).
- `docs/demo_script.md` — Fichier du monorepo (voir chemin).
- `docs/demo/fallbacks.md` — Fichier du monorepo (voir chemin).
- `docs/demo/script.md` — Fichier du monorepo (voir chemin).
- `docs/DEPENDENCIES_JOURNEY_SIMULATOR.md` — Fichier du monorepo (voir chemin).
- `docs/HEALTHCHECK.md` — Fichier du monorepo (voir chemin).
- `docs/idl/solana_devnet_flow.md` — Fichier du monorepo (voir chemin).
- `docs/INVESTOR_DEMO_FLOW.md` — Fichier du monorepo (voir chemin).
- `docs/journey_mfai_back_front.code-workspace` — Fichier du monorepo (voir chemin).
- `docs/JOURNEY_STATE_MACHINE.md` — Fichier du monorepo (voir chemin).
- `docs/MCP_RUNBOOK_FR.md` — Fichier du monorepo (voir chemin).
- `docs/MCP_SETUP_FR.md` — Fichier du monorepo (voir chemin).
- `docs/MOBILE_WALLET_TESTING.md` — Fichier du monorepo (voir chemin).
- `docs/MONOREPO_DX.md` — Fichier du monorepo (voir chemin).
- `docs/next_steps_ui_rework.md` — Fichier du monorepo (voir chemin).
- `docs/observability/metrics.md` — Fichier du monorepo (voir chemin).
- `docs/onboarding/quickstart.md` — Fichier du monorepo (voir chemin).
- `docs/openapi/journey-simulator.yaml` — Fichier du monorepo (voir chemin).
- `docs/openapi/mf-back.openapi.yaml` — Fichier du monorepo (voir chemin).
- `docs/openapi/preview.html` — Fichier du monorepo (voir chemin).
- `docs/PLATFORM_DEEP_DIVE_FR.md` — Fichier du monorepo (voir chemin).
- `docs/process/DoR_DoD.md` — Fichier du monorepo (voir chemin).
- `docs/product/cahier_TOC.md` — Fichier du monorepo (voir chemin).
- `docs/product/vision_mvp_personas_stories.md` — Fichier du monorepo (voir chemin).
- `docs/prompts/evaluator.md` — Fichier du monorepo (voir chemin).
- `docs/prompts/zyno.md` — Fichier du monorepo (voir chemin).
- `docs/risk_register.md` — Fichier du monorepo (voir chemin).
- `docs/roadmap/vNext.md` — Fichier du monorepo (voir chemin).
- `docs/schemas/README.md` — Fichier du monorepo (voir chemin).
- `docs/SECURITY.md` — Fichier du monorepo (voir chemin).
- `docs/security/compliance_check.md` — Fichier du monorepo (voir chemin).
- `docs/security/hardening.md` — Fichier du monorepo (voir chemin).
- `docs/solana_spec.md` — Fichier du monorepo (voir chemin).
- `docs/system_blueprint.md` — Fichier du monorepo (voir chemin).
- `docs/WEB3_INTEGRATION.md` — Fichier du monorepo (voir chemin).
- `docs/zyno_interaction_improvement.md` — Fichier du monorepo (voir chemin).
- `ecosystem.config.cjs` — Fichier du monorepo (voir chemin).
- `FETCH_HEAD` — Fichier du monorepo (voir chemin).
- `GUIDE_PLATFORM.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/.dockerignore` — Fichier du monorepo (voir chemin).
- `journey-simulator/.eslintignore` — Fichier du monorepo (voir chemin).
- `journey-simulator/.eslintrc.cjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/.github/workflows/ci.yml` — Fichier du monorepo (voir chemin).
- `journey-simulator/.github/workflows/release.yml` — Fichier du monorepo (voir chemin).
- `journey-simulator/.gitignore` — Fichier du monorepo (voir chemin).
- `journey-simulator/.storybook/main.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/.storybook/preview.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/.vscode/settings.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/cahier_charges_amelioration_front.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/copilot_prompt.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/cypress.config.js` — Fichier du monorepo (voir chemin).
- `journey-simulator/cypress/e2e/navigation.cy.js` — Tests Cypress (optionnel/legacy).
- `journey-simulator/cypress/support/commands.js` — Tests Cypress (optionnel/legacy).
- `journey-simulator/cypress/support/index.js` — Tests Cypress (optionnel/legacy).
- `journey-simulator/debug_page.html` — Fichier du monorepo (voir chemin).
- `journey-simulator/Dockerfile` — Dockerfile (build image).
- `journey-simulator/env.example` — Fichier du monorepo (voir chemin).
- `journey-simulator/frontend.log` — Fichier du monorepo (voir chemin).
- `journey-simulator/FROZEN_README.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/index.html` — Fichier du monorepo (voir chemin).
- `journey-simulator/integration_guide_journey.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/LICENSE` — Fichier du monorepo (voir chemin).
- `journey-simulator/nginx.conf` — Fichier du monorepo (voir chemin).
- `journey-simulator/package-lock.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/package.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/playwright.config.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/playwright.prod.config.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/postcss.config.js` — Fichier du monorepo (voir chemin).
- `journey-simulator/README.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-api-surface.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-file-index.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/generate-phases-table.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/scripts/update-readme-autogen.mjs` — Fichier du monorepo (voir chemin).
- `journey-simulator/server.log` — Fichier du monorepo (voir chemin).
- `journey-simulator/tailwind.config.js` — Fichier du monorepo (voir chemin).
- `journey-simulator/todo_refonte_frontend_zyno.md` — Fichier du monorepo (voir chemin).
- `journey-simulator/tsconfig.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/tsconfig.node.json` — Fichier du monorepo (voir chemin).
- `journey-simulator/vite.config.ts` — Fichier du monorepo (voir chemin).
- `journey-simulator/vitest.config.ts` — Fichier du monorepo (voir chemin).
- `LICENSE` — Fichier du monorepo (voir chemin).
- `Makefile` — Fichier du monorepo (voir chemin).
- `mcp.json` — Fichier du monorepo (voir chemin).
- `mf-back/.dockerignore` — Fichier du monorepo (voir chemin).
- `mf-back/.gitignore` — Fichier du monorepo (voir chemin).
- `mf-back/app.js` — Entrypoint Express: middlewares + routes + probes + Mongo.
- `mf-back/backend_3002.log` — Fichier du monorepo (voir chemin).
- `mf-back/backend.log` — Fichier du monorepo (voir chemin).
- `mf-back/bin/www` — Fichier du monorepo (voir chemin).
- `mf-back/config/dao-config.js` — Fichier du monorepo (voir chemin). Note: DAO Configuration for Journey Simulator
- `mf-back/config/env.js` — Fichier du monorepo (voir chemin).
- `mf-back/debug_agent_logs.js` — Fichier du monorepo (voir chemin).
- `mf-back/debug_gpt5.js` — Fichier du monorepo (voir chemin).
- `mf-back/docker-entrypoint.sh` — Fichier du monorepo (voir chemin).
- `mf-back/Dockerfile` — Dockerfile (build image).
- `mf-back/docs/backend-architecture.md` — Fichier du monorepo (voir chemin).
- `mf-back/env.example` — Fichier du monorepo (voir chemin).
- `mf-back/env.production.example` — Fichier du monorepo (voir chemin).
- `mf-back/FROZEN_README.md` — Fichier du monorepo (voir chemin).
- `mf-back/logs/agent_feedback.json` — Fichier du monorepo (voir chemin).
- `mf-back/memory/agent_memory.js` — Fichier du monorepo (voir chemin). Note: Persistent Agent Memory System with basic file persistence
- `mf-back/memory/agent_memory.json` — Fichier du monorepo (voir chemin).
- `mf-back/memory/agent_metrics.js` — Fichier du monorepo (voir chemin). Note: memory/agent_metrics.js
- `mf-back/memory/agent_metrics.log.json` — Fichier du monorepo (voir chemin).
- `mf-back/metrics/computeAEPO.js` — Fichier du monorepo (voir chemin).
- `mf-back/nodemon.json` — Fichier du monorepo (voir chemin).
- `mf-back/package-lock.json` — Fichier du monorepo (voir chemin).
- `mf-back/package.json` — Fichier du monorepo (voir chemin).
- `mf-back/public/stylesheets/style.css` — Fichier du monorepo (voir chemin).
- `mf-back/README.md` — Fichier du monorepo (voir chemin).
- `mf-back/run_agent.js` — Fichier du monorepo (voir chemin).
- `mf-back/server_demo_fix.log` — Fichier du monorepo (voir chemin).
- `mf-back/server_final_v2.log` — Fichier du monorepo (voir chemin).
- `mf-back/server_final.log` — Fichier du monorepo (voir chemin).
- `mf-back/server_fixed_2.log` — Fichier du monorepo (voir chemin).
- `mf-back/server_fixed.log` — Fichier du monorepo (voir chemin).
- `mf-back/server.js` — Bootstrap serveur (runtime).
- `mf-back/server.log` — Fichier du monorepo (voir chemin).
- `mf-back/server.pid` — Fichier du monorepo (voir chemin).
- `mf-back/test_openai_structure.js` — Fichier du monorepo (voir chemin).
- `mf-back/test-dao-backend.sh` — Fichier du monorepo (voir chemin).
- `mf-back/test-dao-results.log` — Fichier du monorepo (voir chemin).
- `mf-back/test-demo-mode.sh` — Fichier du monorepo (voir chemin).
- `mf-back/tests/agent-idempotence.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/agent-runs.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/controllers.spec.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/e2e/orchestrator_with_feedback.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/feedback.test.js` — Fichier du monorepo (voir chemin). Note: @file feedback.test.js @description Unit tests for POST /api/feedback endpoint / const request = require('supertest'); const express = requi
- `mf-back/tests/integration/multiAgentFeedback.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/integration/resourceValidator.integration.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/journey-metrics.test.js` — Fichier du monorepo (voir chemin). Note: Define mocks BEFORE requiring the service
- `mf-back/tests/journey-state.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/manual_rag.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/reproduce_quiz_error.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/routes.supertest.spec.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/BaseAgent.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/computeAEPO.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/journeyController.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/nft_verification.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/unit/resourceValidator.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/user-guardrails.test.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/verify_phase_mapping.js` — Fichier du monorepo (voir chemin).
- `mf-back/tests/wallet-auth.test.js` — Fichier du monorepo (voir chemin). Note: Mock env
- `mf-back/utils/aepoAeco.js` — Fichier du monorepo (voir chemin). Note: AEPO / AECO — Unified definitions for backend logs, API payloads, and documentation. - AEPO (AI-Enhanced Pathway Orchestration): Zyno-driven
- `mf-back/utils/agent-idempotence.js` — Fichier du monorepo (voir chemin).
- `mf-back/utils/computeAEPO.js` — Fichier du monorepo (voir chemin). Note: utils/computeAEPO.js (legacy wrapper)
- `mf-back/utils/llmLogger.js` — Fichier du monorepo (voir chemin). Note: LLM Tracing Logger Structured logging for all LLM/Agent interactions Tracks: userId, journeyId, agent, duration, tokens, success/failure / c
- `mf-back/utils/openaiClient.js` — Fichier du monorepo (voir chemin).
- `mf-back/utils/resourceValidator.js` — Fichier du monorepo (voir chemin).
- `mf-back/utils/solana.js` — Fichier du monorepo (voir chemin).
- `mf-back/views/error.jade` — Fichier du monorepo (voir chemin).
- `mf-back/views/error.pug` — Fichier du monorepo (voir chemin).
- `mf-back/views/index.jade` — Fichier du monorepo (voir chemin).
- `mf-back/views/index.pug` — Fichier du monorepo (voir chemin).
- `mf-back/views/layout.jade` — Fichier du monorepo (voir chemin).
- `mf-back/views/layout.pug` — Fichier du monorepo (voir chemin).
- `MVP_STATUS.md` — Fichier du monorepo (voir chemin).
- `package-lock.json` — Fichier du monorepo (voir chemin).
- `package.json` — Fichier du monorepo (voir chemin).
- `README.md` — Fichier du monorepo (voir chemin).
- `start_dev.sh` — Fichier du monorepo (voir chemin).
- `TEST_PLAN.md` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/mf-back.log` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/mf-back.pid` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/simulator.log` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/simulator.pid` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/web.log` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/web.pid` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/worker-mint.log` — Fichier du monorepo (voir chemin).
- `tmp/prod-local/worker-mint.pid` — Fichier du monorepo (voir chemin).
- `tools/mcp/fetch-server.mjs` — Fichier du monorepo (voir chemin).
- `tools/mcp/filesystem-ro.mjs` — Fichier du monorepo (voir chemin).
- `tools/mcp/git-server.mjs` — Fichier du monorepo (voir chemin).
- `verify-production.sh` — Fichier du monorepo (voir chemin).
- `verify-server-env.sh` — Fichier du monorepo (voir chemin).
- `web/.dockerignore` — Fichier du monorepo (voir chemin).
- `web/.eslintrc.json` — Fichier du monorepo (voir chemin).
- `web/.github/workflows/ci.yml` — Fichier du monorepo (voir chemin).
- `web/.gitignore` — Fichier du monorepo (voir chemin).
- `web/.nvmrc` — Fichier du monorepo (voir chemin).
- `web/.prettierrc` — Fichier du monorepo (voir chemin).
- `web/app/api/agents/logs/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/ai/echo/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/auth/nonce/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/auth/siws/challenge/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/auth/siws/verify/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/auth/verify/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/dao/vote/simulate/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/health/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/healthz/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/integrations/collaterize/simulate/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/journeys/[id]/state/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/journeys/[id]/step/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/journeys/[id]/submit/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/journeys/audit/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/journeys/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/metadata/pass/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/metadata/proof-of-skill/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/metrics/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/mint/execute/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/mint/last/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/mint/simulate/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/mint/status/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/pass/check/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/rag/doc/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/rag/ingest-batch/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/rag/ingest/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/rag/query/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/rag/search/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/stake/simulate/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/api/tx/prepare/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/global-error.tsx` — Fichier du monorepo (voir chemin).
- `web/app/globals.css` — Fichier du monorepo (voir chemin).
- `web/app/instrumentation.ts` — Fichier du monorepo (voir chemin).
- `web/app/journey/user-progress/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/layout.tsx` — Fichier du monorepo (voir chemin).
- `web/app/page.tsx` — Fichier du monorepo (voir chemin).
- `web/app/user/login/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/user/logout/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/user/profile/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/user/refresh/route.ts` — Fichier du monorepo (voir chemin).
- `web/app/user/register/route.ts` — Fichier du monorepo (voir chemin).
- `web/CHANGELOG.md` — Fichier du monorepo (voir chemin).
- `web/deploy/nginx/next.conf.sample` — Fichier du monorepo (voir chemin).
- `web/deploy/systemd/journey-web.service` — Fichier du monorepo (voir chemin).
- `web/Dockerfile` — Dockerfile (build image).
- `web/e2e/basic.spec.ts` — Fichier du monorepo (voir chemin).
- `web/env.example` — Fichier du monorepo (voir chemin).
- `web/jest.config.ts` — Fichier du monorepo (voir chemin).
- `web/jest.setup.ts` — Fichier du monorepo (voir chemin).
- `web/middleware.ts` — Fichier du monorepo (voir chemin).
- `web/minter.json` — Fichier du monorepo (voir chemin).
- `web/next-env.d.ts` — Fichier du monorepo (voir chemin). Note: / <reference types="next" />
- `web/next.config.mjs` — Fichier du monorepo (voir chemin).
- `web/package-lock.json` — Fichier du monorepo (voir chemin).
- `web/package.json` — Fichier du monorepo (voir chemin).
- `web/packages/agents/orchestrator/index.ts` — Fichier du monorepo (voir chemin).
- `web/packages/agents/patterns/safety.ts` — Fichier du monorepo (voir chemin).
- `web/packages/agents/tools/solana.ts` — Fichier du monorepo (voir chemin).
- `web/playwright.config.ts` — Fichier du monorepo (voir chemin).
- `web/postcss.config.js` — Fichier du monorepo (voir chemin).
- `web/prisma/migrations/20251118155543_add_agentlog_user_idx/migration.sql` — Fichier du monorepo (voir chemin).
- `web/prisma/migrations/migration_lock.toml` — Fichier du monorepo (voir chemin).
- `web/prisma/schema.prisma` — Fichier du monorepo (voir chemin).
- `web/prisma/seed.ts` — Fichier du monorepo (voir chemin).
- `web/public/grid.svg` — Fichier du monorepo (voir chemin).
- `web/public/openapi.yaml` — Fichier du monorepo (voir chemin).
- `web/README.md` — Fichier du monorepo (voir chemin).
- `web/scripts/check-minter-balance.ts` — Fichier du monorepo (voir chemin).
- `web/scripts/check-minter-status.ts` — Fichier du monorepo (voir chemin).
- `web/scripts/gen-minter.ts` — Fichier du monorepo (voir chemin).
- `web/scripts/run-mint-worker.ts` — Fichier du monorepo (voir chemin).
- `web/sentry.client.config.ts` — Fichier du monorepo (voir chemin).
- `web/sentry.server.config.ts` — Fichier du monorepo (voir chemin).
- `web/server/metrics.ts` — Fichier du monorepo (voir chemin). Note: Basic metrics collector for Money Factory AI
- `web/server/signer.ts` — Fichier du monorepo (voir chemin).
- `web/src/__tests__/agents.orchestrator.test.ts` — Fichier du monorepo (voir chemin).
- `web/src/__tests__/api.ai.echo.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' describe('API /api/ai/echo', () => { it('POST returns 400 for bad request', async () => { const m
- `web/src/__tests__/api.collaterize.logic.test.ts` — Fichier du monorepo (voir chemin).
- `web/src/__tests__/api.health.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' describe('API /api/health', () => { it('GET returns ok', async () => { const mod = await import('
- `web/src/__tests__/api.journeys.state.logs.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' describe('API /api/journeys/[id]/state and /api/agents/logs', () => { it('returns 404 when state
- `web/src/__tests__/api.journeys.step.actionId.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' const sampleOut = { metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn',
- `web/src/__tests__/api.journeys.step.audit.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' describe('API /api/journeys/[id]/step & /api/journeys/audit', () => { it('POST /step returns Jour
- `web/src/__tests__/api.journeys.step.bad.test.ts` — Fichier du monorepo (voir chemin). Note: describe('API /api/journeys/[id]/step bad request', () => { it('returns 400 when body invalid', async () => { const mod = await import('../.
- `web/src/__tests__/api.journeys.step.llm.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' const sampleOut = { metadata: { persona_id: 'p', journey_track: 't', phase_id: 'ph', language: 'f
- `web/src/__tests__/api.journeys.step.replay.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' describe('API /api/journeys/[id]/step demo replay', () => { it('returns demo step when replay=1',
- `web/src/__tests__/api.journeys.submit.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' // Force module mock before route import when testing LLM path const sampleEval = { metadata: { p
- `web/src/__tests__/api.journeys.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' jest.mock('../server/db', () => ({ prisma: { journey: { findMany: jest.fn(async () => []), create
- `web/src/__tests__/api.metrics.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' describe('API /api/metrics', () => { it('GET returns counters', async () => { const mod = await i
- `web/src/__tests__/api.mint.execute.error.test.ts` — Fichier du monorepo (voir chemin). Note: jest.mock('../../src/server/queue', () => ({ mintQueue: { add: jest.fn(async () => { throw new Error('Queue error') }), }, })) describe('API
- `web/src/__tests__/api.mint.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' jest.mock('@/server/db', () => ({ prisma: { mintLog: { create: jest.fn(async () => ({ id: 'm1' })
- `web/src/__tests__/api.misc.coverage.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' describe('Misc API coverage', () => { it('GET /api/healthz returns ok', async () => { const mod =
- `web/src/__tests__/api.rag.batch.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' const mockDb = { doc: { create: jest.fn(async (d: any) => ({ id: 'd' + Math.random(), ...d.data }
- `web/src/__tests__/api.rag.test.ts` — Fichier du monorepo (voir chemin). Note: import { POST as queryPost } from '../../app/api/rag/query/route' import { POST as docPost } from '../../app/api/rag/doc/route' import { POS
- `web/src/__tests__/api.siws.redis.test.ts` — Fichier du monorepo (voir chemin).
- `web/src/__tests__/api.tx.prepare.test.ts` — Fichier du monorepo (voir chemin). Note: import { NextResponse } from 'next/server' jest.mock('@solana/web3.js', () => { class PublicKey { constructor(_: string) {} } class Connecti
- `web/src/__tests__/embeddings.test.ts` — Fichier du monorepo (voir chemin).
- `web/src/__tests__/walletProvider.test.tsx` — Fichier du monorepo (voir chemin).
- `web/src/__tests__/worker.mint.test.ts` — Fichier du monorepo (voir chemin).
- `web/src/components/Artifacts/ArtifactModal.tsx` — Fichier du monorepo (voir chemin).
- `web/src/components/Artifacts/NeuralOverlay.tsx` — Fichier du monorepo (voir chemin).
- `web/src/components/AuthProvider.tsx` — Fichier du monorepo (voir chemin).
- `web/src/components/Journey/UIBlocksRenderer.tsx` — Fichier du monorepo (voir chemin).
- `web/src/components/WalletProvider.tsx` — Fichier du monorepo (voir chemin).
- `web/src/hooks/useAuth.ts` — Fichier du monorepo (voir chemin).
- `web/src/infra/openaiConfig.ts` — Fichier du monorepo (voir chemin).
- `web/src/lib/prisma.ts` — Fichier du monorepo (voir chemin).
- `web/src/lib/solana/checkPassOnChain.ts` — Fichier du monorepo (voir chemin). Note: DAS API Response Types
- `web/src/mocks/handlers.ts` — Fichier du monorepo (voir chemin).
- `web/src/mocks/msw-node.js` — Fichier du monorepo (voir chemin).
- `web/src/mocks/msw.js` — Fichier du monorepo (voir chemin).
- `web/src/mocks/server.ts` — Fichier du monorepo (voir chemin).
- `web/src/mocks/setup.ts` — Fichier du monorepo (voir chemin).
- `web/src/mocks/until-async.js` — Fichier du monorepo (voir chemin).
- `web/src/server/db.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/demoArtifacts.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/embeddings.ts` — Fichier du monorepo (voir chemin). Note: Deterministic tiny embedding to avoid external dependencies (for MVP & tests)
- `web/src/server/journeyStepResponse.schema.ts` — Fichier du monorepo (voir chemin). Note: Minimal schema subset for runtime validation
- `web/src/server/logger.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/metrics.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/queue.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/ragStore.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/rateLimit.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/redis.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/signer.ts` — Fichier du monorepo (voir chemin). Note: SimSigner interface for future KMS/HSM integration
- `web/src/server/siwsStore.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/state.ts` — Fichier du monorepo (voir chemin).
- `web/src/server/zyno.ts` — Fichier du monorepo (voir chemin).
- `web/src/workers/mintWorker.ts` — Fichier du monorepo (voir chemin).
- `web/tailwind.config.ts` — Fichier du monorepo (voir chemin).
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
| `/dao` | ✅ | `journey-simulator/src/App.tsx` |
| `/dashboard` | ✅ | `journey-simulator/src/App.tsx` |
| `/debug/mint` | ✅ | `journey-simulator/src/App.tsx` |
| `/guide` | ✅ | `journey-simulator/src/App.tsx` |
| `/journeys` | ✅ | `journey-simulator/src/App.tsx` |
| `/journeys/:journeyId` | ✅ | `journey-simulator/src/App.tsx` |
| `/journeys/completed` | ✅ | `journey-simulator/src/App.tsx` |
| `/journeys/demo` | ✅ | `journey-simulator/src/App.tsx` |
| `/login` | — | `journey-simulator/src/App.tsx` |
| `/playground` | ✅ | `journey-simulator/src/App.tsx` |
| `/register` | — | `journey-simulator/src/App.tsx` |
| `/resources` | ✅ | `journey-simulator/src/App.tsx` |
| `/support` | ✅ | `journey-simulator/src/App.tsx` |
| `/zyno` | ✅ | `journey-simulator/src/App.tsx` |

### Endpoints backend (Express)

| Method | Path | Source (route file) |
|---|---|---|
| `GET` | `/` | `mf-back/routes/index.js` |
| `GET` | `/admin/rag/documents` | `mf-back/routes/rag-routes.js` |
| `POST` | `/admin/rag/upload` | `mf-back/routes/rag-routes.js` |
| `POST` | `/auth/connect-wallet` | `mf-back/routes/auth-routes.js` |
| `POST` | `/auth/login` | `mf-back/routes/auth-routes.js` |
| `GET` | `/auth/me` | `mf-back/routes/auth-routes.js` |
| `POST` | `/auth/refresh` | `mf-back/routes/auth-routes.js` |
| `POST` | `/auth/register` | `mf-back/routes/auth-routes.js` |
| `POST` | `/auth/verify` | `mf-back/routes/auth-routes.js` |
| `GET` | `/dao/config` | `mf-back/routes/dao-routes.js` |
| `GET` | `/dao/proposals` | `mf-back/routes/dao-routes.js` |
| `POST` | `/dao/proposals` | `mf-back/routes/dao-routes.js` |
| `POST` | `/dao/proposals/:id/close` | `mf-back/routes/dao-routes.js` |
| `POST` | `/dao/proposals/:id/vote` | `mf-back/routes/dao-routes.js` |
| `POST` | `/demo/save` | `mf-back/routes/demo-routes.js` |
| `GET` | `/demo/state` | `mf-back/routes/demo-routes.js` |
| `GET` | `/health` | `mf-back/app.js` |
| `GET` | `/healthz` | `mf-back/app.js` |
| `GET` | `/journey/:id/metrics` | `mf-back/routes/journey-routes.js` |
| `POST` | `/journey/:journeyId/step` | `mf-back/routes/journey-routes.js` |
| `POST` | `/journey/:journeyId/submit` | `mf-back/routes/journey-routes.js` |
| `POST` | `/journey/add-journey` | `mf-back/routes/journey-routes.js` |
| `GET` | `/journey/all-journey` | `mf-back/routes/journey-routes.js` |
| `GET` | `/journey/artifacts` | `mf-back/routes/journey-routes.js` |
| `POST` | `/journey/complete-phase` | `mf-back/routes/journey-routes.js` |
| `DELETE` | `/journey/delete/:id` | `mf-back/routes/journey-routes.js` |
| `POST` | `/journey/load-demo` | `mf-back/routes/journey-routes.js` |
| `GET` | `/journey/metrics` | `mf-back/routes/journey-routes.js` |
| `POST` | `/journey/reset-progress` | `mf-back/routes/journey-routes.js` |
| `GET` | `/journey/schema` | `mf-back/routes/journey-routes.js` |
| `PUT` | `/journey/update-journey/:id` | `mf-back/routes/journey-routes.js` |
| `GET` | `/journey/user-journeys` | `mf-back/routes/journey-routes.js` |
| `GET` | `/journey/user-progress` | `mf-back/routes/journey-routes.js` |
| `PUT` | `/journey/user-progress` | `mf-back/routes/journey-routes.js` |
| `GET` | `/orchestration/admin/agent-logs` | `mf-back/routes/zyno-routes.js` |
| `GET` | `/orchestration/admin/agent-scoreboard` | `mf-back/routes/zyno-routes.js` |
| `POST` | `/orchestration/orchestration` | `mf-back/routes/zyno-routes.js` |
| `GET` | `/orchestration/orchestration/current-step` | `mf-back/routes/zyno-routes.js` |
| `GET` | `/orchestration/orchestration/logs` | `mf-back/routes/zyno-routes.js` |
| `GET` | `/readyz` | `mf-back/app.js` |
| `GET` | `/user/all` | `mf-back/routes/user-routes.js` |
| `DELETE` | `/user/delete-profile` | `mf-back/routes/user-routes.js` |
| `POST` | `/user/login` | `mf-back/routes/user-routes.js` |
| `POST` | `/user/login-wallet` | `mf-back/routes/user-routes.js` |
| `POST` | `/user/logout` | `mf-back/routes/user-routes.js` |
| `POST` | `/user/nft-certificates` | `mf-back/routes/user-routes.js` |
| `GET` | `/user/profile` | `mf-back/routes/user-routes.js` |
| `POST` | `/user/refresh` | `mf-back/routes/user-routes.js` |
| `POST` | `/user/register` | `mf-back/routes/user-routes.js` |
| `PUT` | `/user/role/:id` | `mf-back/routes/user-routes.js` |
| `PUT` | `/user/subscription/:id` | `mf-back/routes/user-routes.js` |
| `PUT` | `/user/tokens` | `mf-back/routes/user-routes.js` |
| `PUT` | `/user/update-profile` | `mf-back/routes/user-routes.js` |
| `POST` | `/user/wallet-challenge` | `mf-back/routes/user-routes.js` |

### Notes (cohérence)

- Cet index reflète **le câblage actuel** (mounts dans `mf-back/app.js`).
- Si une route semble “doublée” (ex: `/orchestration/orchestration`), cela indique un **mismatch** entre le `mount` et le `router.*("/...")` dans le fichier de routes.

<!-- END AUTO-GENERATED: api-surface -->

## 🧩 Component Architecture

Description structurée des composants React majeurs : rôle, responsabilités, et points de connexion (stores, context, API).

### Core Components

Les composants ci-dessous constituent le “squelette” de l’app : routeur, page principale, affichage progression, et connexion wallet.

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
- **Backend container** exposes `/user/*`, `/journey/*`, `/orchestration`, `/healthz`, `/readyz`, etc.
- **MongoDB** stores journeys, agent logs, and memory.

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
- Backend essentials usually include: `JWT_SECRET`, `MONGO_URI`, `ADMIN_API_KEY`, `OPENAI_API_KEY` (or other LLM key), `RAG_SEARCH_URL`, `RAG_INGEST_URL`, `RAG_API_KEY`, `RAG_COLLECTION`.
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

*Last updated: January 2024*
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

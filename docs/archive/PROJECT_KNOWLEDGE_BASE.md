<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Project Knowledge Base — Manuel de Référence Design System & IA

**Guide de contexte unifié** pour les agents IA (v0.dev, Lovable, etc.) et les développeurs afin de générer ou modifier le front sans hallucination et cohérent avec le monorepo.

Ce document sert de **source de vérité** pour :

- Le Design System (couleurs, typographie, composants, Trinity Layout)
- L'orchestration agentique (37 agents Zyno, Intent Router, Execution Gate)
- Les workflows métier (AEPO/AECO, SkillChain Mining, Auth SIWS, Pipeline Minting)
- Les protocoles et conventions (AEPO/AECO, protocoles agents)

## Monorepo — Panorama rapide

- `journey-simulator/` (React + Vite + TS) : app principale, routing React Router, animations Framer Motion, icônes Lucide, wallet Solana, stores Zustand.
- `web/` : portail compagnon (Next/React) orienté contenus/landing, moins central pour l’UI dynamique.
- `mf-back/` (Express + Mongo) : API auth, parcours, moteur de phases, RAG/agents; CORS env-driven; Helmet avec CSP report-only.
- Pipelines : Docker Compose (dev/prod), ci.yml GitHub Actions, scripts `start_dev.sh`, `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod) avec `API_UPSTREAM` pour le front Nginx.

## Design System — Tokens & Styles

### Palette de Couleurs

**Couleurs principales (hex)** :

- **Deep Space** : `#050510` (fond principal dark)
- **Solana Purple** : `#9945FF` (accent principal)
- **Solana Green** : `#14F195` (succès, actions positives)
- **Electric Cyan** : `#00E5FF` (highlights, accents secondaires)

**Tokens CSS (variables)** :

- `--color-page` : `#000000` (True Black pour OLED/Contrast)
- `--color-surface` : `#120E24` (Deep Purple/Blue Black)
- `--color-accent` : `#9945FF` (Solana Purple)
- `--color-success` : `#14F195` (Solana Green)
- `--color-warning` : `#FFD512`
- `--color-danger` : `#FF4F4F`
- `--color-info` : `#00C2FF`

**Gradients** :

- `bg-gradient-solana` : `linear-gradient(90deg, #9945FF, #14F195)`
- `bg-gradient-primary` : `linear-gradient(135deg, #A563F5 0%, #7C3AED 100%)`
- `bg-gradient-galaxy` : radial gradients avec purple/blue

### Typographie

- **Headings** : `Space Grotesk` (modern, tech-focused)
- **Body** : `Inter` (readable, professional)
- **Code** : Monospace (pour addresses, hashes)

### Motifs Visuels

- **Glassmorphism** : flou + opacité (`backdrop-blur-sm`, `bg-black/20`)
- **Bordures néon** : 1px avec glow (`border-white/10`, `shadow-glow`)
- **Glow sur états actifs** : `shadow-glow`, `shadow-neon-ring`
- **Gradients pour fonds** :
  - Dark : `primary-900 → primary-800`
  - Light : `slate/blue/purple`

### Composants

- **Boutons** : coins doux (`rounded-xl`), focus visible, hover glow
- **Cards** : translucides avec blur (`bg-black/20 backdrop-blur-sm`)
- **Tags** : pill shape (`rounded-full`)
- **Toasts** : `react-hot-toast` / `sonner` (non bloquants)

## Navigation — “The Trinity Layout”

- Navigator (Left) : sidebar fine → progression de phase, accès rapide aux parcours, états verrouillés/débloqués.
- The Stage (Center) : surface dynamique pour artefacts, simulations, quiz, ressources; héberge `JourneyWorkspace`, `UIBlocksRenderer`.
- Zyno Pulse (Right) : console agentique persistante (logs des agents, actions suggérées, suivi AEPO/AECO).
- Mode démo : chemins `/journeys/demo` sans auth forte; mode réel : `/journeys` protégé + wallet Solana (Layout `enableWallet=true`).

## Routage Front (journey-simulator)

- Public : `/`, `/login`, `/register`, `/journeys/demo`, `/journeys/demo/:journeyId`.
- Protégé (AuthProvider + Layout) : `/dashboard`, `/playground`, `/resources`, `/support`, `/zyno`, `/guide`.
- Protégé + wallet : `/journeys`, `/journeys/:journeyId`, `/journeys/completed`, `/dao`, `/debug/mint`.
- Layouts : `Layout` enveloppe; `ProtectedRoute` contrôle auth; `WalletContextProvider` pour les écrans nécessitant la wallet.

## État & Données (Zustand, Context)

- Stores clés : `journeyStore` (progression, engine S2.5 start/submit/refresh, demo mode), `themeStore` (dark/light), `auth` (token, demo token).
- Contexts : `AuthProvider` (check token, mock demo), `TutorialProvider` (guidage), `WalletContext`.
- API client : `JourneyEngineApi` et appels REST vers `mf-back` (`/journey-engine` + `/journey/user-progress`), toasts pour feedback.
- Gardiens UI : `UIBlocksRenderer` vérifie les arrays avant `.map`, sanitise SVG (DOMPurify), fallback pour quiz/resources/projects.

## Back-End — Endpoints clés (progression & auth)

- Auth (`/auth`) : `POST /register`, `POST /login`, `POST /verify`, `POST /refresh` (validations Zod, payload strict, réponses JSON).
- Parcours legacy (`/journey`) : `GET /user-progress`, `PUT /user-progress`, `POST /complete-phase`, `POST /reset-progress`, `GET /schema`, `GET /artifacts`, `POST /load-demo` (demo state), `POST /:journeyId/submit` (protégé).
- Moteur S2.5 (`/journey-engine`) : `POST /start` (journeyDefinitionId), `POST /submit` (runId, phaseId, stepId, payload objet), `POST /advance` (dev), `GET /:id/state`.
- Rôles : `protect` middleware JWT; CORS list env; CSP report-only.

## Workflows métier (AEPO / AECO) — pour l’IA

- Cognitive Activation Protocol™ : Learn → Build → Govern → Launch (phases UI à représenter, badges, gating).
- SkillChain Mining : actions validées ⇒ XP ⇒ conversion $MFAI ⇒ Proof-of-Skill NFT (afficher solde/XP, progression, certificats).
- Bonding Curve (Collaterize) : affichage du prix courant, supply, impact d’un achat; étapes guidées (input → estimation → confirmation).
- Zyno Agents (37 implémentés, RiskFraud désactivé par défaut) : spécialités réparties (research, drafting, risk, compliance, tokenomics, UX, growth, legal, ops, comms…). Dans l’UI, surface via “Zyno Pulse” (panneau droit) : messages, recommandations, état courant; chaque agent référencé par un id stable pour instrumentation.

## Flux de données & intégration

- Front → Back : appels fetch/API vers `mf-back` (base URL env `VITE_API_BASE_URL` ou `API_UPSTREAM` via Nginx). Demo mode substitue des réponses mockées (AuthContext, api client).
- Back → Mongo : modèles Journey/User/Run; endpoints engine stockent l’état (runId/phase submissions); proofs/services Solana (Anchor/Mint/Proof) présents dans `mf-back/services/*`.
- Companion `web/` : peut consommer les mêmes endpoints (auth/profile) pour vue portail; pas de couplage fort, mais aligner CORS.
- Déploiement : docker-compose (front + nginx templating + API + redis en prod), variables `.env` obligatoires (`API_UPSTREAM`, `VITE_API_BASE_URL`, `JWT_SECRET`, etc.).

## Charte d’interaction (pour générer le front)

- Animations : Framer Motion (fade/slide), Lottie pour succès, confetti contextuel (achèvements).
- Icônes : Lucide React; mermaid pour diagrammes optionnels.
- Notifications : toasts (succès/erreur), idéalement non bloquants.
- Accessibilité : focus visible, aria-labels sur boutons/icônes critiques (wallet, submit).
- États : skeletons/“Loading experience…” pour suspense; empty states explicites.

## Composants majeurs à connaître

- `JourneyWorkspace` : scène centrale pour phases; consomme store et API engine.
- `ZynoBox` / `Zyno` page : surface d’interaction agents.
- `HeroSection` / `Dashboard` : stats et CTA entrée parcours.
- `UIBlocksRenderer` : rend blocks (quiz, resources, diagram, project selection) avec garde-fous.
- `WalletConnectionBanner` / `SkillchainBanner` : rappels wallet/XP/skillchain.

## Patterns de sécurité déjà en place (rappel)

- Helmet avec CSP en report-only (pas de blocage).
- CORS restreint par env (allowlist).
- Logger structuré pino (createLogger), intégré dans `app.js` et `middleware/auth`.
- Validations Zod ciblées (auth, journey-engine); sanitisation légère des payloads.

## Orchestration agentique (R2.x)

- Intent router + registry enrichi : sélection déterministe d’agents (sécurité/produit), scoring pondéré par `confidenceWeight` + `learningScore`.
- Arbitrage Zyno : détection de contradictions, décision structurée (`overallStatus`, `topFindings`, `recommendedActions`, `actionPlan` dédupliqué).
- Mémoire & apprentissage : mémoire TTL/FIFO (in-memory), ajustement de confiance via historique (OK/FAIL/TIMEOUT/contradictions).
- Tooling & executionPlan : mapping actions → tools (`enable_checklist` seul tool autorisé en exécution réelle, autres en dry-run/skipped).
- Execution Gate (HITL) : gate PENDING/APPROVED/REJECTED/EXPIRED requis avant toute exécution réelle.
- Execution Engine :
  - Mode par défaut : `DRY_RUN` (SIMULATED), aucun side-effect.
  - Mode réel (opt-in) : uniquement si `EXECUTION_ENABLED=true` **et** gate `APPROVED`, un seul tool exécuté, les autres `SKIPPED_REAL_EXECUTION`; fallback automatique en dry-run si blocage.
- Observabilité : logs structurés avec `traceId`, statut des steps (SIMULATED/EXECUTED/SKIPPED), réponse toujours structurée (pas de throw).
- Variables env : `EXECUTION_ENABLED` (par défaut false) pour autoriser le mode réel ; ne l’activer qu’avec un gate approuvé.

## Intentions UI/UX pour IA

- Respecter la Trinity Layout et la charte tokens.
- Toujours séparer : Demo vs Real (auth + wallet).
- Surfaces agents (Zyno Pulse) persistantes, non modales, avec log temporel.
- Afficher la progression AEPO/AECO (bars, badges) et l’impact tokenomics (XP → MFAI → NFT).
- Prévoir hooks d’instrumentation (events) par agent id, phase id, step id.

### Matrice de personnalité des 37 agents Zyno

- Agents côté backend (`mf-back/orchestration/agentsRegistry.js`) : Guide, Coach, Education, Reflection, Builder, Protocol, Dev, Design, NFT, DAO, GovernanceDAO, Tokenomics, ProductSpec, JourneyDesign, Evaluation, Investor, InvestorDemo, Growth, Analytics, Marketplace, Performance, DevOps, Observability, QAPlaywright, Security, SecurityAudit, Compliance, Web3Legal, Audit, SolanaAnchor, Minting, WalletAuth, RAGOps, DataIntegrity, APIContract, Curriculum, UXWriting (RiskFraud désactivé). Total : **37** (36 actifs + 1 désactivé).

#### Table mapping agents ↔ icônes (Lucide) — accents visuels (hex)

| Agent backend | Icône | Accent / Ton (hex) |
| --- | --- | --- |
| GuideAgent | `Compass` | Bleu clair `#5dafff`, ton pédagogue |
| CoachAgent | `Star` | Or doux `#d4c27a`, ton motivant |
| PitchAgent | `Presentation` / `MessageSquare` | Indigo clair `#6f7cff`, ton persuasif |
| Web3LegalAgent | `Scale` | Prune `#7b4b7f`, ton formel |
| NFTAgent | `Diamond` | Cyan `#00e5ff`, ton créatif |
| TokenAgent | `Coins` | Cyan/vert `#14f195`, ton technique |
| TokenomicsAgent | `PieChart` | Cyan analytique `#00d0ff`, ton quant |
| LaunchpadAgent | `Rocket` | Purple→cyan `#9945ff` → `#00e5ff`, ton go-to-market |
| BuilderAgent | `Hammer` | Gris acier `#6b7280`, ton maker |
| DAOAgent | `Users` | Vert/bleu `#14f195` / `#00c2ff`, ton communautaire |
| AuditAgent | `ShieldCheck` | Bleu acier `#4a6fa5`, ton analytique |
| ProductAgent | `Compass` | Bleu clair `#5dafff`, ton outcome-driven |
| DevAgent | `Cpu` / `Terminal` | Vert menthe `#3dd598`, ton pragmatique |
| InvestorAgent | `PiggyBank` | Bleu cobalt `#1e4fa3`, ton factuel |
| OnboardingAgent | `LogIn` | Vert doux `#5ad1a4`, ton accueillant |
| GrowthAgent | `TrendingUp` | Vert émeraude `#2ecc71`, ton expérimental |
| CommunityAgent | `MessageCircle` | Coral `#ff7f6a`, ton chaleureux |
| ReflectionAgent | `BookOpen` | Indigo doux `#5c6bc0`, ton introspectif |
| EducationAgent | `GraduationCap` | Bleu nuit `#1f2a44`, ton didactique |
| DesignAgent | `Sparkles` | Fuchsia `#f472b6`, ton empathique |
| GovernanceAgent | `Gavel` / `Scale` | Indigo/prune `#6b4e90`, ton institutionnel |
| ProtocolAgent | `Layers` | Violet profond `#5a2ca0`, ton normatif |
| SecurityAgent | `Shield` | Rouge brique désaturé `#a14b4b`, ton préventif |

## Pipelines & commandes utiles

- Dev front : `npm run dev` (journey-simulator).
- Tests : `npm run test` (vitest), `npm run test:e2e` (playwright).
- Génération docs auto : `npm run generate:readme` (phases-table, file-index, api-surface).
- Build/serve : `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod) avec `API_UPSTREAM` pour le proxy Nginx.

## Protocoles Agents (AEPO/AECO)

### Protocole AEPO (Agent Execution Protocol)

**Flux** :

1. Intent détecté (via Intent Router)
2. Agents sélectionnés (scoring `confidenceWeight` + `learningScore`)
3. Exécution parallèle (si applicable)
4. Arbitrage Zyno (détection contradictions)
5. Décision structurée (`overallStatus`, `topFindings`, `recommendedActions`)
6. Execution Plan généré (mapping actions → tools)
7. Gate HITL (si REAL execution requise)
8. Exécution (DRY_RUN par défaut, REAL si gate APPROVED)

### Protocole AECO (Agent Execution Control)

**Contrôles** :

- `EXECUTION_ENABLED` : flag global (par défaut `false`)
- `executionGate` : PENDING/APPROVED/REJECTED/EXPIRED
- `productionGuards` : validation pré-exécution
- `killSwitch` : désactivation instantanée (scope ALL/REAL_ONLY)
- `secretsPolicy` : validation secrets requis
- `web3Guards` : validation Web3 (proof/anchor/mint)

**Fallbacks** :

- DRY_RUN si REAL bloqué
- LLM mock si OpenAI indisponible
- RAG local si remote indisponible
- Circuit breaker si erreurs répétées

## Notes pour Agents IA & Développeurs

- **Endpoints** : Préférer les endpoints existants (ne pas inventer de routes)
- **Rendu** : Conserver les garde-fous (Array.isArray avant map, sanitisation SVG avec DOMPurify)
- **Sécurité** : Toute nouvelle surface UI doit rester compatible CSP report-only et CORS existants
- **Design** : Respecter la Trinity Layout et la charte tokens (couleurs, typo, glassmorphism)
- **Modes** : Toujours séparer Demo vs Real (auth + wallet)
- **Agents** : Surfaces agents (Zyno Pulse) persistantes, non modales, avec log temporel
- **Progression** : Afficher la progression AEPO/AECO (bars, badges) et l'impact tokenomics (XP → MFAI → NFT)
- **Instrumentation** : Prévoir hooks d'instrumentation (events) par `agentId`, `phaseId`, `stepId`

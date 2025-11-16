# Money Factory AI Journey Simulator - System Blueprint

Last updated: 13 November 2025

## 1. Vision and Product Narrative

Money Factory AI (MFAI) is a Web3 journey simulator that brings the **Cognitive Activation Protocol™** to life. The goal is to transform human expertise into on-chain value through gamified missions, Proof-of-Skill™ NFTs, and the $MFAI token economy.

The platform combines:

- **A React/TypeScript frontend** (`journey-simulator/`) that delivers the interactive experience.
- **A Node.js/Express + MongoDB API** (`mf-back/`) that manages authentication, progress, analytics, and security.
- **An upcoming Solana layer** (currently simulated in `src/utils/blockchain.ts`) to power minting, staking, and DAO governance.

Six strategic personas define specialised learning paths: Cognitive Activation Hub, Capital Foundry, System Architect, Experience Studio, Impact Engine, and Resilience Master. Each path contains five modular phases aligned with Learn -> Build -> Prove -> Activate -> Scale.

---

## 2. Functional Overview

| Domain | Description | Primary actors | Deliverables |
|--------|-------------|----------------|--------------|
| **Onboarding** | Account creation, wallet connection, persona selection | End user, auth backend | Session tokens, active persona |
| **Progression** | Phase-by-phase advancement with XP, NFTs, and $MFAI rewards | End user, journey store, API | Accumulated XP, NFTs, tokens |
| **Certification** | Proof-of-*™ NFT issuance | End user, `NFTProofModal` | Virtual NFT, mint tutorial |
| **Tokenomics** | Airdrop simulations, staking, DAO voting | End user, `StakingModal`, `DAOVoteModal` | Staked tokens, recorded votes |
| **Analytics** | Interaction tracking, downloads, sharing events | Analytics controller | Dashboards, logs |
| **AI Support** | Contextual guidance via ZynoBox | End user, ZynoBox | Prompts, tailored tutorials |

---

## 3. Technical Architecture

### 3.1 Logical diagram

```text
Browser
|
|-- Frontend React (journey-simulator/)
|   |-- UI and routing (React Router, App.tsx)
|   |-- Client state (Zustand stores)
|   |-- Static data (src/data/*.ts)
|   |-- Blockchain simulation (utils/blockchain.ts)
|   `-- Wallet integration (contexts/WalletContext.tsx)
|
|-- REST API (mf-back/)
|   |-- JWT authentication (middleware/auth.js, controllers/user-controller.js)
|   |-- MongoDB models (models/*.js)
|   |-- REST routes (routes/*.js)
|   `-- Logging, CORS, analytics
|
`-- MongoDB Atlas or local cluster
   `-- Collections: users, journeys, courses, analytics
```

### 3.2 Technology stack

| Layer | Tooling |
|-------|---------|
| **Frontend** | React 18, TypeScript 5, Vite 4, Zustand, Tailwind CSS, Framer Motion, Lucide Icons |
| **Blockchain (simulated)** | @solana/web3.js, wallet-adapter, SPL Token |
| **Backend** | Node 18, Express 4, Mongoose 8, JWT, bcrypt, nodemon |
| **Database** | MongoDB (`user`, `Journeys`, `cours`, `userCoursProgress`) |
| **Tooling** | ESLint, PostCSS, dotenv, Morgan |

---

## 4. Directory Structure

### 4.1 Frontend (`journey-simulator/`)

```text
journey-simulator/
├── public/
│   └── images/...
├── src/
│   ├── components/
│   │   ├── Journey/
│   │   │   ├── JourneyCard.tsx
│   │   │   ├── JourneyDashboard.tsx
│   │   │   ├── JourneyTimeline.tsx
│   │   │   ├── PhaseSection.tsx
│   │   │   ├── XPTracker.tsx
│   │   │   └── ZynoBox.tsx
│   │   ├── modals (CertificationModal, NFTMintingModal, StakingModal, DAOVoteModal, etc.)
│   │   ├── navigation (Header, WalletButton, WalletStatusDisplay)
│   │   ├── pages (JourneysPage, HeroSection, Login/Register, etc.)
│   │   └── layout (Footer, SkillchainBanner, AccessPassHolders)
│   ├── contexts/ (AuthContext.tsx, WalletContext.tsx)
│   ├── data/ (personas.ts, proofsData.ts, holders.ts)
│   ├── store/ (journeyStore.ts, themeStore.ts)
│   ├── types/ (journey.ts)
│   ├── utils/ (api.ts, blockchain.ts, particles.ts)
│   ├── App.tsx / main.tsx / index.css
│   └── components/wallet/ (wallet connector helpers)
├── docs/ (product documentation)
└── config (tailwind.config.js, vite.config.ts, tsconfig*.json)
```

### 4.2 Backend (`mf-back/`)

```text
mf-back/
├── app.js (Express configuration + CORS)
├── bin/www (HTTP bootstrapper)
├── controllers/
│   ├── user-controller.js
│   ├── journey-controller.js
│   ├── cours-controller.js
│   └── analytics-controller.js
├── middleware/ (auth.js, featureFlags.js)
├── models/ (user.js, Journeys.js, cours.js, userCoursProgress.js)
├── routes/
│   ├── user-routes.js
│   ├── journey-routes.js
│   ├── cours-routes.js
│   └── analytics-routes.js
├── docs/ (backend-architecture.md)
├── public/ (static assets)
├── views/ (Jade templates for error pages)
├── .env / .env.example
└── package.json / package-lock.json
```

---

## 5. Frontend Domain and Components

### 5.1 Entry point (`src/App.tsx`)

- Mounts `AuthProvider` and `WalletContextProvider`.
- Applies the `dark` or `light` theme through `themeStore`.
- Starts the particle background effect via `utils/particles.ts`.
- Routes public and private pages through `ProtectedRoute`.
- Builds the main layout: header, wallet banners, journeys page, and modal stack.

### 5.2 Data sources (`src/data/`)

- `personas.ts` defines the six journeys with phases, rewards, and gating flags.
- `proofsData.ts` maps persona and phase identifiers to Proof-of-* types for NFT metadata.
- `holders.ts` lists access pass metrics and community testimonials.

### 5.3 State management (`src/store/journeyStore.ts`)

- Stores `selectedPersona`, `userProgress`, `completedPhases`, and `testnetFeatures`.
- Key actions include:
  - `setSelectedPersona` to reset phases when the player switches journeys.
  - `completePhase` to persist completion locally and through `api.completePhase`.
  - `updateProgress` to aggregate XP, $MFAI, NFTs, and pass level before syncing via `api.updateProgress` and `api.updateTokenBalance`.
  - `mintNFT`, `claimTestnetAirdrop`, `updateStaking`, and `updateVotingPower` to simulate blockchain operations.
  - `resetProgress` to clear local storage and call `/journey/reset-progress` when a token is present.
  - `loadUserProgress` to hydrate the store from `/journey/user-progress` on login.
- Persistence is handled by the `persist` middleware using the `mfai-journey-storage` key.

### 5.4 Authentication (`src/contexts/AuthContext.tsx`)

- Wraps login, register, refresh, and logout flows through `utils/api.ts`.
- `checkAuthStatus` verifies the access token and attempts a refresh when needed.
- Coordinates progress resets and reloads by calling `journeyStore.resetProgress` and `loadUserProgress` at the right time.

### 5.5 API client (`src/utils/api.ts`)

- Uses `API_BASE_URL = http://localhost:3000` (overridable).
- Centralises network calls with `request`, handling 401 responses via refresh tokens.
- Provides helpers for `/user/*`, `/journey/*`, `/user/tokens`, and `/analytics/*` endpoints.
- Adds `Authorization` headers through `getAuthHeaders()`.

### 5.6 Key components

- `JourneysPage.tsx` drives persona selection, the phase timeline, and modal orchestration.
- `PhaseSection.tsx` renders each phase card with lock state, rewards, and staking or DAO badges.
- `StakingModal.tsx` and `DAOVoteModal.tsx` simulate token staking and governance voting using store actions.
- `NFTProofModal.tsx` displays rewards, metadata, and mint guidance for Proof-of-* NFTs.
- `WalletContext.tsx` wires Solana wallet adapters such as Phantom and Solflare.

### 5.7 User experience flow

1. **Landing**: hero, Skillchain banner, and persona discovery.
2. **Persona selection**: `JourneyCard` highlights the pathway and exposes the Enter Path CTA.
3. **Dashboard**: `JourneyDashboard`, `XPTracker`, `ProofCertificationsBoard`, and `WalletStatusDisplay` summarise progress.
4. **Phase progression**: users complete missions and interact with modals for staking, DAO, and NFTs.
5. **Completion**: success messaging, statistics, and sharing prompts.

---

## 6. Backend Services and Logic

### 6.1 Express app (`mf-back/app.js`)

- Loads `dotenv` and connects to MongoDB with `mongoose.connect(MONGO_URI, { useNewUrlParser, useUnifiedTopology })`.
- Configures CORS for Vue/Vite origins (`5173`, `5174`, `4173`, `127.0.0.1:4173`) and handles `OPTIONS` preflight.
- Enables common middleware: `logger`, `express.json`, `express.urlencoded`, `cookieParser`, and `express.static`.
- Mounts route groups for `/user`, `/cours`, `/journey`, and `/analytics`.
- Provides 404 and generic error handlers.

### 6.2 Routes & controllers

| Route | Controller | Responsibility |
|-------|-----------|----------------|
| `/user` | `user-controller.js` | Registration, login, logout, token refresh, profile, certifications, token ledger |
| `/journey` | `journey-controller.js` | Journey CRUD, progress tracking, resets, phase completion |
| `/cours` | `cours-controller.js` | Course catalogue and per-course progress |
| `/analytics` | `analytics-controller.js` | Download, sharing, and holder interaction tracking |

#### Key examples

- `journey-controller.getUserProgress` returns `total_xp`, `current_level`, `completed_phases`, `nft_certificates`, `token_transactions`, `subscription`, and `persona` based on `req.user.id` (via `auth` middleware).
- `journey-controller.completePhase` increments `completed_phases` and appends an NFT certificate.
- `user-controller` manages user creation, bcrypt hashing, and JWT issuance/refresh (including refresh-token storage).

### 6.3 Middleware (`middleware/auth.js`)

- Validates JWT tokens extracted from the `Authorization` header.
- Populates `req.user` with `id` and `role` for downstream handlers.
- `featureFlags.js` toggles experimental capabilities server-side.

### 6.4 Mongoose models

#### `models/user.js`

- Fields: `name`, `email`, `password`, `wallet_address`, `persona`, `role`.
- Progress tracking: `total_xp`, `current_level`, `completed_phases`, `nft_certificates[]`, `token_transactions`.
- `persona` accepts both new identifiers and legacy aliases for backward compatibility.
- Subscription tier: free, gold, platinum, or diamond.
- Pre-save hook hashes passwords with bcrypt and exposes `comparePassword`.

#### `models/Journeys.js`

- Stores per-user journey state: phase status, completion percentage, and linked wallet.

#### `models/cours.js` & `models/userCoursProgress.js`

- Model the course catalogue and per-user course progress, aligning with Learn/Build phases.

### 6.5 Backend workflows

1. **Registration**: POST `/user/register` hashes the password, stores the persona, and returns `accessToken` plus `refreshToken`. The frontend persists tokens in local storage.

2. **Login**: POST `/user/login` validates credentials and returns tokens alongside the active persona.

3. **Progress load**: GET `/journey/user-progress` (protected) hydrates the Zustand store with XP, NFTs, tokens, and completed phases.

4. **Phase completion**: The client calls `completePhase` (Zustand) then POST `/journey/complete-phase` with `phase_number`, `score`, and `nft_address`. The backend appends to `completed_phases` and `nft_certificates`, and the frontend follows with PUT `/journey/user-progress` plus PUT `/user/tokens` to synchronise XP and token balances.

5. **Progress reset**: POST `/journey/reset-progress` wipes XP, tokens, and completed phases server-side, and Zustand clears the local cache afterwards.

6. **Analytics**: `/analytics/certification-download`, `/analytics/certification-share`, `/analytics/holder-interaction`, and `/analytics/platform-stats` populate reporting dashboards.

---

## 7. User Workflows

### 7.1 Onboarding and persona choice

1. Visitor lands on `/`; unauthenticated users are redirected to `/login`.
2. Login or registration runs through `AuthContext`, storing access and refresh tokens.
3. `loadUserProgress()` restores the current persona and completed phases.
4. Selecting a persona in `JourneyCard` triggers `setSelectedPersona`, resetting phase state to zero.

### 7.2 Advancing a phase

1. `PhaseSection` shows mission details and rewards.
2. The `Start Phase` button triggers `handlePhaseComplete` in `JourneysPage`.
3. The following actions run in sequence: `completePhase` (Zustand) posts to `/journey/complete-phase`; `updateProgress` updates XP, tokens, and NFTs via `/journey/user-progress` and `/user/tokens`; `setCurrentPhaseIndex` prepares the right modal; `NFTProofModal` appears when `nftReward` is present; `StakingModal` opens when `stakingRequired` thresholds are met; `DAOVoteModal` opens when `daoVoteRequired` is true.
4. Success feedback surfaces in the top-of-page toast banner.

### 7.3 Staking $MFAI

1. Triggered when `phase.stakingRequired` is defined (for example, Capital Foundry `risk-command`).
2. After `updateProgress`, the store checks `projectedTokens >= stakingRequired`.
3. `setShowStakingModal(true)` opens the staking workflow.
4. `handleStakingComplete` calls `updateStaking(amount)`; a smart-contract integration will replace this simulation later.

### 7.4 DAO voting

1. Fires when `phase.daoVoteRequired` is true (for example, Capital Foundry `capital-launchpad`).
2. `setShowDAOVoteModal(true)` opens the approve/reject workflow.
3. `handleDAOVoteComplete` increments `votingPower` and records the outcome with `updateProgress(30, [\`DAO Vote: ${vote}\`].

### 7.5 NFT mint walkthrough

1. `NFTProofModal` presents the `Mint on Solana` action (currently simulated through `journeyStore.mintNFT`).
2. `NFTMintingTutorial` guides the user through wallet connection, devnet airdrop, and minting steps.
3. Future work: integrate Metaplex to replace the simulation.

### 7.6 Wallet management

- `WalletButton` hooks into `WalletContext` and Solana wallet adapters.
- `WalletStatusDisplay` surfaces address, SOL balance, and token counts.
- `WalletFaucetButton` requests Devnet SOL for testing.

### 7.7 Progress reset

- `ResetProgressButton` triggers `journeyStore.resetProgress`, which calls `POST /journey/reset-progress` when authenticated.
- Local storage key `mfai-journey-storage` is cleared afterwards.

---

## 8. Delivery Pipelines and CI

### 8.1 Frontend

1. `npm run lint` validates TypeScript via ESLint (current rules accept TS 5.8 with warnings).
2. `npm run build` executes `tsc` and Vite, producing split bundles (`vendor`, `polyfills`, `icons`, `media-tools`, `ui-motion`, `torus`).
3. `npm run dev -- --host` starts the Vite dev server on port 5173 or the next available port.
4. `dist/` holds production assets; large chunks (>500 kB) should be reduced with dynamic imports.

### 8.2 Backend

1. `npm install` restores Express/Mongoose dependencies (14 non-critical vulnerabilities awaiting audit).
2. `npm run dev` fires up nodemon against `./bin/www`.
3. Console notes highlight deprecated `useNewUrlParser` and `useUnifiedTopology` options slated for removal in the next Mongoose refactor.

### 8.3 Environments

| Environment | Key variables |
|-------------|----------------|
| Local dev | `VITE_SOLANA_NETWORK=devnet`, API `http://localhost:3000` |
| Future production | Hosted API (HTTPS), Solana mainnet, Metaplex |

---

## 9. Data Models and Schemas

### 9.1 Frontend (`src/types/journey.ts`)

```ts
export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  targetProfile: string;
  motivation: string;
  passType: string;
  phases: JourneyPhase[];
}

export interface JourneyPhase {
  id: string;
  title: string;
  description: string;
  mission: string;
  duration: string;
  xpReward: number;
  mfaiReward?: number;
  nftReward?: string;
  tools: string[];
  outcomes: string[];
  zynoTip: string;
  modules?: PhaseModule[];
  stakingRequired?: number;
  daoVoteRequired?: boolean;
  isIncubation?: boolean;
  isLaunchpad?: boolean;
}

export interface UserProgress {
  totalXP: number;
  nfts: string[];
  passLevel: 'Free' | 'Gold' | 'Platinum' | 'Diamond';
  mfaiTokens: number;
  stakedMfai: number;
  walletConnected: boolean;
  walletAddress?: string;
  completedPhases: number[];
  currentPersona?: string;
  votingPower: number;
  daoProposals: number;
  testnetAirdropClaimed?: boolean;
  socialShareCount?: number;
}
```

### 9.2 Backend (`models/user.js`, `models/Journeys.js`)

- `user` is the source of truth for progress, tokens, and NFT certificates (see section 6.4).
- `Journeys` stores journey metadata per player, including `phases_status` for analytics.
- `userCoursProgress` tracks granular course advancement tied to Learn/Build phases.

---

## 10. Experience Modules

### 10.1 Home and onboarding

- **HeroSection** launches the demo and highlights the Cognitive Activation Protocol™.
- **SkillchainBanner** delivers the Proof Economy and Synaptic DAO value proposition.
- **AccessPassHolders** showcases success stories across Gold, Platinum, and Diamond tiers.

### 10.2 Journey explorer

- **JourneyCard** presents each persona with gradients, stats, and opens `JourneyModal` for details.
- **JourneyTimeline** shows the five-phase progression in an interactive timeline.
- **JourneyDashboard** summarises XP, NFTs, tokens, and pass level.

### 10.3 Support modules

- **ZynoAssistant / ZynoBox** deliver contextual coaching and mission tips.
- **WalletConnectionGuide** walks users through wallet connection, airdrop, and staking simulation.
- **BackToTopButton** improves navigation on long single-page flows.

---

## 11. Governance, Resilience, and Security

### 11.1 Governance

- `Proof-of-Skill™` NFTs are prerequisites for voting.
- `daoVoteRequired` appears in specific phases (for example, Capital Foundry launch and scale deck).
- Future work: Synaptic Governance smart contracts to back DAO operations.

### 11.2 Security

- **Frontend**: protected routes enforce auth through `useAuth.checkAuth()`.
- **Backend**:
  - JWT access and refresh tokens.
  - Password hashing with bcrypt.
  - CORS limited to local development origins (5173, 5174, 4173).
  - `auth.js` middleware locks down sensitive endpoints.
- **Blockchain**: `utils/blockchain.ts` simulates staking and minting until Solana contracts ship.

---

## 12. Technical Roadmap

| Quarter | Objectives |
|---------|------------|
| **Q1 2026** | Ship Solana smart contracts for NFT minting, staking $MFAI, and DAO voting. Resolve Mongoose warnings and perform npm audits. |
| **Q2 2026** | Connect backend events to blockchain webhooks and transaction signatures. Optimise bundles via code splitting. |
| **Q3 2026** | Integrate real-time AI guidance (Zyno API), live analytics, and PWA support. |
| **Q4 2026** | Launch staging/production environments, establish CI/CD, and add observability (logs and metrics). |

---

## 13. Annexes

### 13.1 Existing documentation

- `docs/cahier_charges.md` collects high-level requirements.
- `docs/project_documentation.md` covers the narrative documentation.
- `docs/protocol_paper_en.md` is the Cognitive Activation Protocol™ whitepaper.
- `docs/blockchain_integration_plan.md` outlines the Web3 roadmap.

### 13.2 Useful commands

```bash
# Frontend
npm --prefix journey-simulator run dev -- --host
npm --prefix journey-simulator run lint
npm --prefix journey-simulator run build

# Backend
npm --prefix mf-back install
npm --prefix mf-back run dev

# CORS preflight check (example)
curl -i -X OPTIONS http://localhost:3000/user/register \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST"
```

### 13.3 Watchouts

- TypeScript 5.8 is not fully supported by `@typescript-eslint`, resulting in benign lint warnings.
- `vite build` reports bundles larger than 500 kB; follow up with dynamic imports.
- Mongoose emits deprecation warnings until connection options are refreshed.
- `npm audit` lists 14 vulnerabilities (6 low, 5 high, 3 critical) pending remediation.

---

## Project reference

- Frontend: `journey-simulator` (active branch `signup`).
- Backend: `mf-back`.

This blueprint onboards contributors, architects, and product leads by outlining the flows, structure, and future evolution of the Money Factory AI journey simulator.

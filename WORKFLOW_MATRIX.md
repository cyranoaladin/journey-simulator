# WORKFLOW_MATRIX — Journey Simulator / mf-back / web

Ce document relie chaque **workflow utilisateur** à :
- **Routes UI** (`journey-simulator`)
- **Endpoints backend** (`mf-back` et/ou `web`)
- **Tests existants** (Playwright / Jest / Vitest)
- **Gaps** (tests à ajouter pour couverture complète)

> Portée : “journey-simulator” (UI Vite/React), `mf-back` (Express/Mongo), `web` (Next.js/Prisma/Redis/worker mint).

## 0) Commandes de validation (source de vérité)

- **CI-like (lint/build/unit/E2E)** : `bash scripts/ci-verify.sh`
- **Prod local (DB + services + simulator preview)** : `bash scripts/prod-local-up.sh` / `bash scripts/prod-local-down.sh`
- **E2E UI (Playwright)** : `cd journey-simulator && npm run test:e2e`

## 1) Cartographie des routes UI (journey-simulator)

Routes définies dans `journey-simulator/src/App.tsx` :

- **Public**
  - `/` → Home
  - `/login` → Login
  - `/register` → Register
- **Protégées (sans wallet)**
  - `/dashboard`
  - `/playground`
  - `/resources`
  - `/support`
  - `/zyno`
  - `/guide`
- **Protégées (avec wallet stack)**
  - `/debug/mint`
  - `/journeys`
  - `/journeys/:journeyId`
  - `/journeys/demo`
  - `/journeys/completed`
  - `/dao`

## 2) Cartographie des APIs

### 2.1 `mf-back` (Express)

Montage global (voir `mf-back/app.js`) :
- `/user/*` (auth + profile + refresh + wallet)
- `/journey/*` (progression, missions, artifacts, etc.)
- `/dao/*` (governance)
- `/orchestration/*` (agents)
- `/rag/*`, `/analytics/*`, `/solana/*`, etc. (selon routes)
- probes : `/healthz`, `/readyz`

Exemples clés utilisés par la UI (voir `journey-simulator/src/utils/api.ts`) :
- Auth : `POST /user/register`, `POST /user/login`, `POST /user/logout`, `POST /user/refresh`
- Wallet auth : `POST /user/wallet-challenge`, `POST /user/login-wallet`
- Profile : `GET /user/profile`
- Journeys : `GET/PUT /journey/user-progress`, `POST /journey/reset-progress`, `GET /journey/artifacts`, `POST /journey/:journeyId/submit`
- DAO : `GET /dao/config`, `GET /dao/proposals`, `POST /dao/proposal`, `POST /dao/vote` (⚠️ voir “Gaps” plus bas : mismatch possible vs routes mf-back)
- Solana (côté mf-back) : `POST /solana/mint/simulate`, `POST /solana/mint/execute`
- Collaterize : `POST /journeys/:journeyId/phases/launch-collaterize/simulate`

### 2.2 `web` (Next.js /app/api)

Endpoints (dossier `web/app/api`) :
- Auth SIWS : `POST /api/auth/siws/challenge`, `POST /api/auth/siws/verify`, `POST /api/auth/verify`, `POST /api/auth/nonce`
- Journeys : `GET /api/journeys`, `POST /api/journeys/audit`, `GET /api/journeys/[id]/state`, `POST /api/journeys/[id]/step`, `POST /api/journeys/[id]/submit`
- Mint : `POST /api/mint/simulate`, `POST /api/mint/execute`, `GET /api/mint/status`, `GET /api/mint/last`
- Metadata : `GET /api/metadata/pass`, `GET /api/metadata/proof-of-skill`
- Pass : `POST /api/pass/check`
- RAG : `/api/rag/*` (doc/ingest/query/search)
- Metrics/Health : `/api/health`, `/api/healthz`, `/api/metrics`
- Tx : `POST /api/tx/prepare`
- Integrations : `POST /api/integrations/collaterize/simulate`

## 3) Matrice workflow → routes → endpoints → tests → gaps

### A) Accès / Auth (email + session)

- **Workflow**
  - Register → Login → Redirect → Profile
  - Refresh token rotation → retry request
  - Logout
- **Routes UI**
  - `/register`, `/login`
  - Routes protégées : `/journeys`, `/dashboard`, `/dao`, etc.
- **Endpoints**
  - `mf-back`: `POST /user/register`, `POST /user/login`, `GET /user/profile`, `POST /user/refresh`, `POST /user/logout`
- **Tests existants**
  - UI E2E :
    - `journey-simulator/tests/e2e/login.spec.ts` (UI login fields)
    - `journey-simulator/tests/e2e/login-success.spec.ts` (redirect + tokens en sessionStorage)
  - Backend unit/intégration :
    - `mf-back/tests/controllers.spec.js` (register/login/refresh/logout + profile)
    - `mf-back/tests/wallet-auth.test.js` (partie wallet)
- **Gaps (à ajouter)**
  - **E2E** : scénario “access token expiré → 401 → refresh → retry OK” (assert qu’un seul refresh est fait en concurrence)
  - **E2E** : multi-tabs / double refresh (simuler 2 requêtes simultanées)
  - **API** : tests rate-limit sur `/user/login` & `/user/register` (statut/headers)

### B) Auth wallet (challenge + signature)

- **Workflow**
  - Obtenir un challenge/nonce → signer → login wallet (mode strict prod)
- **Routes UI**
  - Typiquement `/journeys` (wallet stack active), modale wallet
- **Endpoints**
  - `mf-back`: `POST /user/wallet-challenge`, `POST /user/login-wallet`
  - (Selon produit) `web`: `POST /api/auth/siws/challenge`, `POST /api/auth/siws/verify`
- **Tests existants**
  - Backend :
    - `mf-back/tests/wallet-auth.test.js`
  - Web :
    - `web/src/__tests__/api.siws.redis.test.ts` (store Redis SIWS)
    - (autres SIWS dans `web/src/__tests__/*siws*`)
- **Gaps**
  - **E2E UI** : wallet auth bout-en-bout (difficile sans wallet réel → à faire en “mock wallet provider” ou test d’intégration côté API)
  - **Sécurité** : test explicite `ENABLE_STRICT_WALLET_LOGIN=true` (refus sans preuve)

### C) Navigation & garde “ProtectedRoute”

- **Workflow**
  - Accès route protégée non-auth → redirect login → retour après login
- **Routes UI**
  - Toutes routes sous `ProtectedRoute`
- **Endpoints**
  - `mf-back`: `GET /user/profile` (vérif session)
- **Tests existants**
  - UI E2E : couvert implicitement par `login-success.spec.ts` + flows journeys
- **Gaps**
  - **Unit UI** : tests React (Vitest) sur `ProtectedRoute` (loading, redirect, render)

### D) Journey core (sélection, état, progression)

- **Workflow**
  - Aller sur `/journeys` → sélectionner un parcours → workspace → navigation entre routes → persistance
- **Routes UI**
  - `/journeys`, `/journeys/:journeyId`, `/journeys/demo`
- **Endpoints**
  - `mf-back`: `GET/PUT /journey/user-progress`, `POST /journey/reset-progress`, `GET /journey/artifacts`
  - (optionnel selon le parcours) `web`: `/api/journeys/[id]/state`, `/api/journeys/[id]/step`
- **Tests existants**
  - UI E2E :
    - `journey-simulator/tests/e2e/journey-flow.spec.ts`
    - `journey-simulator/tests/e2e/journey-navigation-workflow.spec.ts`
    - `journey-simulator/tests/e2e/deep-linking.spec.ts`
    - `journey-simulator/tests/e2e/demo-mode.spec.ts`
    - `journey-simulator/tests/e2e/full-journey.spec.ts`
  - Backend :
    - `mf-back/tests/controllers.spec.js` (user-progress, reset, completePhase, etc.)
    - `mf-back/tests/journey-state.test.js` / `tests/unit/journeyController.test.js` (selon fichiers)
  - Web :
    - `web/src/__tests__/api.journeys.test.ts`
    - `web/src/__tests__/api.journeys.state.logs.test.ts`
    - `web/src/__tests__/api.journeys.step.*.test.ts` (replay, bad, llm, etc.)
- **Gaps**
  - **E2E** : “hard reload au milieu du parcours → état restauré” (assert persisted store)
  - **Intégration** : tests DB réels (Mongo) sur update progress (actuellement beaucoup de mocks)

### E) Submit mission (évaluation, blocs UI, erreurs)

- **Workflow**
  - Remplir une mission → submit → loading → résultat (evaluation/xp/actions)
- **Routes UI**
  - `/journeys/:journeyId`
- **Endpoints**
  - `mf-back`: `POST /journey/:journeyId/submit` (selon implémentation)
  - `web`: `POST /api/journeys/[id]/submit` (LLM/demo path)
- **Tests existants**
  - UI E2E :
    - `journey-simulator/tests/e2e/submit-mission.spec.ts`
    - `journey-simulator/tests/e2e/action-suggestions.spec.ts`
  - Web :
    - `web/src/__tests__/api.journeys.submit.test.ts`
- **Gaps**
  - **E2E** : cas erreurs (500, timeout, rate-limit) + UX (toast/message)
  - **Sécurité** : injection contenu dans blocs (XSS) en E2E (voir section UIBlocks)

### F) Ressources / Validation de liens

- **Workflow**
  - Afficher des ressources avec URLs, copier, gérer liens invalides
- **Routes UI**
  - `/resources` et blocs ressources dans journeys
- **Endpoints**
  - `mf-back`: endpoints resources (selon routes) + RAG docs
  - `web`: `/api/rag/*` si utilisé
- **Tests existants**
  - UI E2E :
    - `journey-simulator/tests/e2e/resource-validation.spec.ts`
  - Backend :
    - `mf-back/tests/integration/resourceValidator.integration.test.js`
    - `mf-back/tests/unit/resourceValidator.test.js`
  - Web :
    - `web/src/__tests__/api.rag.test.ts`
    - `web/src/__tests__/api.rag.batch.test.ts`
- **Gaps**
  - **E2E** : parcours complet “upload doc RAG → query → affichage résultat” (si feature réellement utilisée en prod)

### G) DAO Governance (lecture, vote, admin console)

- **Workflow**
  - Voir proposals → voter → admin console → créer proposal
- **Routes UI**
  - `/dao`
- **Endpoints**
  - `mf-back` (routes déclarées) :
    - `GET /dao/config`
    - `GET /dao/proposals`
    - `POST /dao/proposals` (create)
    - `POST /dao/proposals/:id/vote` (vote)
    - `POST /dao/proposals/:id/close` (close)
  - UI (`journey-simulator/src/utils/api.ts`) appelle aussi :
    - `POST /dao/proposal` et `POST /dao/vote` (⚠️ possible mismatch)
- **Tests existants**
  - UI E2E :
    - `journey-simulator/tests/e2e/dao-governance.spec.ts`
  - Backend :
    - `mf-back/__tests__/routes.dao.test.js`
- **Gaps**
  - **Incohérence potentielle** : harmoniser les endpoints UI ↔ mf-back (soit adapter UI vers `/dao/proposals` & `/dao/proposals/:id/vote`, soit ajouter alias backend `/dao/proposal` & `/dao/vote`)
  - **E2E** : test “close proposal” si feature exposée UI
  - **Sécurité** : test “admin key required” (E2E + API)

### H) Wallet modal & Stack Solana (lazy-load)

- **Workflow**
  - Ouvrir la modale wallet → wallets listés → endpoint RPC devnet OK
- **Routes UI**
  - Routes avec wallet stack : `/journeys*`, `/dao`, `/debug/mint`
- **Endpoints**
  - RPC Solana (connect-src) + endpoints internes éventuels
- **Tests existants**
  - UI E2E :
    - `journey-simulator/tests/e2e/wallet-modal.spec.ts`
- **Gaps**
  - **Perf** : test “pages sans wallet (dashboard/resources/support/guide) n’importent pas solana/wallet-adapter” (network assertions)

### I) Mint debug (simulate/execute, explorer link)

- **Workflow**
  - simulate → execute → signature affichée + lien explorer
- **Routes UI**
  - `/debug/mint`
- **Endpoints**
  - `mf-back`: `/solana/mint/simulate`, `/solana/mint/execute` (UI `api.ts`)
  - `web`: `/api/mint/simulate`, `/api/mint/execute`, `/api/mint/status`, `/api/mint/last` (pour pipeline worker)
- **Tests existants**
  - UI E2E :
    - `journey-simulator/tests/e2e/mint-debug.spec.ts`
  - Web :
    - `web/src/__tests__/api.mint.test.ts`
    - `web/src/__tests__/api.mint.execute.error.test.ts`
    - `web/src/__tests__/worker.mint.test.ts`
- **Gaps**
  - **E2E** : test “mint job async”: execute → poll status → completed (si UI le supporte)
  - **Sécurité** : KILL_SWITCH, auth headers, abuse/rate-limit

### J) UIBlocks sécurité (Markdown/Mermaid/exports)

- **Workflow**
  - Markdown rendu “safe” (escape HTML)
  - Mermaid opt-in + sanitize SVG
  - Exports (pdf/image/qrcode/svg) lazy-load
- **Routes UI**
  - Principalement `/journeys/:journeyId`, `/playground`
- **Endpoints**
  - généralement aucun (client-side), sauf RAG/assets
- **Tests existants**
  - Couverture indirecte via E2E journeys/playground
- **Gaps**
  - **Unit UI (Vitest)** : tests ciblés sur `UIBlocksRenderer` (XSS + mermaid sanitize + lazy import)
  - **E2E** : scénario “render diagram” (data-testid) + assert absence d’erreur console

## 4) Gaps prioritaires (ordre recommandé)

1. **DAO endpoint coherence** (UI vs mf-back) : éviter divergence prod (priorité haute)
2. **E2E refresh token rotation / stampede** (fiabilité + sécurité)
3. **Unit tests UIBlocksRenderer** (XSS/mermaid)
4. **Perf assertion “no wallet libs on non-wallet routes”**
5. **Mint worker async end-to-end** (si prod dépend du pipeline Next/Redis)



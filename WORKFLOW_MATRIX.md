# WORKFLOW_MATRIX v2 — Journey Simulator / mf-back / web (workflows ↔ routes ↔ API specs ↔ tests)

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



### 0.1) Conventions API (headers, auth, CORS) — à utiliser dans les tests

#### `mf-back` (Express)

- **Auth (routes protégées)** : header `Authorization: Bearer <accessToken>`
  - Le middleware `protect` accepte aussi `Bearer demo-token` (mode démo) et injecte un user fictif.
- **Admin key (routes admin)** : header `x-api-key: <ADMIN_API_KEY>`
- **CORS**
  - En local, autorise notamment `http://127.0.0.1:3003` / `http://localhost:3003` (voir `mf-back/app.js`).
  - En prod, restreindre via `CORS_ALLOWED_ORIGINS`.

#### `web` (Next.js /app/api)

- **Sessions/cookies**
  - `/api/auth/verify` pose un cookie `mfai_session` (httpOnly; `secure` en prod; `sameSite=strict`).
- **Auth SIWS**
  - `/api/auth/siws/*` retourne un `token` “jwt-like” côté API (pas forcément identique à `mf-back`).

### 0.2) Scripts QA par workflow (référence)

- **Stack prod-like locale** : `scripts/prod-local-up.sh` (DB + `mf-back` + `web` + worker mint + `journey-simulator` preview)
- **Smoke full-stack** : `scripts/full_stack_smoke.sh` (probes API + shell UI)
- **Arrêt/cleanup** : `scripts/prod-local-down.sh`
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

- **Specs endpoints (payloads / codes / headers)**
  - `POST /user/register`
    - **Headers**: `Content-Type: application/json`
    - **Body**: `{ name, email, password, wallet_address?, persona? }`
    - **201**: `{ success: true, accessToken, refreshToken, user }`
    - **400**: validation/duplicate
  - `POST /user/login`
    - **Headers**: `Content-Type: application/json`
    - **Body**: `{ email, password }`
    - **200**: `{ success: true, accessToken, refreshToken, user }`
    - **401**: invalid credentials
  - `GET /user/profile`
    - **Headers**: `Authorization: Bearer <token>`
    - **200**: `{ user }` (format exact selon controller)
    - **401**: token manquant/invalide
  - `POST /user/refresh`
    - **Headers**: `Content-Type: application/json`
    - **Body**: `{ refreshToken }`
    - **200**: `{ accessToken, refreshToken? }`
    - **400/401**: refresh absent/invalide/expiré
  - `POST /user/logout`
    - **Headers**: `Content-Type: application/json`
    - **Body**: `{ refreshToken }`
    - **200**: `{ success: true }`

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

- **Specs endpoints (payloads / codes / headers)**
  - `mf-back POST /user/wallet-challenge`
    - **Headers**: `Content-Type: application/json`
    - **Body**: `{ wallet_address }`
    - **200**: `{ success: true, nonce, message }` (selon controller)
  - `mf-back POST /user/login-wallet`
    - **Headers**: `Content-Type: application/json`
    - **Body**: `{ wallet_address, signature?, message? }`
    - **200**: `{ success: true, accessToken, refreshToken, user }`
    - **400/401**: signature invalide / champs manquants
  - `web POST /api/auth/siws/challenge`
    - **Body (optionnel)**: `{ address?: string }`
    - **200**: `{ challengeId, message, nonce, expiresAt }`
  - `web POST /api/auth/siws/verify`
    - **Body**: `{ address, signature, challengeId }`
    - **200**: `{ ok: true, address, token, issuedAt, expiresIn }`
    - **400**: `bad_request` / `invalid_or_expired_challenge`
    - **401**: `invalid_signature`

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

- **Specs endpoints (payloads / codes / headers)**
  - `GET /journey/user-progress`
    - **Headers**: `Authorization: Bearer <token>`
    - **200**: `{ success: true, progress: {...} }`
  - `PUT /journey/user-progress`
    - **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
    - **Body**: `{ total_xp?, current_level?, completed_phases? }`
    - **200**: `{ success: true }` (ou `{ progress: ... }`)
  - `POST /journey/reset-progress`
    - **Headers**: `Authorization: Bearer <token>`
    - **200**: `{ success: true }`
  - `GET /journey/artifacts`
    - **Headers**: `Authorization: Bearer <token>`
    - **200**: `{ success: true, artifacts: [...], currentPhase? }`

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
- **Specs endpoints (payloads / codes / headers + curl)**
  - `POST /journey/:journeyId/step` (mf-back)
    - **Auth**: aucune (route non protégée). Optionnel: si `Authorization: Bearer demo-token` est fourni, `req.user` sera set.
    - **Headers**: `Content-Type: application/json`
    - **Body (utilisé par l’UI)**
      - Provenance `journeyStore.runInteractiveStep`:
        - `phaseId: string`
        - `trackId: string`
        - `userInput: string`
        - `language: 'en' | 'fr'` (UI met souvent `'en'`)
        - `mode: string` (ex: `discovery|builder|expert`)
        - `tone: string` (ex: `pedagogical|investor_pitch|critical`)
        - `journeyState: object` (UI met au minimum `{ xp, completed }`, parfois tout `userProgress`)
      - Champs additionnels envoyés par certains blocs UI : `actionId` (ignoré côté backend si non utilisé)
    - **200**: payload Zyno (ex: `{ metadata, ui_blocks, agent_actions, next_state }`)
    - **500**: `{ success:false, message, error }`
    - **curl (local)**

```bash
curl -sS -X POST http://127.0.0.1:3002/journey/LOCAL-JOURNEY-ID/step   -H 'Content-Type: application/json'   -d '{
    "phaseId": "learn",
    "trackId": "builder",
    "userInput": "hello",
    "language": "en",
    "mode": "discovery",
    "tone": "pedagogical",
    "journeyState": { "xp": 0, "completed": [] }
  }'
```


  - `POST /journey/:journeyId/submit` (mf-back)
    - **Auth**: requis (`Authorization: Bearer <token>`). Le `demo-token` est accepté.
    - **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
    - **Body (utilisé par l’UI)** (depuis `JourneyWorkspace.tsx` + `api.submitMission`):
      - `missionId: string`
      - `inputType: string` (ex: `confirmation|text|link|...`)
      - `submission: string`
      - `language: string` (UI met souvent `'en'`)
      - `mode: string`
      - `tone: string`
      - `trackId: string` (persona id)
      - `phaseId: string`
      - `phaseNumber: number`
      - `journeyState: object` (UI envoie un snapshot riche : xp/totalXP/completed/completedCount/nfts/mfaiTokens/currentPhase…)
    - **200**: 
      - `{ success:true, message, phase_number, xp_awarded, evaluation, progress }`
    - **404**: `{ success:false, message:'User not found' }` (si token réel mais user absent)
    - **500**: `{ success:false, message, error }`
    - **curl (demo-token)**

```bash
curl -sS -X POST http://127.0.0.1:3002/journey/LOCAL-JOURNEY-ID/submit   -H 'Authorization: Bearer demo-token'   -H 'Content-Type: application/json'   -d '{
    "missionId": "activation-mission",
    "inputType": "confirmation",
    "submission": "I confirm completion.",
    "language": "en",
    "mode": "discovery",
    "tone": "pedagogical",
    "trackId": "capital-foundry",
    "phaseId": "activation",
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
  }'
```



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
- **Specs endpoints (payloads / codes / headers + curl)**

  #### Endpoints *canoniques* `mf-back` (ce qui existe réellement)

  - `GET /dao/config`
    - **Headers**: aucun
    - **200**: `{ quorumPercent, totalVotingPower, voters, proposalSettings }`

  - `GET /dao/proposals`
    - **Query**: `?status=active|closed` (optionnel)
    - **200**: `{ proposals: [{ id, title, description, createdBy, createdAt, status, votes, voterDetails, quorumMet, outcome }] }`

  - `POST /dao/proposals` (create)
    - **Auth admin**: requis via `x-api-key: <ADMIN_API_KEY>`
    - **Headers**: `x-api-key`, `Content-Type: application/json`
    - **Body (backend)**: `{ title: string, description?: string, createdBy?: string }`
    - **201**: `{ proposal: { id, title, description, createdAt, status, votes, quorumMet, voterDetails:{} } }`
    - **403**: `{ error:'Unauthorized' }`
    - **400**: `{ error:'Title is required' }`

  - `POST /dao/proposals/:id/vote`
    - **Headers**: `Content-Type: application/json`
    - **Body (backend)**: `{ voterId: string, support: true|false|'yes'|'no' }`
    - **200**: `{ proposal: {...} }`
    - **404**: `{ error:'Proposal not found', id }`
    - **400**: `{ error:'voterId and support are required' }` / `{ error:'Voter has already voted' }` / `{ error:'Voter not registered' }`

  - `POST /dao/proposals/:id/close`
    - **Auth admin**: requis via `x-api-key: <ADMIN_API_KEY>`
    - **200**: `{ proposal: {..., status:'closed', outcome } }`

  #### Endpoints actuellement appelés par l’UI (⚠️ mismatch à corriger)

  - `POST /dao/proposal`
    - **Body (UI)**: `{ title: string, description?: string }`
    - **Headers (UI aujourd’hui)**: `Authorization: Bearer <token>` (pas de `x-api-key`)
    - **Statut actuel côté backend**: **n’existe pas** dans `mf-back` → risque 404 en prod.

  - `POST /dao/vote`
    - **Body (UI)**: `{ proposalId: string, vote: 'yes'|'no' }`
    - **Problème**: le backend attend `{ voterId, support }` sur `POST /dao/proposals/:id/vote`. L’UI a un `selectedVoter` mais ne l’envoie pas via `api.castDaoVote`.

  - `POST /dao/proposal/:id/close`
    - **Statut backend**: endpoint backend réel est `POST /dao/proposals/:id/close` + `x-api-key`.

  #### cURL copy/paste (backend canonique)

```bash
# DAO config
curl -sS http://127.0.0.1:3002/dao/config

# List proposals
curl -sS http://127.0.0.1:3002/dao/proposals

# Create proposal (admin)
curl -sS -X POST http://127.0.0.1:3002/dao/proposals   -H 'Content-Type: application/json'   -H 'x-api-key: admin-secret-key'   -d '{"title":"Launch Community Treasury","description":"Allocate 10% to grants"}'

# Vote (weighted voter)
curl -sS -X POST http://127.0.0.1:3002/dao/proposals/prop_123/vote   -H 'Content-Type: application/json'   -d '{"voterId":"voter_1","support":"yes"}'

# Close proposal (admin)
curl -sS -X POST http://127.0.0.1:3002/dao/proposals/prop_123/close   -H 'x-api-key: admin-secret-key'
```



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

- **Specs endpoints (payloads / codes / headers)**
  - `mf-back POST /solana/mint/simulate`
    - **Headers**: `Authorization: Bearer <token>`
    - **Body**: `{ nftId?, destinationWallet?, metadata? }`
    - **200**: `{ ok: true, sim: { ok, estFeeLamports, riskScore, network, estimatedTimeSeconds } }`
  - `mf-back POST /solana/mint/execute`
    - **Headers**: `Authorization: Bearer <token>`
    - **Body**: `{ nftId?, destinationWallet?, metadata?, transactionSignature? }`
    - **200**: `{ ok:true, jobId, status, tx: { mintAddress, txSig } }`
    - **400**: verification failed
  - `web POST /api/mint/simulate`
    - **Body**: `{ recipient, name, symbol, uri }`
    - **200**: `{ ok:true, sim }`
    - **400**: `{ error:'bad_request' }`
  - `web POST /api/mint/execute`
    - **Body**: `{ spec: { recipient,type:'CERT_NFT',name,symbol,uri }, sim: { ok, estFeeLamports, riskScore, network, txB64? } }`
    - **200**: `{ ok:true, jobId, status:'queued' }`
    - **400**: `{ error:'bad_request', details }`
    - **403**: `{ error:'killswitch' }`
  - `web GET /api/mint/status?jobId=...|mintAddress=...`
    - **200/404/400** selon query

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




## 5) TODO “alignement scripts”

- `scripts/full_stack_smoke.sh` appelle `/auth/verify` en **GET**, mais `mf-back` expose `/auth/verify` en **POST** avec body `{ token }`.
  - Action : aligner le script sur l’API.

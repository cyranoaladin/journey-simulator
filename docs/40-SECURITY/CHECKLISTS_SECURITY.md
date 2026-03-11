<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

## Plan d’Action — Checklist Sécurité (Partie III)

➡️ Voir aussi la matrice de couverture : `docs/coverage/COVERAGE_MATRIX.md`.

Chaque item est vérifiable et ancré dans le repo. Utiliser les commandes indiquées (en lecture seule) pour confirmer l’état.

### A. Auth & Sessions

- ✅ **JWT accès 1h + refresh 7j, rotation hashée**
  🔎 Vérifier : `grep -n "expiresIn: '1h'" mf-back/controllers/user-controller.js`
  📌 Source : `mf-back/controllers/user-controller.js` (generateAccessToken / generateRefreshToken)
  🎯 DoD : jeton d’accès expiré en ≤1h, refresh hashé en base, refresh expiré à 7j.
- ✅ **SIWS wallet challenge TTL 5 min + anti-replay**
  🔎 Vérifier : `grep -n "wallet_nonce_expiry" mf-back/controllers/user-controller.js`
  📌 Source : `mf-back/controllers/user-controller.js` (`createWalletChallenge`, `loginWithWallet`)
  🎯 DoD : challenge expiré après 5 min, rejet si nonce absent ou mismatch.
- ✅ **Mode demo-token borné**
  🔎 Vérifier : `grep -n "demo-token" mf-back/middleware/auth.js mf-back/routes/auth-routes.js`
  📌 Source : `mf-back/middleware/auth.js`, `mf-back/routes/auth-routes.js`
  🎯 DoD : jeton `demo-token` accepté seulement via middleware, sans droits admin.
- ✅ **Rate limit auth / refresh**
  🔎 Vérifier : `grep -n "rateLimit" mf-back/routes/user-routes.js`
  📌 Source : `mf-back/routes/user-routes.js` (`authLimiter`, `refreshLimiter`)
  🎯 DoD : 429 émis après dépassement (60 auth / 15 min, 120 refresh / 15 min).

### B. Validation d’entrée & Idempotence

- ✅ **Schéma env (Zod) + CORS list**
  🔎 Vérifier : `grep -n "envSchema" mf-back/config/env.js`
  📌 Source : `mf-back/config/env.js`
  🎯 DoD : lancement bloqué si env invalide, origines parsées/mergées.
- ✅ **Rejets structurés (auth & wallet)**
  🔎 Vérifier : `grep -n "return res.status(4" mf-back/controllers/user-controller.js`
  📌 Source : `mf-back/controllers/user-controller.js`
  🎯 DoD : réponses JSON `{success:false|error:...}` cohérentes sur 4xx/401.
- ✅ **Idempotence submit / runs orchestrateur**
  🔎 Vérifier : recherche `memoryStore.save` dans `mf-back/orchestration/zynoVerticalSlice.js`
  📌 Source : `mf-back/orchestration/zynoVerticalSlice.js`
  🎯 DoD : même `runId` réutilise mémoire/actionPlan sans duplication.

### C. CORS / Headers / Helmet

- ✅ **Helmet activé**
  🔎 Vérifier : `grep -n "helmet()" mf-back/app.js`
  📌 Source : `mf-back/app.js`
  🎯 DoD : middleware helmet monté avant les routes.
- ✅ **CORS allowlist env-driven**
  🔎 Vérifier : `grep -n "allowedOrigins" mf-back/app.js` et `mf-back/config/env.js`
  📌 Source : `mf-back/app.js`, `mf-back/config/env.js`
  🎯 DoD : requêtes bloquées si origin hors liste (erreur explicite).
- ✅ **Headers sécurité (XFO/XCTO/referrer)**
  🔎 Vérifier : `node -e "console.log(require('helmet')())"` (helmet set par défaut)
  📌 Source : `mf-back/app.js` (helmet)
  🎯 DoD : réponses incluent X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

### D. Logs & Audit Trail

- ✅ **Logger structuré pino (traceId/runId)**
  🔎 Vérifier : `grep -n "createLogger" mf-back/utils/logger.js`
  📌 Source : `mf-back/utils/logger.js`, usages dans `mf-back/orchestration/zynoVerticalSlice.js`
  🎯 DoD : logs JSON avec `scope` et métas (traceId/runId/agentId).
- ✅ **Audit trail in-memory (TTL/FIFO)**
  🔎 Vérifier : `cat mf-back/orchestration/auditTrailStore.js`
  📌 Source : `mf-back/orchestration/auditTrailStore.js`
  🎯 DoD : `summary().entriesStored` s’incrémente par run, max 100, TTL 1h.
- ✅ **Réponses append-only pour proofs / submissions**
  🔎 Vérifier : `grep -n "proof" -n mf-back` ou `docs/PLATFORM_DEEP_DIVE_FR.md` (sections Proof-of-Skill/NFT)
  📌 Source : `docs/PLATFORM_DEEP_DIVE_FR.md` (Proof-of-Skill), `docs/WEB3_INTEGRATION.md`
  🎯 DoD : preuves stockées/servies sans mutation (hash + signature côté spec).

### E. Orchestration Zyno / Agents

- ✅ **Production guards (real execution)**
  🔎 Vérifier : `grep -n "productionGuards" mf-back/orchestration/zynoVerticalSlice.js`
  📌 Source : `mf-back/orchestration/productionGuards.js`, `mf-back/orchestration/zynoVerticalSlice.js`
  🎯 DoD : REAL bloqué si `EXECUTION_ENABLED` ≠ true, gate non APPROVED, contradictions, FAIL/TIMEOUT ou agent critique manquant.
- ✅ **LLM/RAG modes et ops**
  🔎 Vérifier : `grep -n "systemStatus" mf-back/orchestration/zynoVerticalSlice.js`
  📌 Source : `mf-back/orchestration/zynoVerticalSlice.js`
  🎯 DoD : réponse contient `ops` + `systemStatus` (llm mock/openai, rag local/remote/disabled).
- ✅ **Execution plan dry-run par défaut**
  🔎 Vérifier : `grep -n "executionPlan" mf-back/orchestration/zynoVerticalSlice.js`
  📌 Source : `mf-back/orchestration/zynoVerticalSlice.js`, `mf-back/orchestration/executionEngine.js`
  🎯 DoD : tools simulés sauf flag + gate approuvée; blocage => fallback SIMULATED.

### F. Web3 Pipeline (si activé)

- ✅ **Proof-of-Skill / Anchor memo**
  🔎 Vérifier : `grep -n "proof-of-skill" docs/PLATFORM_DEEP_DIVE_FR.md docs/WEB3_INTEGRATION.md`
  📌 Source : `docs/PLATFORM_DEEP_DIVE_FR.md`, `docs/WEB3_INTEGRATION.md`, `docs/solana_spec.md`
  🎯 DoD : hash canonical + signature décrits, memo/metadata formatés (voir routes proof-of-skill).
- ✅ **Mint idempotent / états PROCESSING→FAILED**
  🔎 Vérifier : `grep -n "mint" docs/WEB3_INTEGRATION.md`
  📌 Source : `docs/WEB3_INTEGRATION.md` (flux minting + queue)
  🎯 DoD : job mint unique par seed, transitions PROCESSING/FAILED/SUCCEEDED documentées.

### G. Tests & Release Workflow

- ✅ **Tests ciblés backend**
  🔎 Vérifier : `cd mf-back && npm test -- --runTestsByPath __tests__/registry.test.js __tests__/intentRouter.test.js __tests__/verticalSliceOrchestration.test.js`
  📌 Source : `mf-back/__tests__/*`
  🎯 DoD : tests PASS (coverage agents, router, orchestration).
- ✅ **Smoke S0 avant release**
  🔎 Vérifier : `cat docs/_source_of_truth/S0_SMOKE_RUNBOOK.md`
  📌 Source : `docs/_source_of_truth/S0_SMOKE_RUNBOOK.md`
  🎯 DoD : smoke exécuté (API health, auth happy path, orchestration dry-run).
- ✅ **Rollback prêt**
  🔎 Vérifier : `docs/cicd/rollback.md`
  📌 Source : `docs/cicd/rollback.md`
  🎯 DoD : scénario de rollback documenté (commande + état attendu).

---

**Rappel** : Pas d’exécution réelle tant que `EXECUTION_ENABLED` ≠ true et gate non APPROVED. Toujours consigner traceId/runId dans les vérifications.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

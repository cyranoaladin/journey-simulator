<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Quality Evidence Pack (R3.3)

Objectif : prouver que le système est cohérent, robuste, exploitable, sans modifier le contrat `/orchestration/vslice`.

## Références clés

- Couverture agents : `docs/agents/AGENT_COVERAGE.md`, `docs/coverage/COVERAGE_MATRIX.md`
- Plans d’action agents : `docs/agents/PLANS_ACTIONS.md`
- Mapping parcours → agents : `docs/journeys/JOURNEY_AGENT_MAP.md`
- Checklists sécurité : `docs/security/CHECKLISTS_SECURITY.md`
- Orchestration & guards : `mf-back/orchestration/zynoVerticalSlice.js`, `productionGuards.js`, `web3Guards.js`, `killSwitch.js`
- Idempotence & audit : `idempotencyStore.js`, `auditTrailStore.js`
- Release / rollback / smoke : `scripts/release/preflight.js`, `scripts/release/smoke.js`, `scripts/release/rollback.js`

## Vérifications rapides

- Tests Jest : `cd mf-back && npm test -- --runTestsByPath __tests__/verticalSliceOrchestration.test.js __tests__/intentRouter.test.js __tests__/registry.test.js` (61 PASS)
- Préflight (bloquant si KO) : `npm run release:preflight`
- Smoke S0 (local, DRY_RUN) : `npm run release:smoke`
- Rollback instantané : `npm run release:rollback` (active kill switch ALL + purge stores)

## What happens when things go wrong

- Agent FAIL/TIMEOUT : agrégé en `ops.failures`/`timeouts`, decision reste DRY_RUN, aucune exception (voir `executionEngine`, `zynoVerticalSlice.js`).
- RAG vide/désactivé : `ops.fallbacks` + `systemStatus.rag` signalent le fallback local, citations vides tolérées (`applyRagPolicy`).
- LLM indisponible/mock : `ops.llm.mode` bascule en `mock|disabled`, réponses restent structurées, summary/action toujours présents.
- Intent contradictoire : `productionGuards` bloque REAL, ajoute raisons dans `ops.execution.blockReasons`, fallback DRY_RUN.
- Web3 invalid/anchor/mint : `web3Guards` retourne WARN/BLOCK, pousse DRY_RUN et raisons dans `systemStatus.web3` + `ops.execution.blockReasons`.
- Idempotent replay : `idempotencyStore` renvoie la réponse cache + `ops.fallbacks = ["idempotent_replay"]`, pas de double exécution.
- Kill switch (manuel/auto) : `killSwitch.evaluate` force DRY_RUN, ajoute `kill_switch` dans `ops.fallbacks` et expose `systemStatus.killSwitch`.

- Audit & traçabilité : `auditTrailStore` incrémente chaque run, résumé visible dans `systemStatus.audit`, logs pino structurés (traceId/runId).

## Comment exploiter

- Avant release : `release:preflight` doit être OK (kill switch OFF, EXECUTION_ENABLED != true, agents critiques enabled, stores sous seuil).
- Après mise à jour : `release:smoke` doit passer (5 cas S0, jamais d’exception, DRY_RUN only).

- Incident / retour arrière : `release:rollback` (kill switch ALL + purge idempotency/audit/memory) pour revenir en état sûr.
- Lecture parcours : s’appuyer sur `JOURNEY_AGENT_MAP.md` puis les checklists des agents invoqués.

## État attendu (R3.3)

- Tous les agents ont un rôle clair (réel/partiel/stub explicité).
- Sorties agents harmonisées : `summary` concis, `findings`, `actions` verb-first, `confidence`, `assumptions`, `citations` si RAG.
- Orchestration lisible et DRY_RUN-safe par défaut, REAL ultra-guardé (guards + kill switch + idempotence).

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

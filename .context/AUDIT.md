# Global Audit & Automated Test Spec — journey.mfai.app

**Document interne (README-style) — à consulter de manière itérative**
**Rôle cible : antigravity (Senior Lead QA + Release/Hardening Auditor + AI Orchestration Supervisor)**
**Référence temporelle : 03 Jan 2026 (Africa/Tunis)**
**But :** ce document est la *source unique* pour piloter un audit complet **phase par phase**, avec **preuves reproductibles**, **artefacts**, et **verdict final**.

---

## 0) Mission, Verrouillage, Verdict

### Mission

Produire un **Audit Complet + Campagne de Tests Automatisés** couvrant :

- Fonctionnel (workflows utilisateurs, progression, ressources)
- Technique (API, DB, stabilité, erreurs)
- UX/UI (Trinity Layout, dashboards, UI blocks, animations)
- Agentique (Zyno + agents : routage, orchestration, contrats I/O, logs)
- RAG + LLM (contrats, remote, fallback, observabilité, déterminisme minimal)
- Persistance & long-term memory (multi-user, re-login)
- On-chain (mint, staking, vote DAO, idempotence, cohérence phases)
- Hardening / sécurité d’exécution (non-root, read-only, no-new-privileges, tmpfs, crash-loop)

### Verdict attendu (obligatoire)

- `VERDICT=PASS_READY_FOR_PROD` **ou**
- `VERDICT=FAIL_BLOCKING`

Si FAIL, fournir **obligatoirement** :

1) liste des blocages (root cause + impact)
2) correctifs minimaux (surgical fixes)
3) preuve post-fix (re-run + outputs sanitisés)
4) risques résiduels + plan de remédiation priorisé

---

## 1) Contraintes non négociables (Alpha Directives)

### 1.1 Repo-driven (zéro invention)

- Ne pas supposer l’existence d’un fichier/script/route.
- Toujours **inventorier d’abord**, puis adapter.

### 1.2 Zéro secrets

- Aucun secret dans logs/rapports/traces/screenshots/commits.
- Sanitization systématique : `KEY=***`, `URI=***`.

### 1.3 Preuves reproductibles

Chaque preuve doit fournir :

- **Commande/script**
- **Output attendu PASS/FAIL**
- **Emplacement d’artefact**

### 1.4 Itératif (obligation de boucle)

Ce document doit être consulté **à chaque phase** :

- Phase Start → proofs → gates → artefacts → verdict de phase → update docs.

### 1.5 Séparation DEMO vs REAL (preuve obligatoire)

- DEMO → DB réelle : interdit
- REAL → localStorage demo : interdit
- Doit être prouvé par des tests dédiés + dumps sanitisés.

---

## 2) Layout d’exécution (Profiles) — 3 profils requis

> **Règle :** définir exactement ce qui est réel dans le repo avant d’exécuter.
> Les profils sont des “modes d’audit” reproductibles.

### PROFILE_A — Local Dev (safe)

- Dev rapide, itérations courtes
- DB locale ou mocks contrôlés
- RAG local si dispo sinon remote staging
- LLM réel ou stub (explicitement prouvé)

**Sorties attendues :**

- tests unit/integration OK
- diagnostics rapides

### PROFILE_B — Prod-like Docker (deploy/hardened)

- `docker compose -f docker-compose.deploy.yml ...`
- Hardening requis :
  - non-root
  - read-only rootfs (si activé)
  - `SKIP_NPM_INSTALL=true`
  - tmpfs `/tmp`
  - `no-new-privileges:true`
- RAG remote (prod endpoint)
- LLM réel (preuve déterministe)

**Sorties attendues :**

- stabilité conteneur
- preuves RAG/LLM “in-container”
- e2e UI

### PROFILE_C — Chain Mode (Devnet/Testnet)

- Même base que B + web3 enabled
- Idempotence (replay safe)
- Gestion rate-limit RPC
- Logs tx hash OK (pas de secrets)

---

## 3) Release Gates (PASS/FAIL) — règles fermes

### Gates globaux

- **Tests** : 100% PASS sur suites activées (unit + integration + e2e)
- **Lint/Typecheck** : 100% PASS (ou exceptions *documentées + justifiées*)
- **RAG** : en PROFILE_B, `RAG_used_remote=true` sinon FAIL (sauf test fallback explicitement prévu)
- **LLM** : appel réel déterministe (temp=0, max_tokens faible)
- **Stabilité** : crash-loop interdit, RestartCount stable sur fenêtre d’observation
- **UX** : pas de régression majeure (screenshots diff / assertions)
- **Data** : progression + mémoire restaurées au re-login
- **On-chain** : mint/stake/vote validés (réel ou mock strict)

### Gates “Trinity Layout” (si la spec existe réellement dans le repo)

- Navigator **80px**
- Zyno Pulse **320px**
- Central Stage sans overlap
- tokens : `#050510`, `#9945FF`, `#14F195`, police Space Grotesk (si codés)
- UIBlocksRenderer : rendre **tous les types existants** (ne pas inventer un nombre)
- animations : easing/durations *si codés* (sinon discovery)

---

## 4) Artefacts & Fichiers (obligatoires)

### Dossier artefacts

Créer/maintenir :

- `artifacts/qa-report.md` (rapport principal)
- `artifacts/test-results.json` (résultats structurés)
- `artifacts/logs-sanitized.txt`
- `artifacts/screenshots/`
- `artifacts/e2e-traces/`
- `artifacts/commands.md` (toutes commandes)
- `artifacts/failures.md` (si FAIL_BLOCKING)

### Docs internes (si présents / à maintenir)

- `docs/ops/ENV_VARIABLES_CHECKLIST.md`
- `docs/ops/DEPLOY_HARDENING.md`
- `final_verdict.md`
- `task.md`
- `walkthrough.md`

---

## 5) PHASE 0 — Discovery, Baseline & Plan (OBLIGATOIRE)

### Objectifs

- Cartographier la stack réelle :
  - frontend, backend, DB, orchestration, agents, scripts, docker, env
- Produire le tableau “System Map”
- Définir précisément PROFILE_A/B/C pour *ce repo*
- Établir les gates définitifs
- Lister les suites de tests existantes

### Preuves attendues

- Inventaire repo (arbres + points d’entrée)
- Ports réels + endpoints réels
- Inventaire agents (nombre réel)
- Inventaire scripts QA

### Sorties (artefacts)

- `artifacts/qa-report.md` section Phase 0
- `artifacts/commands.md` (start/stop / debug)
- Mise à jour `task.md` : Phase 0 = DONE

---

## 6) PHASE 1 — Harness & Certification logique (unit/integration)

### Objectifs

- Stabiliser le runner QA (CI-like)
- Corriger régressions bloquantes (lint/typecheck/unit/integration)
- Éliminer :
  - mock induction failures
  - async leaks
  - import/export inconsistants
  - crashes “req.headers undefined” / null deref

### Exigences “Runner”

Mettre en place / valider une commande maîtresse unique, ex :

- `npm run qa:full`

Elle doit orchestrer :

1) lint
2) typecheck
3) unit tests
4) integration tests
5) contract tests (RAG schema)
6) e2e (si présent)
7) security sanity (secrets scan)
8) perf smoke minimal

### Gates Phase 1 (R-series — BLOQUANTS)

- **R1 Linguistic Integrity** : grep CI obligatoire détectant toute chaîne non-anglaise dans `journey-simulator/src` et `mf-back/agents` (fail si détection > 0 hors whitelists).
- **R2 Guide Completeness** : `GuidePage.tsx` doit rendre les 4 modules clés (NFT Certificates, Staking, DAO Governance, Simulation Mode) avec assertions e2e.
- **R3 E2E Truthfulness** : “Route Tracker” activé ; fail si >20% des réponses backend sont mockées en environnement E2E.

### Preuves

- output PASS complet
- `test-results.json` sans rouge
- `logs-sanitized.txt` sans secrets

### Sorties

- `artifacts/qa-report.md` section Phase 1
- `final_verdict.md` (Phase 1 PASS/FAIL)
- `task.md` Phase 1 = DONE / BLOCKED

---

## 7) PHASE 2 — UX/UI (Trinity Layout & Dashboards) — Desktop

### Objectifs

- Vérifier invariants de layout (si codés)
- Vérifier dashboards :
  - ressources visibles après déblocage
  - chat Zyno/agents affiché (scroll/pagination)
  - états loading/error/empty propres
- Vérifier UI Blocks rendus à partir des JSON Zyno

### Tests attendus

- E2E Playwright (ou suite réelle du repo)
- Assertions DOM/layout (overlap/viewport)
- Screenshots automatisés + diff si dispo
- Zéro erreurs console non gérées
- Pixel-perfect Trinity Layout : sidebar Pulse 320px interactive, nav 80px, aucun overlap Central Stage sous flux AI ; vérif couleurs `#9945FF` et `#14F195` appliquées dans UI blocks dynamiques.

### Preuves / Sorties

- `artifacts/screenshots/*`
- `artifacts/e2e-traces/*`
- section Phase 2 dans `qa-report.md`

---

## 8) PHASE 3 — Workflows utilisateurs & Phases de parcours

### Objectifs

- Automatiser un parcours complet pour **tous les personas réels**
- Vérifier :
  - gating
  - transitions
  - rewards
  - déblocage ressources
  - cohérence enchaînement phases

### Cas obligatoires

- Onboarding → start journey → progression phases → unlock ressources → completion
- Accès interdit (RBAC/gating) doit être bloqué UI + API

### Preuves / Sorties

- logs horodatés
- export JSON progression (sanitisé)
- captures UI par phase
- section Phase 3 dans `qa-report.md`

---

## 9) PHASE 4 — Agents & Orchestration (Zyno + agents)

### Objectifs

Pour chaque agent réel :

- invocable
- contrat I/O valide (schema)
- isolation multi-user (pas d’écrasement mémoire)
- production ressources attendues
- traces : timeline, durée, retries, statut

### Sous-tests obligatoires

- Intent routing : input → agent correct
- Edge cases : ambiguïtés, inputs vides, timeouts, erreurs réseau
- Orchestrateur Zyno : pas de crash silencieux
- Validation “Specialized Swarm” : requête `security` route vers `SentinelAgent` (pas `CoachAgent`), handover Coach → InvestorDemo conserve l’état (learning → pitching) avec persistance.

### Preuves

- timeline d’exécution (agent, durationMs, status, retries)
- output preview sanitisé
- absence d’erreurs silencieuses

---

## 10) PHASE 5 — RAG + LLM (Contract, Remote, Fallback, Observabilité)

### 5.1 RAG Contract Tests (strict)

Valider selon la réalité du repo :

- `content` présent
- alias `text===content` si applicable
- `source` / `metadata` selon schema réel
- topK clamp `RAG_MAX_TOPK`
- routing collection (ex: web3 → web3_rag) selon règles réelles
- fallback explicitement taggé (ex: `local_fallback`, `UNVERIFIED_LOCAL`)

### 5.2 LLM Tests (réel + déterministe)

- Appel réel OpenAI (PROFILE_B) :
  - `temperature=0`
  - `max_tokens` minimal
  - output déterministe (“OK”/“Ping” contrôlé)
- Prouver non-mock

### 5.3 Observabilité & logs

- Logs structurés sans secrets :
  - query (hash/trim si sensible)
  - collection
  - topK
  - durées
  - erreurs
- Compteurs : fallback_count, timeout_count, rate_limit_count

### Preuves / Sorties

- `RAG_used_remote=true`
- `LLM_REAL_STATUS=OK`
- logs sanitisés
- section Phase 5 dans `qa-report.md`

---

## 11) PHASE 6 — On-chain (Mint, Staking, DAO Vote)

### Objectifs

- valider mint / staking / vote
- cohérence phases on-chain/off-chain

### Règles

- SAFE : mock strict (mêmes contrats/UX)
- DEVNET/TESTNET : tx hashes + idempotence + rate-limit handling

### Preuves / Sorties

- tx hashes (si réel)
- logs workers/controllers
- captures UI modales
- section Phase 6 dans `qa-report.md`

---

## 12) PHASE 7 — Persistance & Long-Term Memory (multi-user)

### Objectifs

- 2 utilisateurs : 1 demo, 1 real
- progression + chat + ressources
- restart conteneur + re-login
- restauration exacte

### DEMO vs REAL (preuve dure)

- demo : localStorage-only (ou mécanisme réel)
- real : DB-only
- prouver absence contamination croisée

### Preuves

- dumps JSON sanitisés
- diff avant/après re-login
- preuve invariance de l’autre mode
- Crash-Recover : simuler crash backend pendant génération agent ; à la reconnexion, progression restaurée depuis checkpoint **Proof-of-Vision™**.

---

## 13) PHASE 8 — Security & Hardening Regression (si hardening actif)

### Objectifs

Vérifier :

- `read_only=true` (si activé)
- non-root uid (ex: 101 nodeapp)
- `SKIP_NPM_INSTALL=true`
- tmpfs `/tmp`
- `no-new-privileges:true`
- RestartCount stable
- logs sans EROFS/EACCES

### Preuves (exemples)

- `docker inspect` : ReadonlyRootfs, User, RestartCount
- Write tests :
  - `/usr/src/app` read-only
  - `/tmp` writable
- logs (last 200 lines) : no crash markers

---

## 14) Reporting final (obligatoire)

### Rapport principal : `artifacts/qa-report.md`

Doit inclure :

- résumé exécutif
- état de chaque phase
- preuves brutes sanitisées
- liens vers screenshots/traces
- anomalies + correctifs appliqués
- gates & conformité

### Si FAIL : `artifacts/failures.md`

- root cause
- fix minimal
- re-run proof
- risques résiduels

### Release Gate (section finale)

- `VERDICT=PASS_READY_FOR_PROD` ou `VERDICT=FAIL_BLOCKING`
- checklist :
  - RAG remote OK
  - LLM déterministe réel OK
  - E2E UI OK
  - Persistance OK
  - On-chain OK (réel/mock strict)
  - Hardening OK (si applicable)

---

## 15) Routine itérative (à suivre strictement)

À chaque nouvelle exécution de phase :

1) **Lire ce doc** (sections 0→phase en cours)
2) **Exécuter** uniquement ce qui est repo-confirmé
3) **Capturer** preuves sanitisées
4) **Mettre à jour** :
   - `artifacts/qa-report.md`
   - `final_verdict.md`
   - `task.md`
   - `walkthrough.md` (si utilisé)
5) **Déclarer** :
   - `PHASE_X=PASS` ou `PHASE_X=FAIL_BLOCKING`
6) **Proposer** la phase suivante avec gates

---

## 15.1 [NOUVEAU] R-Series Certification (Hardening)
>
> Tous les scripts/artéfacts R-Series sont bloquants avant TGE (Token Generation Event).

- **Proof 11 Check** : `proof_lead11.sh` doit renvoyer code 0 et produire `certification.json`.
- **Route Tracker** : logs Playwright doivent prouver qu’un appel Solana RPC est émis pour chaque action “Launch”.
- **R1/R2/R3** : voir Phase 1 (gates bloquants) et reporter les preuves dans `artifacts/qa-report.md`.

## 15.2 [NOUVEAU] Internet Capital Market (ICM) Logic Test

- **Bonding Curve Simulation** : le CFO Agent doit choisir courbe Sigmoïde ou Linéaire selon les métadonnées projet (audit des sorties).
- **Collaterize Integration** : auditer le handshake API `mf-back` ↔ moteur Collaterize (contrats I/O, statuts, latence, erreurs).

## 15.3 [NOUVEAU] Persona-Based Stress Testing

- **Web2 Migrator** : tester le flux “No-Code” de déploiement complet.
- **Web3 Builder** : tester “AI Audit” via la connexion SentinelAgent ↔ T-Scop.

---

## 16) Points explicitement exigés (à ne jamais oublier)

- Dashboards cohérents (frontend)
- Parcours / phases de parcours cohérents (enchaînement)
- Workflows utilisateurs complets
- Fonctionnement de **tous les agents**
- RAG + LLM : preuves “remote” + déterminisme minimal
- Production de ressources par agents + disponibilité dashboard
- Mint / staking / vote DAO
- Séparation demo vs real (preuve anti-contamination)
- Long-term memory par utilisateur (multi-user)
- Affichage réponses agents & Zyno dans dashboards
- Mode démo vs mode réel : séparation claire (UI + storage + API)
- Hardening : non-root + read-only + stabilité

---

## 17) Commandes (placeholder — à remplir repo-driven)
>
> Remplir `artifacts/commands.md` avec les commandes exactes trouvées dans le repo.
> Aucun placeholder ne doit rester sans justification.

Exemples indicatifs (à remplacer par le réel) :

- `npm run qa:full`
- `docker compose -f docker-compose.deploy.yml up -d --build`
- `playwright test`
- scripts node `scripts/*`

---

### FIN

**Ce document est la spec d’audit.**
Aucune phase ne doit être exécutée sans y être conforme (repo-driven + preuves + gates + artefacts).

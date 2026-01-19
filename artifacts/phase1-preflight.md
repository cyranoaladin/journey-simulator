# PHASE 1 — Pre-Flight Report
**Date**: 2026-01-03T13:53:05+01:00  
**Référence**: AUDIT.md + Conditions de supervision

---

## 1. Versioning & État Repo

### Git
- **Commit**: `b17a8dd`
- **Status**: ⚠️ **MODIFIED** (nombreux fichiers modifiés + untracked)
  - Modified: ~500+ fichiers (backend, frontend, web, scripts)
  - Untracked: artifacts/, tests E2E, scripts QA

**Impact**: Repo en état de développement actif. Modifications non committées présentes.

### Versions
- **Node.js**: v22.21.0 ✅
- **npm**: 11.6.3 ✅
- **Docker**: 29.1.3 ✅
- **Docker Compose**: v5.0.1 ✅

---

## 2. Sanity Check Env (Sans Valeurs)

**Variables Critiques** (Backend):
- `OPENAI_API_KEY`: ✅ PRESENT
- `RAG_SEARCH_URL`: ✅ PRESENT
- `RAG_API_KEY`: ✅ PRESENT
- `NODE_ENV`: ✅ PRESENT
- `MONGO_URI`: ✅ PRESENT

**Verdict Env**: ✅ Toutes variables critiques présentes

---

## 3. Profil d'Exécution Choisi

### Profil: **PROFILE_A (Local Dev)**

**Justification**:
1. **État du repo**: Nombreuses modifications non committées → développement actif
2. **Corrections rapides**: PROFILE_A permet itérations rapides sans rebuild Docker
3. **Hardening**: PROFILE_B (read-only) pourrait bloquer corrections de tests
4. **Stratégie**: 
   - Phase 1.1-1.3: PROFILE_A (corrections)
   - Phase 1.4: Basculer PROFILE_B pour E2E final + preuves hardening

**Configuration PROFILE_A**:
```bash
# Backend (déjà running)
cd mf-back
MONGO_URI=mongodb://127.0.0.1:27018/journey PORT=3002 npm run dev

# Frontend (pour E2E)
cd journey-simulator
npm run build && npm run preview  # Port 4173
```

**Services Actifs**:
- ✅ Backend: Port 3002 (running depuis 30min)
- ✅ MongoDB: Port 27018 (Docker, healthy)
- ✅ PostgreSQL: Port 5433 (Docker, healthy)
- ✅ Redis: Port 6380 (Docker)

---

## 4. Périmètre QA Runner (`npm run qa:full`)

**Fichier**: `scripts/qa-runner.js`

**Orchestration** (dans l'ordre):

1. **Frontend Lint**
   - Command: `npm run lint` (journey-simulator/)
   - Tool: ESLint
   - Ignore errors: true

2. **Frontend Typecheck**
   - Command: `npm run typecheck` (journey-simulator/)
   - Tool: TypeScript (tsc --noEmit)
   - Ignore errors: true

3. **Backend Tests**
   - Command: `npm test` (mf-back/)
   - Tool: Jest
   - Ignore errors: true

4. **RAG Contract**
   - Command: `npm run qa:rag`
   - Script: `scripts/rag-contract-test.js`
   - Ignore errors: true

5. **Write Integrity**
   - Command: `npm run qa:integrity`
   - Script: `scripts/write-integrity-check.js`
   - Tests: EROFS / Tmp writability
   - Ignore errors: true

6. **Container Stability** (si PROFILE != A)
   - Command: `docker inspect --format="{{.Name}}: {{.RestartCount}}" mfai-api mfai-web`
   - Check: RestartCount = 0
   - **SKIPPED en PROFILE_A**

7. **Security Scan**
   - Command: `grep -r "sk-[a-zA-Z0-9]\\{20\\}" .`
   - Check: Pas de clés OpenAI leakées
   - Ignore errors: true

8. **E2E Suites (Partial)**
   - Command: `npx playwright test tests/e2e/01-navigation tests/e2e/02-agent-core tests/e2e/03-agent-workflows --reporter=list`
   - Catégories: Navigation, Agent Core, Agent Workflows
   - **Note**: Pas full (manque web3, data-validation, dashboard-intel, performance)

**Artefacts Générés**:
- ✅ `artifacts/logs-sanitized.txt` (logs horodatés)
- ✅ `artifacts/qa-report.md` (rapport + gates)
- ✅ `artifacts/test-results.json` (résultats structurés)
- ✅ `artifacts/failures.md` (si FAIL_BLOCKING)

**Verdict Final**:
- `PASS_READY_FOR_PROD` si tous gates PASS
- `FAIL_BLOCKING` si au moins 1 gate FAIL

---

## 5. Gaps Identifiés (QA Runner vs AUDIT.md)

### Manquants selon AUDIT.md Section 6:

1. ❌ **Frontend Unit Tests (Vitest)**
   - Absent du runner actuel
   - À ajouter: `npm test` (journey-simulator/)

2. ❌ **E2E Full Coverage**
   - Runner actuel: 3 catégories seulement
   - Manquants: web3-simulation, data-validation, dashboard-intel, performance
   - À compléter en Phase 1.4

3. ⚠️ **Lint Backend**
   - Pas de lint configuré pour mf-back
   - À vérifier si nécessaire

### Recommandations:

**Phase 1.1 (Harness Dry Run)**:
- Exécuter runner actuel tel quel
- Capturer outputs + identifier blocages

**Phase 1.2-1.3**:
- Ajouter Vitest au runner
- Corriger gates Backend + Frontend

**Phase 1.4**:
- Étendre E2E à toutes catégories
- Basculer PROFILE_B pour preuves finales

---

## 6. Preuves Pre-Flight (Sanitisées)

```
Git Commit: b17a8dd
Git Status: MODIFIED (500+ files)
Node.js: v22.21.0
npm: 11.6.3
Docker: 29.1.3
Docker Compose: v5.0.1

Environment Variables:
OPENAI_API_KEY=PRESENT
RAG_SEARCH_URL=PRESENT
RAG_API_KEY=PRESENT
NODE_ENV=PRESENT
MONGO_URI=PRESENT

Services Status:
Backend (3002): ✅ RUNNING
MongoDB (27018): ✅ HEALTHY
PostgreSQL (5433): ✅ HEALTHY
Redis (6380): ✅ UP
```

---

## 7. Décision Pre-Flight

**Statut**: ✅ **PRE-FLIGHT PASS**

**Profil Choisi**: PROFILE_A (Local Dev)

**Périmètre QA Runner**:
1. Frontend Lint
2. Frontend Typecheck
3. Backend Tests (Jest)
4. RAG Contract
5. Write Integrity
6. Security Scan
7. E2E Partial (3 catégories)

**Gaps à combler**: Vitest + E2E Full (Phase 1.4)

---

## ❓ DEMANDE DE VALIDATION SUPERVISION

**Question**: **OK pour lancer PHASE 1.1 (Harness Dry Run) ?**

**Action proposée**:
```bash
cd /home/alaeddine/Documents/journey_mfai_back_front
PROFILE=A npm run qa:full
```

**Sorties attendues**:
- `artifacts/logs-sanitized.txt`
- `artifacts/test-results.json`
- `artifacts/qa-report.md`
- Verdict: PASS ou FAIL_BLOCKING

⏸️ **EN ATTENTE DE VALIDATION EXPLICITE**

---

## 8. Repo Dirty Snapshot (Exigence 2.2)

**Compteurs**:
- **Modified**: 737 fichiers (` M` - staged/unstaged changes)
- **Untracked**: 42 fichiers (`??` - nouveaux fichiers)
- **Total**: 779 fichiers affectés

**Untracked Files (Top 20)**:
```
?? .deploy.env.bak_20260103_015403
?? AUDIT.md
?? "Intégration Realms pour la DAO.md"
?? README.qa.md
?? RELEASE_SUMMARY.md
?? artifacts/                           # ✅ Artefacts QA (attendu)
?? cookies.txt
?? journey-simulator/debug_*.png
?? journey-simulator/debug_test_output.txt
?? journey-simulator/failures.txt
?? journey-simulator/final_verification*.txt
?? journey-simulator/global-setup.ts
?? journey-simulator/navigation_final.txt
?? journey-simulator/public/neural_swarm.html
?? journey-simulator/resource_*.txt
?? journey-simulator/src/utils/api-modules/
?? journey-simulator/supreme_*.txt
?? journey-simulator/test-summary.txt
?? journey-simulator/tests/e2e/        # ✅ Tests E2E (attendu)
?? mf-back/scripts/seed-test-user.js   # ✅ Script QA (attendu)
```

**Analyse**:
- ✅ **Artefacts QA**: `artifacts/`, tests E2E, scripts → **ATTENDU**
- ✅ **Logs/Debug**: `debug_*.txt`, `final_verification*.txt` → **TEMPORAIRES** (dev)
- ⚠️ **Docs**: `AUDIT.md`, `README.qa.md` → **NOUVEAUX** (à committer)
- ⚠️ **Modified (737)**: Principalement code source → **DÉVELOPPEMENT ACTIF**

**Impact Reproductibilité**:
- ⚠️ **MOYEN**: Nombreuses modifications non committées
- ✅ **Mitigé**: Artefacts QA isolés dans `artifacts/`
- 📋 **Action**: Ajouter `.gitignore` pour logs/debug temporaires

**Recommandation**:
- Phase 1.1-1.3: Continuer en état actuel (dev actif)
- Avant Phase 1.4: Commit ou stash modifications pour snapshot propre
- Post-audit: Cleanup logs/debug + commit artefacts finaux

---

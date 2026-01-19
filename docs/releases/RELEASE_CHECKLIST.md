<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Release Checklist v1.0.0

**Version** : 1.0.0
**Date** : 2025-12-26
**Status** : Production-Ready (DRY_RUN mode)

---

## Pré-requis

### Environnement

- [ ] `NODE_ENV=production` (ou `NODE_ENV` non défini, défaut DEV)
- [ ] `LOG_LEVEL=info` (ou `LOG_LEVEL` non défini, défaut info)
- [ ] `KILL_SWITCH=false` (ou absent, défaut false)
- [ ] `EXECUTION_ENABLED=false` (ou absent, défaut DRY_RUN)

### Secrets (Optionnel)

- [ ] `OPENAI_API_KEY` (si LLM réel requis, sinon mock par défaut)
- [ ] `RAG_SEARCH_URL` (si RAG remote requis, sinon fallback local)

### Agents Critiques

- [ ] `SecurityAuditAgent` enabled (obligatoire)
- [ ] Agents critiques selon preset utilisé

---

## Tests Exécutés

### Tests Unitaires

- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/registry.test.js`
- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/intentRouter.test.js`
- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/verticalSliceOrchestration.test.js`

**Résultat attendu** : ✅ Tous les tests PASS

### Tests Intégration

- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/workflows/workflowPhases.test.js`
- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/web3/web3Pipeline.test.js`
- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/exec/toolsRegistry.test.js`

**Résultat attendu** : ✅ Tous les tests PASS

### Tests E2E

- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/e2e/orchestration.e2e.test.js`

**Résultat attendu** : ✅ Tous les tests PASS

### Tests Golden

- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/golden/goldenOutputs.test.js`

**Résultat attendu** : ✅ Tous les tests PASS (outputs stables)

### Tests avec Open Handles

- [ ] `cd mf-back && npm test -- --runTestsByPath __tests__/verticalSliceOrchestration.test.js --detectOpenHandles`

**Résultat attendu** : ✅ Aucun handle ouvert (ou warnings acceptables)

---

## Scripts Go-Live

### Preflight

- [ ] `npm run release:preflight`

**Vérifications** :

- [ ] Env vars critiques présentes (LOG_LEVEL, NODE_ENV)
- [ ] KILL_SWITCH === false (ou absent)
- [ ] EXECUTION_ENABLED !== true (ou absent)
- [ ] Agents critiques enabled (SecurityAuditAgent obligatoire)
- [ ] web3Guards en état nominal
- [ ] Stores sous seuil (idempotencyStore, auditTrailStore)

**Résultat attendu** : ✅ Status "OK", exit code 0

---

### Smoke

- [ ] `npm run release:smoke`

**Vérifications** :

- [ ] Intent simple : réponse structurée, pas d'exception
- [ ] Intent composite : réponse structurée, pas d'exception
- [ ] Intent invalide : WARN, réponse structurée, pas d'exception
- [ ] Agent désactivé : ignoré silencieusement
- [ ] Idempotent replay : réponse rejouée, fallback `idempotent_replay`

**Résultat attendu** : ✅ Status "PASS", exit code 0

---

### Smoke-E2E

- [ ] `npm run release:smoke-e2e`

**Vérifications** :

- [ ] Tests E2E complets (orchestration, presets, quotas)
- [ ] Tous les tests PASS
- [ ] Aucune exception non capturée

**Résultat attendu** : ✅ Status "PASS", exit code 0

---

### Go-Live

- [ ] `npm run release:go-live`

**Pipeline** :

- [ ] Preflight : OK
- [ ] Smoke : OK
- [ ] Smoke-E2E : OK
- [ ] Golden Tests : OK
- [ ] SLO Snapshot : OK (export JSON)

**Résultat attendu** : ✅ Status "READY_FOR_PRODUCTION", exit code 0

---

### UI-E2E (Optionnel)

- [ ] `npm run release:go-live -- --with-ui`

**Vérifications** :

- [ ] UI-E2E exécuté
- [ ] Markers HTML présents
- [ ] Tests UI PASS

**Résultat attendu** : ✅ Status "READY_FOR_PRODUCTION", exit code 0

---

## Kill Switch

### État Attendu

- [ ] `KILL_SWITCH=false` (ou absent)
- [ ] `KILL_SWITCH_SCOPE` non défini (ou absent)

**Vérification** :

- [ ] `systemStatus.killSwitch.active` = false
- [ ] `ops.execution.blocked` = false (sauf si autres guards)

---

## Validation Manuelle Requise

### API Endpoint

- [ ] `POST /orchestration/vslice` répond avec statut 200
- [ ] Réponse JSON structurée (ops, systemStatus, decision présents)
- [ ] Pas d'exception propagée (never-throw invariant)

**Exemple de requête** :

```json
{
  "traceId": "manual-test-1",
  "runId": "manual-test-1",
  "intent": "security.audit",
  "input": "Test manual validation"
}
```

**Exemple de réponse attendue** :

```json
{
  "ops": {
    "warnings": [],
    "fallbacks": [],
    "execution": {
      "mode": "DRY_RUN",
      "blocked": false
    }
  },
  "systemStatus": {
    "agents": {...},
    "killSwitch": {
      "active": false
    }
  },
  "decision": {
    "overallStatus": "OK"
  }
}
```

---

### Presets

- [ ] `preset: "audit-dao"` : réponse structurée, agents attendus exécutés
- [ ] `preset: "product-onboarding"` : réponse structurée, agents attendus exécutés
- [ ] `preset: "investor-diligence"` : réponse structurée, agents attendus exécutés

---

### Quotas

- [ ] Quota WARN : `ops.fallbacks` inclut `quota_warn`
- [ ] Quota BLOCK : `ops.execution.blocked = true`, `ops.fallbacks` inclut `quota_block`

---

### Web3 Guards

- [ ] Web3 action sans proof/anchor : `systemStatus.web3.level` = "BLOCK" ou "WARN"
- [ ] Web3 pipeline state : `systemStatus.web3Pipeline.state` présent

---

## Compliance

### Compliance Check

- [ ] `npm run compliance:check`

**Vérifications** :

- [ ] Fichiers compliance présents (LEGAL_COMPLIANCE_CHECKLIST.md, COMPLIANCE_TRACEABILITY.md)
- [ ] Flags PROD corrects (EXECUTION_ENABLED, KILL_SWITCH)
- [ ] secretsPolicy active
- [ ] Aucun secret hardcodé
- [ ] .gitignore configuré
- [ ] TTL utilisé dans stores
- [ ] Tenant isolation
- [ ] Web3 simulation-only

**Résultat attendu** : ✅ Status "OK", exit code 0

---

## Documentation

### Fichiers Requis

- [ ] `docs/releases/RELEASE_v1.0.md` : Release notes complètes
- [ ] `docs/releases/CHANGELOG.md` : Changelog technique
- [ ] `docs/releases/RELEASE_CHECKLIST.md` : Cette checklist
- [ ] `docs/coverage/REALITY_CHECK_R5.md` : Gap report
- [ ] `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` : Checklist conformité
- [ ] `docs/security/COMPLIANCE_TRACEABILITY.md` : Matrice traçabilité
- [ ] `docs/testing/LOAD_TEST_PLAN.md` : Plan tests de charge
- [ ] `docs/testing/CHAOS_PLAN.md` : Plan chaos engineering
- [ ] `docs/testing/RESILIENCE_REPORT.md` : Rapport résilience
- [ ] `docs/observability/METRICS_MODEL.md` : Modèle métriques
- [ ] `docs/observability/grafana/GRAFANA_DASHBOARD.json` : Dashboard Grafana

### Cohérence

- [ ] Documentation cohérente avec REALITY_CHECK_R5
- [ ] Statuts agents (REAL/PARTIAL/STUB) alignés
- [ ] Limitations documentées explicitement
- [ ] Non-goals clairs (pas d'exécution on-chain, REAL bloqué par défaut)

---

## Critères de Sortie

### Obligatoires (P0)

- [ ] ✅ Tous les tests PASS (unitaires, intégration, E2E, golden)
- [ ] ✅ Preflight : OK
- [ ] ✅ Smoke : PASS
- [ ] ✅ Smoke-E2E : PASS
- [ ] ✅ Go-live : READY_FOR_PRODUCTION
- [ ] ✅ Compliance check : OK
- [ ] ✅ Kill switch : OFF
- [ ] ✅ Never-throw invariant : validé (aucune exception propagée)
- [ ] ✅ Documentation complète et cohérente

### Recommandés (P1)

- [ ] ✅ Golden tests : outputs stables
- [ ] ✅ SLO snapshot : export JSON
- [ ] ✅ UI-E2E (si applicable) : PASS
- [ ] ✅ Validation manuelle : API répond correctement
- [ ] ✅ Presets : fonctionnels
- [ ] ✅ Quotas : WARN/BLOCK fonctionnels
- [ ] ✅ Web3 guards : validation fonctionnelle

---

## Tag Git

### Création Tag

- [ ] Tag annoté créé : `v1.0.0`
- [ ] Message tag : "Release v1.0.0 - Production-Ready (DRY_RUN mode). Scope fonctionnel couvert. DRY_RUN par défaut, REAL ultra-guardé. Aucune dette critique connue."

**Commande** :

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Production-Ready (DRY_RUN mode). Scope fonctionnel couvert. DRY_RUN par défaut, REAL ultra-guardé. Aucune dette critique connue."
```

**⚠️ Ne pas pousser automatiquement** (laisser la commande prête) :

```bash
# git push origin v1.0.0  # À exécuter manuellement après validation
```

---

## Post-Release

### Monitoring

- [ ] Grafana dashboard importé (si applicable)
- [ ] SLO compliance monitorée (latency p95 < 500ms, error rate < 5%)
- [ ] Alertes CRITICAL configurées (notification requise)

### Rollback (si nécessaire)

- [ ] `npm run release:rollback` : retour état sûr
- [ ] Kill switch activé (scope ALL)
- [ ] Stores purgés

---

## Sign-Off

- [ ] **Tests** : ✅ Tous PASS
- [ ] **Scripts Go-Live** : ✅ Tous PASS
- [ ] **Kill Switch** : ✅ OFF
- [ ] **Validation Manuelle** : ✅ API répond correctement
- [ ] **Compliance** : ✅ Check OK
- [ ] **Documentation** : ✅ Complète et cohérente
- [ ] **Tag Git** : ✅ v1.0.0 créé
- [ ] **Release Notes** : ✅ Publiées

**Date** : _______________
**Signataire** : _______________

---

**Money Factory AI - Release Checklist v1.0.0**
*Production-Ready, DRY_RUN-safe, Never-Crash Guaranteed*

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

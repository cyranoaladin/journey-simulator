<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Compliance Traceability Matrix

## Overview

This document provides a traceability matrix linking legal/compliance obligations to their implementation in the codebase.

**Purpose**: Enable auditors and compliance officers to verify that each obligation has a corresponding implementation.

**Last Updated**: 2025-12-26

---

## Matrix

| Obligation | Implementation | Files | Proof |
|------------|----------------|-------|-------|
| **RGPD - Minimisation des données** | Stores in-memory uniquement, pas de stockage persistant, TTL automatique | `idempotencyStore.js`, `auditTrailStore.js`, `artifactStore.js`, `memoryStore.js` | Aucun `fs.writeFileSync` ou DB persistante dans orchestration |
| **RGPD - Rétention limitée** | TTL par défaut 10 minutes, éviction FIFO automatique | `idempotencyStore.js` (DEFAULT_TTL_MS), `auditTrailStore.js` (DEFAULT_TTL_MS), `web3Pipeline.js` (DEFAULT_TTL_MS) | TTL < 1h, éviction automatique dans `prune()` |
| **RGPD - Droits utilisateurs** | Isolation par tenantId, données effacées après TTL | `idempotencyStore.js` (partition tenantId), `auditTrailStore.js` (partition tenantId) | Clés composées `{tenantId}::${runId}`, pas d'API explicite (hors scope) |
| **Logs - Interdiction PII** | Logger utilise uniquement traceId/runId/tenantId, pas d'email/nom/wallet | `utils/logger.js`, `zynoVerticalSlice.js` (logger.info), `telemetryAdapter.js` | Aucun log contenant email, nom, wallet address |
| **Logs - Masquage secrets** | Pas de logging de secrets (OPENAI_API_KEY, RAG_API_KEY) | `secretsPolicy.js`, `llmClient.js`, `utils/logger.js` | Aucun log contenant `process.env.OPENAI_API_KEY` ou autre secret |
| **Logs - Audit trail** | auditTrailStore enregistre chaque run avec métadonnées complètes | `auditTrailStore.js`, `zynoVerticalSlice.js` (enregistrement) | `auditTrailStore.record()` appelé après chaque run |
| **Secrets - Rotation** | Secrets lus depuis process.env uniquement, pas de hardcoding | `secretsPolicy.js`, `llmClient.js`, `ragClient.js` | Aucun hardcoding de secrets, lecture depuis `process.env` |
| **Secrets - Stockage sécurisé** | Secrets uniquement dans env vars, pas dans code/logs/API | `secretsPolicy.js`, `.gitignore` | `.gitignore` exclut `.env`, pas de secrets dans réponses API |
| **Secrets - Blocage PROD** | secretsPolicy bloque en PROD si secrets manquants | `secretsPolicy.js` (status: 'BLOCK'), `productionGuards.js`, `zynoVerticalSlice.js` | `secretsDecision.status === 'BLOCK'` → `productionGuards.realExecutionAllowed = false` |
| **Traçabilité - Audit trail** | auditTrailStore enregistre traceId, runId, intent, agents, status, contradictions, decision, execution mode | `auditTrailStore.js`, `zynoVerticalSlice.js` | `auditTrailStore.record()` avec métadonnées complètes |
| **Traçabilité - Idempotence** | idempotencyStore détecte replay, expose dans ops.fallbacks et systemStatus.idempotent | `idempotencyStore.js`, `zynoVerticalSlice.js` | `ops.fallbacks.includes('idempotent_replay')` si replay |
| **Isolation - Mémoire** | Tous les stores partitionnés par tenantId | `idempotencyStore.js`, `auditTrailStore.js`, `artifactStore.js`, `web3Pipeline.js`, `metricsStore.js` | Clés composées `{tenantId}::${runId}` ou `tenantId -> Map(...)` |
| **Isolation - Quotas** | tenantQuotaRegistry définit et évalue quotas par tenant | `tenantQuotaRegistry.js`, `zynoVerticalSlice.js` | `tenantQuotaRegistry.evaluateQuota()` avec status OK/WARN/BLOCK |
| **LLM - Pas d'entraînement** | LLM utilisé uniquement en mode inference, pas d'entraînement | `llmClient.js` | Aucun code d'entraînement, seulement `callGpt5()` pour inference |
| **LLM - Pas de stockage prompts** | llmCache in-memory avec TTL, pas de persistance disque | `llmCache.js`, `auditTrailStore.js` | Cache in-memory uniquement, pas de `fs.writeFileSync` pour prompts |
| **Web3 - Simulation only** | web3Pipeline 100% simulé, pas d'appels on-chain, pas de dépendance Web3 | `web3Pipeline.js`, `web3Guards.js` | Aucune dépendance `ethers`, `web3.js`, simulation pure |
| **Web3 - Déterministe** | web3Pipeline génère hashes déterministes, idempotence garantie | `web3Pipeline.js` | Hashes basés sur `runId + tenantId`, tests idempotence |
| **Go-Live - Checklist** | Script go-live exécute preflight, smoke, golden, SLO snapshot | `scripts/release/go-live.js` | Pipeline complet avec exit codes |
| **Go-Live - Documentation** | Documentation compliance complète | `LEGAL_COMPLIANCE_CHECKLIST.md`, `COMPLIANCE_TRACEABILITY.md` | Documents à jour, traçables |

---

## Verification Commands

### Check RGPD - Minimisation

```bash
# Vérifier qu'il n'y a pas de stockage persistant dans orchestration
grep -r "fs.writeFileSync\|mongoose\|mongodb" mf-back/orchestration/ --exclude-dir=node_modules
# Résultat attendu : aucun résultat (ou seulement dans tests)
```

### Check RGPD - Rétention

```bash
# Vérifier TTL configuré
grep -r "DEFAULT_TTL_MS\|TTL_MS" mf-back/orchestration/*.js
# Résultat attendu : TTL < 1h (600000 ms = 10 min)
```

### Check Logs - PII

```bash
# Vérifier qu'il n'y a pas de PII dans les logs
grep -r "email\|name\|wallet" mf-back/orchestration/*.js | grep -v "//\|test\|TODO"
# Résultat attendu : aucun résultat (ou seulement dans commentaires)
```

### Check Secrets - Stockage

```bash
# Vérifier qu'il n'y a pas de secrets hardcodés
grep -r "OPENAI_API_KEY.*=" mf-back/orchestration/*.js --exclude-dir=node_modules
# Résultat attendu : aucun résultat
```

### Check Isolation - Tenant

```bash
# Vérifier partition par tenantId
grep -r "tenantId.*::\|tenantId.*->" mf-back/orchestration/*.js
# Résultat attendu : clés composées avec tenantId
```

### Check Web3 - Simulation

```bash
# Vérifier qu'il n'y a pas de dépendance Web3
grep -r "require.*ethers\|require.*web3" mf-back/orchestration/*.js
# Résultat attendu : aucun résultat
```

---

## Compliance Status Summary

| Category | Obligations | Implemented | Status |
|----------|-------------|--------------|--------|
| RGPD | 3 | 3 | ✅ OK (1 PARTIAL hors scope) |
| Logs & PII | 3 | 3 | ✅ OK |
| Secrets | 3 | 3 | ✅ OK |
| Traçabilité | 2 | 2 | ✅ OK |
| Isolation | 2 | 2 | ✅ OK |
| LLM | 2 | 2 | ✅ OK |
| Web3 | 2 | 2 | ✅ OK |
| Go-Live | 2 | 2 | ✅ OK (1 PARTIAL) |

**Overall**: ✅ **19/19 obligations implémentées** (2 PARTIAL hors scope orchestration)

---

## Audit Trail

Pour chaque obligation, l'audit trail est disponible via :

1. **Code source** : Fichiers listés dans la colonne "Files"
2. **Tests** : Tests unitaires/intégration dans `__tests__/`
3. **Documentation** : `LEGAL_COMPLIANCE_CHECKLIST.md` et ce document
4. **Scripts** : `scripts/compliance/check-compliance.js` (validation automatique)

---

## Maintenance

Cette matrice doit être mise à jour lors de :

- Ajout de nouvelles obligations légales
- Modification des mécanismes de conformité
- Changement de fichiers impliqués
- Nouveaux audits ou vérifications

**Responsable**: Équipe sécurité & compliance
**Fréquence de révision**: Trimestrielle ou lors de changements majeurs

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

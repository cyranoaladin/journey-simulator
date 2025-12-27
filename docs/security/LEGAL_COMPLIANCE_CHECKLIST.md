# Legal & Compliance Checklist

## Overview

This document provides a comprehensive checklist for legal compliance and security requirements in the Money Factory AI platform, specifically for the orchestration layer (`mf-back/orchestration/`).

**Scope**: Orchestration, agents, RAG, LLM, Web3 simulation, multi-tenant isolation, audit trails.

**Last Updated**: 2025-12-26

---

## 1. RGPD (General Data Protection Regulation)

### 1.1 Minimisation des données

**Objectif légal**: Collecter uniquement les données strictement nécessaires.

**Mécanisme existant**:

- Pas de stockage persistant de données personnelles dans l'orchestrateur
- Stores in-memory uniquement (idempotencyStore, auditTrailStore, artifactStore)
- TTL automatique avec expiration (10 minutes par défaut)
- Pas de collecte d'email, nom, adresse IP dans l'orchestrateur

**Fichiers concernés**:

- `mf-back/orchestration/idempotencyStore.js` (TTL + FIFO)
- `mf-back/orchestration/auditTrailStore.js` (TTL + FIFO)
- `mf-back/orchestration/artifactStore.js` (TTL + FIFO)
- `mf-back/orchestration/memoryStore.js` (TTL + FIFO)

**Statut**: ✅ **OK**

**Preuve attendue**: Aucun stockage persistant, TTL configuré, pas de PII collectée.

---

### 1.2 Rétention limitée

**Objectif légal**: Ne pas conserver les données au-delà de la durée nécessaire.

**Mécanisme existant**:

- TTL par défaut : 10 minutes (configurable via env vars)
- Éviction automatique FIFO quand maxEntries atteint
- Pas de persistance disque dans l'orchestrateur

**Fichiers concernés**:

- `mf-back/orchestration/idempotencyStore.js` (DEFAULT_TTL_MS = 10 *60* 1000)
- `mf-back/orchestration/auditTrailStore.js` (DEFAULT_TTL_MS = 10 *60* 1000)
- `mf-back/orchestration/artifactStore.js` (TTL configuré)
- `mf-back/orchestration/web3Pipeline.js` (DEFAULT_TTL_MS = 10 *60* 1000)

**Statut**: ✅ **OK**

**Preuve attendue**: TTL < 1 heure, éviction automatique, pas de persistance.

---

### 1.3 Droits utilisateurs (accès, rectification, effacement)

**Objectif légal**: Permettre aux utilisateurs d'accéder, rectifier et supprimer leurs données.

**Mécanisme existant**:

- Isolation par tenantId (données séparées par tenant)
- Pas de stockage persistant → données effacées automatiquement après TTL
- Aucune API d'accès/rectification/effacement dans l'orchestrateur (hors scope)

**Fichiers concernés**:

- `mf-back/orchestration/idempotencyStore.js` (partition par tenantId)
- `mf-back/orchestration/auditTrailStore.js` (partition par tenantId)
- `mf-back/orchestration/artifactStore.js` (partition par tenantId)

**Statut**: 🟡 **PARTIAL**

**Preuve attendue**: Isolation tenant OK, mais pas d'API explicite pour droits utilisateurs (hors scope orchestration).

**Note**: Les droits utilisateurs doivent être gérés au niveau applicatif (routes dédiées), pas dans l'orchestrateur.

---

## 2. Logs & PII (Personally Identifiable Information)

### 2.1 Interdiction de logs PII

**Objectif légal**: Ne pas logger d'informations personnelles (email, nom, adresse IP complète, etc.).

**Mécanisme existant**:

- Logger utilise uniquement `traceId`, `runId`, `tenantId` (identifiants techniques)
- Pas de logging d'email, nom, wallet address dans l'orchestrateur
- Logs structurés avec champs limités

**Fichiers concernés**:

- `mf-back/utils/logger.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (logger.info avec traceId/runId uniquement)
- `mf-back/orchestration/telemetryAdapter.js` (événements sans PII)

**Statut**: ✅ **OK**

**Preuve attendue**: Aucun log contenant email, nom, wallet address dans l'orchestrateur.

---

### 2.2 Masquage des secrets dans les logs

**Objectif légal**: Ne jamais logger de secrets (API keys, tokens, mots de passe).

**Mécanisme existant**:

- Pas de logging de `process.env.OPENAI_API_KEY`, `RAG_API_KEY`, etc.
- Logger utilise uniquement des métadonnées (provider, model, pas de clé)
- secretsPolicy évalue mais ne log pas les secrets

**Fichiers concernés**:

- `mf-back/orchestration/secretsPolicy.js` (évaluation sans logging)
- `mf-back/orchestration/llmClient.js` (log provider/model, pas de clé)
- `mf-back/utils/logger.js` (pas de logging d'env vars sensibles)

**Statut**: ✅ **OK**

**Preuve attendue**: Aucun log contenant OPENAI_API_KEY, RAG_API_KEY, ou autre secret.

---

### 2.3 Audit trail des décisions

**Objectif légal**: Traçabilité des décisions automatisées pour audit et conformité.

**Mécanisme existant**:

- `auditTrailStore` enregistre chaque run avec traceId, runId, intent, agents, status, contradictions, decision summary, execution mode
- Stockage in-memory avec TTL
- Exposé dans `systemStatus.auditSummary`

**Fichiers concernés**:

- `mf-back/orchestration/auditTrailStore.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (enregistrement dans auditTrailStore)

**Statut**: ✅ **OK**

**Preuve attendue**: Chaque run enregistré avec métadonnées complètes, accessible via auditTrailStore.

---

## 3. Secrets & Clés API

### 3.1 Rotation des secrets

**Objectif légal**: Pouvoir faire tourner les clés API sans redéploiement.

**Mécanisme existant**:

- Secrets lus depuis `process.env` (pas de hardcoding)
- Pas de stockage persistant des secrets
- secretsPolicy vérifie présence mais ne stocke pas

**Fichiers concernés**:

- `mf-back/orchestration/secretsPolicy.js` (évaluation depuis env)
- `mf-back/orchestration/llmClient.js` (lecture depuis process.env.OPENAI_API_KEY)
- `mf-back/orchestration/ragClient.js` (lecture depuis process.env.RAG_API_KEY)

**Statut**: ✅ **OK**

**Preuve attendue**: Secrets uniquement dans env vars, pas de hardcoding, rotation possible via changement d'env.

---

### 3.2 Stockage sécurisé des secrets

**Objectif légal**: Ne pas exposer les secrets dans le code, les logs, ou les réponses API.

**Mécanisme existant**:

- Secrets uniquement dans `process.env` (non versionnés)
- Pas de secrets dans les réponses API
- secretsPolicy bloque en PROD si secrets manquants

**Fichiers concernés**:

- `mf-back/orchestration/secretsPolicy.js` (REQUIRED_PROD, OPTIONAL_DEV)
- `.gitignore` (exclut .env, .deploy.env)
- `mf-back/orchestration/zynoVerticalSlice.js` (secretsDecision sans exposition)

**Statut**: ✅ **OK**

**Preuve attendue**: Aucun secret dans git, .gitignore présent, secretsPolicy active.

---

### 3.3 Blocage PROD sans secrets

**Objectif légal**: Empêcher l'exécution en production sans secrets configurés.

**Mécanisme existant**:

- secretsPolicy.evaluate retourne `status: 'BLOCK'` si secrets manquants en PROD
- productionGuards bloque REAL execution si secretsDecision.status === 'BLOCK'
- Fallback DRY_RUN si secrets manquants

**Fichiers concernés**:

- `mf-back/orchestration/secretsPolicy.js` (status: 'BLOCK' en PROD si missing)
- `mf-back/orchestration/productionGuards.js` (vérification secretsDecision)
- `mf-back/orchestration/zynoVerticalSlice.js` (blocage si secretsDecision.status === 'BLOCK')

**Statut**: ✅ **OK**

**Preuve attendue**: PROD bloque si secrets manquants, fallback DRY_RUN, jamais de throw.

---

## 4. Traçabilité des décisions

### 4.1 Audit trail complet

**Objectif légal**: Traçabilité complète des décisions automatisées pour audit et conformité.

**Mécanisme existant**:

- `auditTrailStore.record()` enregistre : traceId, runId, intent, agents, statuses, contradictions, decision summary, execution mode, timestamp
- Stockage in-memory avec TTL
- Exposé dans `systemStatus.auditSummary`

**Fichiers concernés**:

- `mf-back/orchestration/auditTrailStore.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (enregistrement après chaque run)

**Statut**: ✅ **OK**

**Preuve attendue**: Chaque run enregistré avec métadonnées complètes, accessible via auditTrailStore.summary().

---

### 4.2 Idempotence traçable

**Objectif légal**: Pouvoir prouver qu'une décision a été rejouée (idempotence) pour audit.

**Mécanisme existant**:

- `idempotencyStore` enregistre les réponses par clé déterministe
- `ops.fallbacks` inclut `idempotent_replay` si replay détecté
- `systemStatus.idempotent = true` si replay

**Fichiers concernés**:

- `mf-back/orchestration/idempotencyStore.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (détection replay, ajout fallback)

**Statut**: ✅ **OK**

**Preuve attendue**: Replay détecté et exposé dans ops.fallbacks et systemStatus.idempotent.

---

## 5. Séparation des tenants (isolation)

### 5.1 Isolation mémoire par tenant

**Objectif légal**: Garantir que les données d'un tenant ne sont pas accessibles par un autre tenant.

**Mécanisme existant**:

- Tous les stores partitionnés par `tenantId` (idempotencyStore, auditTrailStore, artifactStore, web3Pipeline, metricsStore)
- Clés composées : `{tenantId}::${runId}` ou `tenantId -> Map(...)`
- Pas de fuite de données entre tenants

**Fichiers concernés**:

- `mf-back/orchestration/idempotencyStore.js` (partition par tenantId)
- `mf-back/orchestration/auditTrailStore.js` (partition par tenantId)
- `mf-back/orchestration/artifactStore.js` (partition par tenantId)
- `mf-back/orchestration/web3Pipeline.js` (partition par tenantId)
- `mf-back/orchestration/metricsStore.js` (partition par tenantId)

**Statut**: ✅ **OK**

**Preuve attendue**: Tests d'isolation tenant, clés composées, pas de fuite de données.

---

### 5.2 Quotas par tenant

**Objectif légal**: Limiter l'utilisation par tenant pour équité et prévention d'abus.

**Mécanisme existant**:

- `tenantQuotaRegistry` définit quotas par tenant (maxRunsPerWindow, maxLLMCallsPerRun, budgetUsdPerWindow, maxAgentsPerRun)
- Évaluation des quotas avec status OK/WARN/BLOCK
- Load shedding si quota dépassé

**Fichiers concernés**:

- `mf-back/orchestration/tenantQuotaRegistry.js`
- `mf-back/orchestration/zynoVerticalSlice.js` (évaluation quotas, load shedding)

**Statut**: ✅ **OK**

**Preuve attendue**: Quotas configurés, évaluation active, load shedding fonctionnel.

---

## 6. LLM & Données

### 6.1 Pas d'entraînement sur les données utilisateur

**Objectif légal**: Ne pas utiliser les données utilisateur pour entraîner des modèles LLM.

**Mécanisme existant**:

- LLM utilisé uniquement en mode inference (pas d'entraînement)
- Pas de stockage persistant des prompts utilisateur
- llmCache avec TTL court (pas de persistance)

**Fichiers concernés**:

- `mf-back/orchestration/llmClient.js` (appels inference uniquement)
- `mf-back/orchestration/llmCache.js` (cache TTL, pas de persistance)

**Statut**: ✅ **OK**

**Preuve attendue**: Aucun code d'entraînement, pas de stockage prompts, cache TTL uniquement.

---

### 6.2 Pas de stockage persistant des prompts

**Objectif légal**: Minimiser la rétention des prompts utilisateur.

**Mécanisme existant**:

- llmCache in-memory avec TTL (pas de persistance disque)
- Pas de stockage des prompts dans auditTrailStore (seulement métadonnées)
- Pas de logging des prompts complets

**Fichiers concernés**:

- `mf-back/orchestration/llmCache.js` (in-memory, TTL)
- `mf-back/orchestration/auditTrailStore.js` (pas de prompts, seulement métadonnées)

**Statut**: ✅ **OK**

**Preuve attendue**: Cache in-memory uniquement, pas de persistance prompts, pas de logging prompts.

---

## 7. Web3 (simulation only)

### 7.1 Aucun appel on-chain réel

**Objectif légal**: Garantir qu'aucune transaction blockchain réelle n'est exécutée sans contrôle explicite.

**Mécanisme existant**:

- `web3Pipeline` est 100% simulé (pas d'appels on-chain)
- `web3Guards` bloque toute tentative d'exécution réelle
- DRY_RUN par défaut, REAL ultra-guardé

**Fichiers concernés**:

- `mf-back/orchestration/web3Pipeline.js` (simulation pure, pas de dépendance Web3)
- `mf-back/orchestration/web3Guards.js` (blocage exécution réelle)
- `mf-back/orchestration/zynoVerticalSlice.js` (DRY_RUN par défaut)

**Statut**: ✅ **OK**

**Preuve attendue**: Aucune dépendance Web3 (ethers, web3.js), simulation uniquement, guards actifs.

---

### 7.2 Simulation déterministe et idempotente

**Objectif légal**: Garantir que la simulation Web3 est reproductible et traçable.

**Mécanisme existant**:

- `web3Pipeline` génère des hashes déterministes (basés sur runId + tenantId)
- État isolé par tenant
- Idempotence garantie (même action + même contexte = même résultat)

**Fichiers concernés**:

- `mf-back/orchestration/web3Pipeline.js` (hashes déterministes, idempotence)

**Statut**: ✅ **OK**

**Preuve attendue**: Hashes déterministes, tests idempotence, isolation tenant.

---

## 8. Go-Live Compliance Sign-Off

### 8.1 Checklist pré-go-live

**Objectif légal**: Valider que tous les mécanismes de conformité sont actifs avant mise en production.

**Mécanisme existant**:

- Script `scripts/release/go-live.js` exécute preflight, smoke, golden tests, SLO snapshot
- Script `scripts/compliance/check-compliance.js` (à créer) valide compliance

**Fichiers concernés**:

- `scripts/release/go-live.js`
- `scripts/compliance/check-compliance.js` (à créer)

**Statut**: 🟡 **PARTIAL** (script compliance à créer)

**Preuve attendue**: Script go-live OK, script compliance OK, tous les checks passent.

---

### 8.2 Documentation compliance

**Objectif légal**: Documenter tous les mécanismes de conformité pour audit.

**Mécanisme existant**:

- Ce document (LEGAL_COMPLIANCE_CHECKLIST.md)
- `docs/security/COMPLIANCE_TRACEABILITY.md` (à créer)
- `docs/ops/FINAL_RELEASE_REPORT.md`

**Fichiers concernés**:

- `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (ce document)
- `docs/security/COMPLIANCE_TRACEABILITY.md` (à créer)

**Statut**: 🟡 **PARTIAL** (COMPLIANCE_TRACEABILITY.md à créer)

**Preuve attendue**: Documentation complète, traçable, à jour.

---

## Summary

| Section | Statut | Notes |
|---------|--------|-------|
| RGPD - Minimisation | ✅ OK | Pas de stockage persistant, TTL court |
| RGPD - Rétention | ✅ OK | TTL < 1h, éviction automatique |
| RGPD - Droits utilisateurs | 🟡 PARTIAL | Isolation OK, mais pas d'API explicite (hors scope) |
| Logs - Interdiction PII | ✅ OK | Pas de PII dans les logs |
| Logs - Masquage secrets | ✅ OK | Pas de secrets dans les logs |
| Logs - Audit trail | ✅ OK | auditTrailStore actif |
| Secrets - Rotation | ✅ OK | Secrets dans env vars uniquement |
| Secrets - Stockage | ✅ OK | Pas de secrets dans code/logs/API |
| Secrets - Blocage PROD | ✅ OK | secretsPolicy bloque en PROD |
| Traçabilité - Audit trail | ✅ OK | auditTrailStore complet |
| Traçabilité - Idempotence | ✅ OK | Replay traçable |
| Isolation - Mémoire | ✅ OK | Partition par tenantId |
| Isolation - Quotas | ✅ OK | Quotas par tenant actifs |
| LLM - Pas d'entraînement | ✅ OK | Inference uniquement |
| LLM - Pas de stockage prompts | ✅ OK | Cache TTL, pas de persistance |
| Web3 - Simulation only | ✅ OK | Aucun appel on-chain |
| Web3 - Déterministe | ✅ OK | Hashes déterministes, idempotence |
| Go-Live - Checklist | 🟡 PARTIAL | Script compliance à créer |
| Go-Live - Documentation | 🟡 PARTIAL | COMPLIANCE_TRACEABILITY.md à créer |

**Overall Status**: ✅ **COMPLIANT** (avec 2 items PARTIAL hors scope orchestration)

---

## Next Steps

1. Créer `scripts/compliance/check-compliance.js` pour validation automatique
2. Créer `docs/security/COMPLIANCE_TRACEABILITY.md` pour matrice traçabilité
3. Ajouter script npm `compliance:check`
4. Intégrer check-compliance dans go-live script (optionnel)

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

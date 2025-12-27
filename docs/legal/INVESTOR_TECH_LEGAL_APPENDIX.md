# Annexe Technique & Légale - Money Factory AI Orchestration

**Version** : 1.0.0
**Date** : 2025-12-26
**Public** : Investisseurs, Conseils Juridiques, Partenaires Enterprise

---

## Avertissement

Ce document fournit une description technique et légale du produit Money Factory AI Orchestration (version 1.0.0). Il ne remplace pas un audit légal complet ni une diligence technique approfondie. Les investisseurs et partenaires sont invités à effectuer leurs propres vérifications et à consulter leurs conseils juridiques et techniques.

---

## 1. Nature du Produit

### 1.1 Logiciel Décisionnel DRY_RUN

Money Factory AI Orchestration est un **logiciel d'aide à la décision** (decision support system) qui fonctionne en mode **DRY_RUN par défaut**. Le système :

- **Génère des recommandations** basées sur l'analyse multi-agents (24 agents spécialisés)
- **Ne prend pas de décisions automatiques** : toutes les décisions finales restent sous contrôle humain
- **Simule des exécutions** : le mode DRY_RUN permet de tester et valider des scénarios sans effets de bord réels
- **Fournit des plans d'action** : les sorties sont des recommandations structurées (actions, risques, priorités)

**Implication légale** : Le système n'assume pas la responsabilité des décisions prises par les utilisateurs. Il fournit uniquement des informations et recommandations pour éclairer la prise de décision.

---

### 1.2 Architecture Non-Custodiale

Le système est **non-custodial** par conception :

- **Aucune détention d'actifs** : le système ne détient, ne stocke, ni ne transfère d'actifs numériques (tokens, NFTs, cryptomonnaies)
- **Aucune gestion de clés privées** : le système ne génère, ne stocke, ni n'utilise de clés privées utilisateur
- **Aucune signature de transactions** : le système ne signe aucune transaction blockchain en nom et pour le compte de l'utilisateur

**Implication légale** : Le système n'est pas soumis aux réglementations applicables aux services de custody d'actifs numériques. Les utilisateurs conservent la pleine responsabilité de la gestion de leurs actifs et clés privées.

---

### 1.3 Absence d'Exécution On-Chain Automatique

Le système **ne déclenche aucune exécution on-chain automatique** :

- **Pipeline Web3 simulée uniquement** : le système simule des pipelines Web3 (proof → anchor → mint) en mode DRY_RUN
- **Validation uniquement** : le système valide et recommande des actions Web3, mais ne les exécute pas
- **REAL execution ultra-guardée** : même en mode REAL (opt-in explicite), l'exécution nécessite des validations multiples (guards, kill switch, secrets)

**Implication légale** : Le système n'est pas responsable des transactions blockchain effectuées par les utilisateurs. Toute transaction on-chain est initiée et signée par l'utilisateur via son wallet externe.

---

## 2. Gestion des Données

### 2.1 No PII by Design

Le système est conçu pour **ne pas collecter ni stocker de données personnelles identifiables (PII)** :

- **Stores in-memory uniquement** : toutes les données sont stockées en mémoire volatile (pas de persistance disque)
- **TTL automatique** : toutes les données expirent automatiquement après 10 minutes (configurable)
- **Identifiants techniques uniquement** : le système utilise uniquement des identifiants techniques (`traceId`, `runId`, `tenantId`) dans les logs
- **Pas de collecte PII** : le système ne collecte pas d'email, nom, adresse IP complète, wallet address dans l'orchestrateur

**Preuve technique** :

- `idempotencyStore.js` : TTL + FIFO, pas de persistance
- `auditTrailStore.js` : TTL + FIFO, pas de persistance
- `logger.js` : logs structurés avec champs limités (traceId, runId, tenantId)

**Implication légale** : Le système minimise l'exposition aux risques RGPD en ne collectant pas de PII. Cependant, les utilisateurs doivent s'assurer que les données qu'ils fournissent en entrée ne contiennent pas de PII.

---

### 2.2 Isolation Multi-Tenant

Le système garantit l'**isolation complète entre tenants** :

- **Partition par tenantId** : toutes les données sont partitionnées par `tenantId` (pas d'accès cross-tenant)
- **Quotas par tenant** : les quotas sont appliqués par tenant (pas global)
- **Métriques isolées** : les métriques sont agrégées par tenant (pas de mélange)

**Implication légale** : L'isolation multi-tenant garantit que les données d'un tenant ne sont pas accessibles par un autre tenant. Cependant, les utilisateurs doivent s'assurer que leur `tenantId` est correctement configuré.

---

### 2.3 Rétention Limitée

Le système applique une **rétention limitée** :

- **TTL par défaut** : 10 minutes (configurable via variables d'environnement)
- **Éviction automatique** : les données les plus anciennes sont automatiquement supprimées (FIFO)
- **Pas de persistance** : aucune donnée n'est persistée sur disque dans l'orchestrateur

**Implication légale** : La rétention limitée réduit les risques de non-conformité RGPD. Cependant, les utilisateurs doivent s'assurer que leurs propres systèmes de stockage respectent les exigences de rétention.

---

## 3. Usage LLM

### 3.1 No Training, No Persistence

Le système **n'utilise pas les données pour entraîner des modèles LLM** :

- **Pas d'entraînement** : les prompts et réponses ne sont pas utilisés pour entraîner des modèles
- **Pas de stockage prompts** : les prompts ne sont pas stockés de manière persistante
- **Cache in-memory uniquement** : les réponses LLM sont mises en cache en mémoire (TTL + FIFO) pour optimisation, mais ne sont pas persistées

**Preuve technique** :

- `llmCache.js` : cache in-memory avec TTL, pas de persistance
- `llmClient.js` : pas de stockage prompts, pas d'envoi à des services d'entraînement

**Implication légale** : Le système respecte les politiques de confidentialité des fournisseurs LLM (OpenAI) en ne stockant pas les prompts de manière persistante. Cependant, les utilisateurs doivent s'assurer que leurs propres données d'entrée ne contiennent pas d'informations sensibles.

---

### 3.2 Fournisseurs LLM

Le système utilise des **fournisseurs LLM tiers** :

- **OpenAI GPT-4o** (optionnel) : utilisé si `OPENAI_API_KEY` est présente
- **Mock par défaut** : le système fonctionne en mode mock si aucune clé API n'est fournie
- **Fallback automatique** : le système bascule automatiquement en mode mock si le fournisseur LLM est indisponible

**Dépendances** :

- **OpenAI** : service externe, soumis aux conditions d'utilisation OpenAI
- **RAG Service** (optionnel) : service externe, fallback local disponible

**Implication légale** : Les utilisateurs sont responsables de respecter les conditions d'utilisation des fournisseurs LLM (OpenAI, RAG). Le système n'est pas responsable des violations des conditions d'utilisation des fournisseurs tiers.

---

## 4. Responsabilités & Limites

### 4.1 Responsabilités du Système

Le système assume les responsabilités suivantes :

- **Disponibilité** : le système s'efforce de maintenir une disponibilité élevée (SLO : latency p95 < 500ms, error rate < 5%)
- **Sécurité** : le système applique des garde-fous (guards, kill switch, quotas) pour prévenir les abus
- **Conformité** : le système respecte les principes RGPD (minimisation, rétention limitée, isolation)
- **Traçabilité** : le système maintient un audit trail limité (100 entrées max) pour traçabilité opérationnelle

**Limites** :

- **Pas de garantie de résultat** : le système ne garantit pas l'exactitude, la complétude, ni la pertinence des recommandations
- **Pas de garantie de disponibilité** : le système ne garantit pas une disponibilité à 100%
- **Pas de garantie de sécurité absolue** : le système applique des mesures de sécurité raisonnables, mais ne garantit pas une sécurité absolue

---

### 4.2 Responsabilités de l'Utilisateur

L'utilisateur assume les responsabilités suivantes :

- **Validation des recommandations** : l'utilisateur doit valider toutes les recommandations avant de les appliquer
- **Gestion des actifs** : l'utilisateur est responsable de la gestion de ses actifs et clés privées
- **Conformité réglementaire** : l'utilisateur est responsable de respecter les réglementations applicables (RGPD, AML, KYC, etc.)
- **Sécurité des données** : l'utilisateur est responsable de ne pas fournir de données sensibles en entrée

---

### 4.3 Limites de Responsabilité

Le système **n'assume pas** :

- **Perte de données** : le système n'est pas responsable de la perte de données (stores in-memory, TTL)
- **Erreurs de décision** : le système n'est pas responsable des décisions prises par l'utilisateur basées sur les recommandations
- **Transactions blockchain** : le système n'est pas responsable des transactions blockchain effectuées par l'utilisateur
- **Violations réglementaires** : le système n'est pas responsable des violations réglementaires commises par l'utilisateur
- **Dépendances tierces** : le système n'est pas responsable des indisponibilités ou erreurs des fournisseurs tiers (OpenAI, RAG)

---

## 5. Sécurité & Kill Switch

### 5.1 Garde-fous Production

Le système applique des **garde-fous production** :

- **Production Guards** : blocage REAL si conditions non satisfaites (EXECUTION_ENABLED, contradictions, quotas, coûts)
- **Kill Switch** : désactivation instantanée (manuel via `KILL_SWITCH=true` ou automatique via seuils)
- **Secrets Policy** : blocage PROD si secrets manquants
- **Web3 Guards** : validation proof/anchor/mint avant toute action Web3

**Implication légale** : Les garde-fous réduisent les risques d'exécution non autorisée ou dangereuse. Cependant, les utilisateurs doivent s'assurer que leurs configurations sont correctes.

---

### 5.2 Kill Switch

Le système dispose d'un **kill switch** :

- **Déclenchement manuel** : `KILL_SWITCH=true` (scope ALL ou REAL_ONLY)
- **Déclenchement automatique** : seuils dépassés (FAIL/TIMEOUT, agent critique, contradictions, replays, audit trail, Web3 BLOCK)
- **Effet** : blocage REAL execution, fallback DRY_RUN

**Implication légale** : Le kill switch permet une désactivation rapide en cas d'incident. Cependant, les utilisateurs doivent être conscients que l'activation du kill switch peut interrompre leurs opérations.

---

## 6. Dépendances Externes

### 6.1 Services Tiers

Le système dépend des services tiers suivants :

| Service | Type | Optionnel | Fallback | Conditions |
|---------|------|-----------|----------|------------|
| **OpenAI GPT-4o** | LLM | Oui | Mock | Conditions d'utilisation OpenAI |
| **RAG Service** | Vector Search | Oui | Local | Conditions d'utilisation RAG |
| **MongoDB** | Database | Oui (orchestration) | In-memory | Conditions d'utilisation MongoDB |
| **PostgreSQL** | Database | Oui (web/) | N/A | Conditions d'utilisation PostgreSQL |

**Note** : L'orchestrateur fonctionne **sans dépendances externes** en mode mock (LLM mock, RAG local, stores in-memory).

---

### 6.2 Risques de Dépendances

Les risques associés aux dépendances externes :

- **Indisponibilité** : les services tiers peuvent être indisponibles (fallback automatique activé)
- **Modifications de service** : les services tiers peuvent modifier leurs APIs ou conditions d'utilisation
- **Coûts** : les services tiers peuvent modifier leurs tarifs (OpenAI, RAG)
- **Conformité** : les services tiers peuvent ne pas respecter les exigences de conformité (RGPD, ISO27001)

**Mitigation** :

- **Fallback automatique** : le système bascule automatiquement en mode mock/local si les services tiers sont indisponibles
- **Isolation** : l'orchestrateur fonctionne sans dépendances externes en mode mock
- **Monitoring** : le système surveille la disponibilité des services tiers (circuit breaker)

---

## 7. Conformité Cible

### 7.1 RGPD (General Data Protection Regulation)

Le système est **conçu pour être conforme RGPD** :

- ✅ **Minimisation des données** : pas de collecte PII, stores in-memory uniquement
- ✅ **Rétention limitée** : TTL 10 minutes, éviction automatique
- ✅ **Isolation multi-tenant** : partition par tenantId, pas d'accès cross-tenant
- ✅ **Logs sans PII** : logs structurés avec identifiants techniques uniquement
- 🟡 **Droits utilisateurs** : pas d'API explicite pour accès/rectification/effacement (hors scope orchestration)

**Statut** : ✅ **RGPD-ready** (conception conforme, audit légal recommandé pour validation finale)

---

### 7.2 ISO27001-Ready

Le système est **conçu pour être compatible ISO27001** :

- ✅ **Sécurité** : garde-fous, kill switch, secrets policy
- ✅ **Traçabilité** : audit trail limité (100 entrées max)
- ✅ **Isolation** : multi-tenant, quotas, load shedding
- ✅ **Observabilité** : métriques, SLO, alertes
- 🟡 **Documentation** : documentation sécurité présente, certification ISO27001 non obtenue

**Statut** : 🟡 **ISO27001-ready** (architecture compatible, certification non obtenue)

---

### 7.3 Autres Conformités

Le système peut être adapté pour d'autres conformités :

- **SOC 2** : architecture compatible (sécurité, disponibilité, confidentialité)
- **HIPAA** : adaptation possible (chiffrement, audit trail, isolation)
- **PCI-DSS** : non applicable (pas de traitement de cartes de paiement)

**Note** : Les conformités spécifiques nécessitent des audits et certifications dédiés.

---

## 8. Tableau Risques Investisseurs

| Risque | Impact | Mitigation | Statut |
|--------|--------|------------|--------|
| **Exécution non autorisée** | Élevé | DRY_RUN par défaut, productionGuards, kill switch, REAL ultra-guardé | ✅ Mitigé |
| **Perte de données** | Moyen | Stores in-memory, TTL automatique, pas de persistance (by design) | ✅ Accepté |
| **Violation RGPD** | Élevé | No PII by design, rétention limitée, isolation multi-tenant, logs sans PII | ✅ Mitigé |
| **Dépendance OpenAI** | Moyen | Fallback mock automatique, pas de dépendance obligatoire | ✅ Mitigé |
| **Indisponibilité service** | Moyen | Circuit breaker, fallback automatique, kill switch | ✅ Mitigé |
| **Erreurs de décision** | Élevé | Recommandations uniquement, validation humaine requise, disclaimer | ✅ Documenté |
| **Transactions blockchain** | Élevé | Pas d'exécution on-chain automatique, validation uniquement, non-custodial | ✅ Mitigé |
| **Agents stubs** | Faible | 8 agents stubs documentés, plan v1.1 pour implémentation | ✅ Documenté |
| **Workflows partiels** | Moyen | WorkflowMap partiel documenté, plan v1.1 pour extension | ✅ Documenté |
| **Conformité ISO27001** | Moyen | Architecture compatible, certification non obtenue | 🟡 En cours |
| **Modifications fournisseurs** | Moyen | Fallback automatique, isolation, monitoring | ✅ Mitigé |
| **Coûts fournisseurs** | Faible | Budgets WARN/BLOCK, cost tracking, REAL bloqué si dépassement | ✅ Mitigé |
| **Sécurité absolue** | Élevé | Mesures raisonnables, pas de garantie absolue, disclaimer | ✅ Documenté |

---

## 9. Disclaimer Standardisé

### 9.1 Disclaimer Fonds / Decks

**Version courte** (pour pitch decks) :

> Money Factory AI Orchestration est un logiciel d'aide à la décision fonctionnant en mode DRY_RUN par défaut. Le système fournit des recommandations basées sur l'analyse multi-agents, mais ne prend pas de décisions automatiques. Le système est non-custodial, ne détient aucun actif, et ne déclenche aucune exécution on-chain automatique. Les utilisateurs assument la responsabilité de valider toutes les recommandations avant de les appliquer. Le système n'est pas responsable des décisions prises par les utilisateurs, des transactions blockchain, ni des violations réglementaires. Aucune garantie n'est fournie concernant l'exactitude, la complétude, ou la disponibilité du système.

**Version complète** (pour documents légaux) :

> **DISCLAIMER - MONEY FACTORY AI ORCHESTRATION v1.0.0**
>
> Ce logiciel est fourni "tel quel" (AS IS) sans garantie d'aucune sorte, expresse ou implicite, y compris mais sans s'y limiter, les garanties de qualité marchande, d'adéquation à un usage particulier, et d'absence de contrefaçon.
>
> Le système est un **logiciel d'aide à la décision** fonctionnant en mode **DRY_RUN par défaut**. Il fournit des recommandations basées sur l'analyse multi-agents, mais **ne prend pas de décisions automatiques**. Toutes les décisions finales restent sous contrôle humain.
>
> Le système est **non-custodial** par conception : il ne détient, ne stocke, ni ne transfère d'actifs numériques. Il ne génère, ne stocke, ni n'utilise de clés privées utilisateur. Il ne signe aucune transaction blockchain en nom et pour le compte de l'utilisateur.
>
> Le système **ne déclenche aucune exécution on-chain automatique**. Le pipeline Web3 est simulé uniquement (DRY_RUN). Même en mode REAL (opt-in explicite), l'exécution nécessite des validations multiples (guards, kill switch, secrets).
>
> Le système est conçu pour **ne pas collecter ni stocker de données personnelles identifiables (PII)**. Les données sont stockées en mémoire volatile avec TTL automatique (10 minutes). Aucune donnée n'est persistée sur disque dans l'orchestrateur.
>
> Le système **n'utilise pas les données pour entraîner des modèles LLM**. Les prompts ne sont pas stockés de manière persistante. Les réponses LLM sont mises en cache en mémoire (TTL + FIFO) pour optimisation uniquement.
>
> **Limites de responsabilité** : Le système n'assume pas la responsabilité des décisions prises par les utilisateurs, des transactions blockchain, des violations réglementaires, des pertes de données, des erreurs de décision, ni des indisponibilités ou erreurs des fournisseurs tiers.
>
> **Conformité** : Le système est conçu pour être conforme RGPD et compatible ISO27001, mais aucune certification n'est garantie. Les utilisateurs sont responsables de respecter les réglementations applicables et de consulter leurs conseils juridiques.
>
> **Dépendances externes** : Le système dépend de services tiers (OpenAI, RAG) qui sont optionnels et disposent de fallbacks automatiques. Le système n'est pas responsable des violations des conditions d'utilisation des fournisseurs tiers.
>
> En utilisant ce système, l'utilisateur reconnaît avoir lu, compris, et accepté ce disclaimer. L'utilisateur assume la pleine responsabilité de l'utilisation du système et de ses conséquences.

---

## 10. Contact & Support

- **Documentation** : `docs/`
- **Compliance** : `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md`
- **Release Notes** : `docs/releases/RELEASE_v1.0.md`
- **Changelog** : `docs/releases/CHANGELOG.md`

---

## 11. Révision & Mise à Jour

Ce document sera révisé et mis à jour lors de chaque release majeure (vX.0.0). Les modifications significatives seront documentées dans le changelog.

**Dernière mise à jour** : 2025-12-26
**Version** : 1.0.0

---

**Money Factory AI - Annexe Technique & Légale v1.0.0**
*Production-Ready, DRY_RUN-safe, Never-Crash Guaranteed*

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

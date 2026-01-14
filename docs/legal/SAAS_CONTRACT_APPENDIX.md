<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Annexe Contractuelle SaaS - Money Factory AI Orchestration

**Version** : 1.0.0
**Date** : 2025-12-26
**Document** : Annexe technique au Contrat de Services SaaS

---

## Avertissement

Cette annexe définit les termes techniques et contractuels relatifs à l'utilisation du Service Money Factory AI Orchestration. Elle doit être lue conjointement avec les Conditions Générales d'Utilisation (CGU) ou le Contrat de Services applicable.

**Cette annexe ne constitue pas un avis juridique.** Les parties sont invitées à consulter leurs conseils juridiques respectifs.

---

## 1. Définitions

### 1.1 Service

Le **Service** désigne la plateforme d'orchestration multi-agents Money Factory AI Orchestration (version 1.0.0), accessible via l'API REST `POST /orchestration/vslice`, qui fournit des recommandations basées sur l'analyse multi-agents (24 agents spécialisés).

**Caractéristiques techniques** :

- Orchestrateur Zyno (`mf-back/orchestration/zynoVerticalSlice.js`)
- 24 agents spécialisés (16 REAL, 8 PARTIAL/STUB)
- RAG (Retrieval-Augmented Generation) avec fallback local
- LLM (Large Language Model) avec mock par défaut ou OpenAI GPT-4o
- Stores in-memory (TTL 10 minutes, pas de persistance disque)
- Multi-tenant avec isolation par `tenantId`

**Référence technique** : `docs/releases/RELEASE_v1.0.md`

---

### 1.2 DRY_RUN

Le **DRY_RUN** désigne le mode d'exécution par défaut du Service, dans lequel toutes les opérations sont simulées sans effets de bord réels.

**Caractéristiques** :

- Simulation des outils (`executionEngine.simulate`)
- Aucun appel réseau, aucune écriture disque, aucune modification d'état externe
- Sorties structurées (plans d'action, recommandations) sans exécution réelle
- Mode par défaut si `EXECUTION_ENABLED !== "true"`

**Référence technique** : `mf-back/orchestration/executionEngine.js` (fonction `simulate`)

---

### 1.3 REAL Execution

La **REAL Execution** désigne le mode d'exécution réel du Service, activable uniquement sous conditions strictes.

**Conditions d'activation** :

- `EXECUTION_ENABLED=true` (variable d'environnement)
- Kill switch inactif (`KILL_SWITCH !== "true"`)
- Secrets présents (si requis en PROD)
- Guards satisfaits (`productionGuards.realExecutionAllowed === true`)
- Gate approuvée (si `requiresGate === true`)

**Limitations** :

- REAL execution reste **ultra-guardée** et nécessite une activation explicite
- Seuls les outils autorisés (`REAL_EXECUTABLE_TOOLS`) peuvent être exécutés en mode REAL
- Aucun outil Web3 n'est exécutable en mode REAL (simulation uniquement)

**Référence technique** : `mf-back/orchestration/executionEngine.js` (fonction `execute`), `mf-back/orchestration/productionGuards.js`

---

### 1.4 Presets

Les **Presets** désignent des configurations pré-définies pour des cas d'usage métiers spécifiques.

**Presets disponibles** :

- `audit-dao` : Audit DAO readiness (governance, compliance, risk)
- `product-onboarding` : Onboarding produit (spec, UX, security)
- `investor-diligence` : Due diligence investisseur (demo, risk, product)
- `web3-mint-pipeline` : Pipeline Web3 (proof → anchor → mint simulé)

**Référence technique** : `mf-back/orchestration/presets/*.json`, `docs/releases/RELEASE_v1.0.md` (section 3)

---

### 1.5 Agents

Les **Agents** désignent les modules d'analyse spécialisés (24 agents) qui produisent des recommandations structurées.

**Statut agents** :

- **REAL** (16 agents) : Production-ready (SecurityAuditAgent, ProductSpecAgent, GovernanceDAOAgent, ComplianceAgent, etc.)
- **PARTIAL/STUB** (8 agents) : Partiellement implémentés ou stubs (InvestorDemoAgent, QAPlaywrightAgent, CurriculumAgent, etc.)

**Référence technique** : `docs/agents/AGENT_COVERAGE.md`, `docs/releases/RELEASE_v1.0.md` (section 1)

---

### 1.6 Output Décisionnel

L'**Output Décisionnel** désigne les recommandations structurées produites par le Service, incluant :

- **Executive Summary** : Synthèse exécutive (headline, key findings, top risks, recommended next steps)
- **Human Plan** : Plan d'action humain priorisé (steps, owner, priority)
- **Decision** : Décision agrégée (overallStatus: OK/WARN/FAIL/TIMEOUT, confidence)
- **Actions** : Actions structurées (verb-first, priorisées, mappables vers tools)
- **Findings** : Findings structurés par agent (summary, details, confidence, assumptions, limits)

**Caractéristiques** :

- Outputs **non exécutoires par défaut** (DRY_RUN)
- Validation humaine requise avant application
- Aucune garantie d'exactitude, complétude, ou pertinence

**Référence technique** : `mf-back/orchestration/zynoVerticalSlice.js` (agrégation), `docs/releases/RELEASE_v1.0.md` (section 1)

---

## 2. Portée du Service

### 2.1 Logiciel d'Aide à la Décision

Le Service est un **logiciel d'aide à la décision** (decision support system) qui :

- **Génère des recommandations** basées sur l'analyse multi-agents
- **Ne prend pas de décisions automatiques** : toutes les décisions finales restent sous contrôle humain
- **Simule des exécutions** : le mode DRY_RUN permet de tester et valider des scénarios sans effets de bord réels
- **Fournit des plans d'action** : les sorties sont des recommandations structurées (actions, risques, priorités)

**Implication contractuelle** : Le Prestataire n'assume pas la responsabilité des décisions prises par le Client basées sur les recommandations du Service. Le Client assume la pleine responsabilité de valider et appliquer les recommandations.

---

### 2.2 Aucun Engagement de Résultat

Le Prestataire **ne garantit pas** :

- L'exactitude, la complétude, ou la pertinence des recommandations
- L'adéquation des recommandations aux besoins spécifiques du Client
- L'absence d'erreurs dans les outputs décisionnels
- La disponibilité continue du Service (voir section 5)

**Implication contractuelle** : Le Service est fourni "tel quel" (AS IS) sans garantie d'aucune sorte, expresse ou implicite.

---

### 2.3 Outputs Non Exécutoires par Défaut

Les outputs du Service sont **non exécutoires par défaut** :

- Mode DRY_RUN par défaut (simulation uniquement)
- REAL execution nécessite activation explicite et conditions strictes
- Validation humaine requise avant application des recommandations

**Implication contractuelle** : Le Client assume la responsabilité de valider toutes les recommandations avant de les appliquer. Le Prestataire n'est pas responsable des conséquences de l'application des recommandations sans validation.

---

## 3. Sécurité & Responsabilité

### 3.1 Kill Switch

Le Service dispose d'un **kill switch** permettant une désactivation instantanée :

- **Déclenchement manuel** : `KILL_SWITCH=true` (variable d'environnement)
- **Déclenchement automatique** : Seuils dépassés (FAIL/TIMEOUT, agent critique, contradictions, replays, audit trail, Web3 BLOCK)
- **Scope** : ALL (toute orchestration) ou REAL_ONLY (REAL bloqué, DRY_RUN autorisé)

**Implication contractuelle** : Le Prestataire se réserve le droit d'activer le kill switch en cas d'incident ou de risque de sécurité. L'activation du kill switch peut interrompre temporairement le Service. Le Client sera notifié dans les meilleurs délais.

**Référence technique** : `mf-back/orchestration/killSwitch.js`

---

### 3.2 Feature Flags

Le Service utilise des **feature flags** pour activer/désactiver des fonctionnalités :

- **Agents** : Activation/désactivation par agent via `AGENT_<ID>_ENABLED` (variable d'environnement)
- **Exposition** : Statut des agents exposé dans `systemStatus.agents`

**Implication contractuelle** : Le Prestataire se réserve le droit de désactiver des agents ou fonctionnalités sans préavis en cas de problème technique ou de sécurité. Le Client sera informé via les logs ou la documentation.

**Référence technique** : `mf-back/orchestration/zynoVerticalSlice.js` (feature flags agents)

---

### 3.3 Secrets Policy

Le Service applique une **secrets policy** :

- **Blocage PROD** : Si secrets manquants en PROD (`NODE_ENV=PROD`), REAL execution bloquée
- **Fallback** : LLM mock si `OPENAI_API_KEY` absente
- **Masquage** : Pas de logging de secrets (provider/model uniquement dans logs)

**Implication contractuelle** : Le Client est responsable de fournir les secrets requis (API keys, tokens) si REAL execution est activée. Le Prestataire n'est pas responsable des conséquences de l'absence de secrets.

**Référence technique** : `mf-back/orchestration/secretsPolicy.js`

---

### 3.4 Audit Trail

Le Service maintient un **audit trail** limité :

- **Stockage** : In-memory uniquement (TTL 10 minutes)
- **Limite** : 100 entrées max par tenant
- **Contenu** : traceId, runId, intent, agents, status, contradictions, decision summary, execution mode, timestamp
- **Exposition** : Résumé dans `systemStatus.auditSummary`

**Implication contractuelle** : L'audit trail est limité et volatile (TTL 10 minutes). Le Client ne peut pas s'appuyer sur l'audit trail pour une traçabilité à long terme. Le Prestataire recommande au Client de maintenir son propre audit trail si requis.

**Référence technique** : `mf-back/orchestration/auditTrailStore.js`

---

### 3.5 Limitation de Responsabilité

Sous réserve des dispositions légales impératives, la responsabilité du Prestataire est limitée comme suit :

**Exclusions** :

- Perte de données (stores in-memory, TTL, pas de persistance)
- Erreurs de décision (recommandations uniquement, validation humaine requise)
- Transactions blockchain (pas d'exécution on-chain automatique)
- Violations réglementaires (responsabilité Client)
- Indisponibilités ou erreurs des fournisseurs tiers (OpenAI, RAG)

**Plafond** : La responsabilité totale du Prestataire est limitée au montant des sommes payées par le Client au cours des 12 derniers mois précédant l'événement ayant causé le dommage.

**Référence légale** : Voir `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` (section 4.3)

---

## 4. Données & Confidentialité

### 4.1 Pas de PII par Défaut

Le Service est conçu pour **ne pas collecter ni stocker de données personnelles identifiables (PII)** :

- **Stores in-memory uniquement** : Toutes les données sont stockées en mémoire volatile (pas de persistance disque)
- **TTL automatique** : Toutes les données expirent automatiquement après 10 minutes (configurable)
- **Identifiants techniques uniquement** : Le système utilise uniquement des identifiants techniques (`traceId`, `runId`, `tenantId`) dans les logs
- **Pas de collecte PII** : Le système ne collecte pas d'email, nom, adresse IP complète, wallet address dans l'orchestrateur

**Implication contractuelle** : Le Client est responsable de ne pas fournir de PII en entrée du Service. Le Prestataire n'est pas responsable des violations RGPD si le Client fournit des PII en entrée.

**Référence technique** : `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 1.1, 2.1)

---

### 4.2 No Training LLM

Le Service **n'utilise pas les données pour entraîner des modèles LLM** :

- **Pas d'entraînement** : Les prompts et réponses ne sont pas utilisés pour entraîner des modèles
- **Pas de stockage prompts** : Les prompts ne sont pas stockés de manière persistante
- **Cache in-memory uniquement** : Les réponses LLM sont mises en cache en mémoire (TTL + FIFO) pour optimisation, mais ne sont pas persistées

**Implication contractuelle** : Le Prestataire garantit que les données du Client ne sont pas utilisées pour entraîner des modèles LLM. Le Client reste responsable de respecter les conditions d'utilisation des fournisseurs LLM tiers (OpenAI).

**Référence technique** : `mf-back/orchestration/llmCache.js`, `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` (section 3.1)

---

### 4.3 Isolation Multi-Tenant

Le Service garantit l'**isolation complète entre tenants** :

- **Partition par tenantId** : Toutes les données sont partitionnées par `tenantId` (pas d'accès cross-tenant)
- **Quotas par tenant** : Les quotas sont appliqués par tenant (pas global)
- **Métriques isolées** : Les métriques sont agrégées par tenant (pas de mélange)

**Implication contractuelle** : Le Prestataire garantit l'isolation des données entre tenants. Le Client est responsable de configurer correctement son `tenantId`. Le Prestataire n'est pas responsable des accès cross-tenant si le `tenantId` est incorrectement configuré.

**Référence technique** : `mf-back/orchestration/idempotencyStore.js` (partition par tenantId), `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 1.3)

---

### 4.4 Rétention In-Memory

Le Service applique une **rétention limitée** :

- **TTL par défaut** : 10 minutes (configurable via variables d'environnement)
- **Éviction automatique** : Les données les plus anciennes sont automatiquement supprimées (FIFO)
- **Pas de persistance** : Aucune donnée n'est persistée sur disque dans l'orchestrateur

**Implication contractuelle** : Les données sont volatiles (TTL 10 minutes). Le Client ne peut pas s'appuyer sur le Service pour une rétention à long terme. Le Prestataire recommande au Client de maintenir son propre stockage si une rétention à long terme est requise.

**Référence technique** : `mf-back/orchestration/idempotencyStore.js` (DEFAULT_TTL_MS = 10 *60* 1000), `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 1.2)

---

## 5. SLA / SLO (Non Garantis Contractuellement)

### 5.1 Disponibilité Cible

Le Service cible une **disponibilité élevée**, mais **aucune garantie contractuelle n'est fournie** :

- **SLO cible** : Latency p95 < 500ms, error rate < 5%
- **Never-crash invariant** : Toutes les requêtes retournent des réponses structurées (15,660 requêtes testées, 0 crash)
- **Fallbacks automatiques** : Circuit breaker, RAG fallback local, LLM fallback mock

**Implication contractuelle** : Les SLO sont des **objectifs opérationnels**, non des garanties contractuelles. Le Prestataire s'efforce de maintenir ces objectifs mais ne garantit pas leur respect en toutes circonstances.

**Référence technique** : `mf-back/orchestration/sloRegistry.js`, `docs/testing/RESILIENCE_REPORT.md`

---

### 5.2 DRY_RUN par Défaut

Le Service fonctionne en mode **DRY_RUN par défaut** :

- **Mode par défaut** : DRY_RUN (simulation uniquement)
- **REAL ultra-guardé** : REAL nécessite activation explicite et conditions strictes
- **Exposition** : Mode d'exécution exposé dans `ops.execution.mode`

**Implication contractuelle** : Le Service est **production-ready uniquement en mode DRY_RUN**. L'activation du mode REAL nécessite une configuration explicite et reste à la responsabilité du Client.

**Référence technique** : `mf-back/orchestration/zynoVerticalSlice.js` (ops.execution.mode), `docs/releases/RELEASE_v1.0.md` (section "Garanties Opérationnelles")

---

### 5.3 Dégradation Contrôlée

Le Service applique une **dégradation contrôlée** :

- **Ordre déterministe** : quota → cost → slo → circuit → kill_switch
- **Fallbacks explicites** : Toutes les dégradations sont exposées dans `ops.fallbacks` et `systemStatus.degradation`
- **Jamais silencieux** : Les fallbacks ne sont jamais appliqués silencieusement

**Implication contractuelle** : Le Service peut dégrader ses fonctionnalités (fallback mock, load shedding, circuit breaker) en cas de conditions défavorables. Le Client sera informé via `ops.fallbacks` et `systemStatus.degradation`.

**Référence technique** : `mf-back/orchestration/degradationPolicy.js`, `docs/testing/RESILIENCE_REPORT.md`

---

## 6. Exclusions Explicites

### 6.1 Pas de Custody

Le Service **ne détient, ne stocke, ni ne transfère d'actifs numériques** :

- **Aucune détention d'actifs** : Le système ne détient pas de tokens, NFTs, cryptomonnaies
- **Aucune gestion de clés privées** : Le système ne génère, ne stocke, ni n'utilise de clés privées utilisateur
- **Aucune signature de transactions** : Le système ne signe aucune transaction blockchain en nom et pour le compte de l'utilisateur

**Implication contractuelle** : Le Service n'est **pas soumis aux réglementations applicables aux services de custody d'actifs numériques**. Le Client conserve la pleine responsabilité de la gestion de ses actifs et clés privées.

**Référence technique** : `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` (section 1.2)

---

### 6.2 Pas d'Exécution Blockchain Automatique

Le Service **ne déclenche aucune exécution on-chain automatique** :

- **Pipeline Web3 simulée uniquement** : Le système simule des pipelines Web3 (proof → anchor → mint) en mode DRY_RUN
- **Validation uniquement** : Le système valide et recommande des actions Web3, mais ne les exécute pas
- **REAL execution ultra-guardée** : Même en mode REAL (opt-in explicite), l'exécution nécessite des validations multiples (guards, kill switch, secrets)

**Implication contractuelle** : Le Service n'est **pas responsable des transactions blockchain effectuées par le Client**. Toute transaction on-chain est initiée et signée par le Client via son wallet externe.

**Référence technique** : `mf-back/orchestration/web3Pipeline.js` (simulation uniquement), `docs/releases/RELEASE_v1.0.md` (section "Absence d'Exécution On-Chain Automatique")

---

### 6.3 Pas de Conseil Juridique / Financier

Le Service **ne fournit pas de conseil juridique ou financier** :

- **Recommandations uniquement** : Les outputs sont des recommandations basées sur l'analyse multi-agents
- **Validation humaine requise** : Toutes les recommandations doivent être validées par un professionnel qualifié
- **Aucune garantie de conformité** : Le Service ne garantit pas la conformité aux réglementations applicables

**Implication contractuelle** : Le Client doit consulter ses conseils juridiques et financiers avant d'appliquer les recommandations du Service. Le Prestataire n'est **pas responsable des conséquences de l'application des recommandations sans validation professionnelle**.

**Référence légale** : Voir `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` (section 4.2)

---

## 7. Clause Audit / Transparence

### 7.1 Accès Logs

Le Client peut accéder aux **logs structurés** du Service :

- **Format** : Logs structurés JSON (Pino)
- **Champs** : traceId, runId, tenantId, intent, agents, status, latencyMs
- **Pas de PII** : Les logs ne contiennent pas de PII (email, nom, wallet address)
- **Rétention** : Selon configuration du Prestataire (non contractuelle)

**Implication contractuelle** : Le Prestataire fournit l'accès aux logs structurés via l'API ou les fichiers de logs. La rétention des logs n'est pas garantie contractuellement.

**Référence technique** : `mf-back/utils/logger.js`, `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 2.1)

---

### 7.2 Evidence Pack

Le Prestataire peut fournir un **evidence pack** sur demande :

- **Contenu** : Code source, documentation, tests, métriques, SLO snapshots
- **Format** : Documentation Markdown, JSON, scripts
- **Disponibilité** : Sur demande, dans les limites de la confidentialité

**Implication contractuelle** : Le Prestataire s'engage à fournir un evidence pack raisonnable sur demande du Client, dans les limites de la confidentialité et de la propriété intellectuelle.

**Référence technique** : `docs/audit/EVIDENCE_MAP.md`, `docs/releases/RELEASE_v1.0.md`

---

### 7.3 Audit Simulé vs Réel

Le Prestataire a effectué un **audit simulé SOC2 Type I** :

- **Type** : Simulé (basé sur preuves existantes)
- **Scope** : Orchestration layer uniquement
- **Résultats** : 75% PASS, 25% PARTIAL, 0% FAIL (selon preuves examinées)
- **Statut** : Non certifié (audit interne, non organisme externe)

**Implication contractuelle** : L'audit simulé ne constitue **pas une certification formelle**. Le Prestataire peut fournir les documents d'audit simulé sur demande, mais ne garantit pas une certification SOC2 formelle.

**Référence technique** : `docs/audit/SOC2_SIMULATED_AUDIT.md`, `docs/audit/AUDITOR_STATEMENT.md`

---

## 8. Propriété Intellectuelle

### 8.1 Code Source

Le code source du Service reste la **propriété exclusive du Prestataire**.

**Implication contractuelle** : Le Client n'acquiert aucun droit de propriété intellectuelle sur le code source du Service. Le Client peut utiliser le Service selon les termes du Contrat, mais ne peut pas copier, modifier, ou distribuer le code source.

---

### 8.2 Données Client

Les **données fournies par le Client** (inputs, payloads) restent la **propriété du Client**.

**Implication contractuelle** : Le Prestataire n'acquiert aucun droit de propriété sur les données du Client. Le Prestataire s'engage à ne pas utiliser les données du Client à des fins autres que la fourniture du Service.

---

### 8.3 Outputs Décisionnels

Les **outputs décisionnels** générés par le Service (recommandations, plans d'action) sont la **propriété du Client** qui les a générés.

**Implication contractuelle** : Le Client peut utiliser les outputs décisionnels générés par le Service à ses propres fins, sous réserve de respecter les limitations de responsabilité (section 3.5).

---

## 9. Résiliation

### 9.1 Résiliation par le Client

Le Client peut résilier le Contrat à tout moment, sous réserve d'un préavis de 30 jours.

**Implication contractuelle** : En cas de résiliation, le Prestataire cessera de fournir le Service à l'expiration du préavis. Les données in-memory seront effacées automatiquement après TTL (10 minutes).

---

### 9.2 Résiliation par le Prestataire

Le Prestataire peut résilier le Contrat en cas de :

- Violation des conditions d'utilisation
- Non-paiement
- Usage frauduleux ou abusif
- Risque de sécurité

**Implication contractuelle** : Le Prestataire notifiera le Client dans les meilleurs délais en cas de résiliation. Le kill switch peut être activé immédiatement en cas de risque de sécurité.

---

## 10. Dispositions Générales

### 10.1 Modification du Service

Le Prestataire se réserve le droit de modifier le Service à tout moment, sous réserve de :

- Notification du Client en cas de modification majeure
- Maintien de la compatibilité rétroactive de l'API (pas de breaking changes)
- Documentation des modifications dans le changelog

**Implication contractuelle** : Le Client sera informé des modifications majeures via le changelog (`docs/releases/CHANGELOG.md`). Les modifications mineures peuvent être effectuées sans notification préalable.

---

### 10.2 Support

Le Prestataire fournit un support technique selon les modalités définies dans le Contrat principal.

**Support inclus** :

- Documentation (`docs/`)
- Scripts release (`scripts/release/`)
- Compliance check (`scripts/compliance/check-compliance.js`)

**Support non inclus** :

- Support personnalisé (selon contrat spécifique)
- Formation (selon contrat spécifique)
- Audit formel (audit simulé fourni, audit formel selon contrat spécifique)

---

### 10.3 Loi Applicable

Le présent Contrat est régi par la loi applicable définie dans le Contrat principal.

**En l'absence de disposition contraire** : Le présent Contrat est régi par le droit français.

---

## 11. Acceptation

En utilisant le Service, le Client reconnaît avoir lu, compris, et accepté les termes de la présente Annexe Contractuelle SaaS.

**Date d'acceptation** : _______________
**Signature Client** : _______________

---

**Dernière mise à jour** : 2025-12-26
**Version** : 1.0.0

---

**Money Factory AI - Annexe Contractuelle SaaS v1.0.0**
*Production-Ready, DRY_RUN-safe, Never-Crash Guaranteed*

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

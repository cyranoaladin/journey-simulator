# CONTRAT D'ANALYSE — PHASE S2.1 (MOTEUR JOURNEY)

**Statut** : DOCUMENT DE RÉFÉRENCE (READY FOR S2.2)  
**Date** : 2025-12-24  
**Source de vérité** : `CAHIER_CHARGES_TESTNET.md`

Ce document constitue le **CONTRAT STRICT** pour l'implémentation du moteur Journey (Phase S2). Il annule et remplace toute spécification antérieure moins précise. Aucune ligne de code ne doit être écrite en S2.2 sans se référer à ce contrat.

---

## 1. AUTORITÉ & SOURCE DE VÉRITÉ

Cette section définit le dogme architectural "Server-Authoritative".

### 1.1 Source de Vérité Unique : Le Backend (`mf-back`)
Le backend est le **SEUL** détenteur de la vérité pour :
1.  **L’État des Données** : Si le backend dit qu'un utilisateur est à l'étape 3, l'utilisateur EST à l'étape 3, peu importe ce que dit le localStorage du navigateur.
2.  **La Validation de Phase** : Seul le backend peut passer une phase de `SUBMITTED` à `VALIDATED`.
3.  **L’Attribution de XP** : Tout point d'expérience doit correspondre à une écriture dans le `XpLedger` côté serveur. L'affichage client est une simple projection.
4.  **La Production d'Artefacts** : Un artefact n'existe que s'il a un ID et une URL sécurisée générée par le serveur.

### 1.2 Interdictions Formelles pour le Frontend (`journey-simulator`)
Le frontend est dégradé au rang de "Client de Rendu".
*   ❌ **INTERDIT** de calculer un score localement.
*   ❌ **INTERDIT** de déverrouiller une phase via logique JS (`if (score > 80) unlock()`).
*   ❌ **INTERDIT** de générer une "fausse" Proof-of-Skill.
*   ❌ **INTERDIT** de stocker l'avancement critique dans le navigateur (localStorage ne sert que de cache UI).
*   ❌ **INTERDIT** d'outrepasser l'ordre des étapes imposé par le backend.

---

## 2. MACHINE À ÉTATS FORMELLE

Tout ticket d'implémentation S2.2 doit respecter ces diagrammes d'états.

### 2.1 Objet `JourneyRun` (Cycle de vie global)
Représente une instance de parcours pour un utilisateur.

*   **États possibles** :
    1.  `INITIALIZED` : Run créé, aucune action.
    2.  `IN_PROGRESS` : Au moins une soumission effectuée.
    3.  `PAUSED` : (Optionnel) Suspendu administrativement.
    4.  `COMPLETED` : Toutes les phases requises sont `VALIDATED`.
    5.  `ABANDONED` : Marqué explicitement comme abandonné par l'user.

*   **Transitions autorisées** :
    *   `NULL` → `INITIALIZED` (Création)
    *   `INITIALIZED` → `IN_PROGRESS` (Premier submit)
    *   `IN_PROGRESS` → `COMPLETED` (Dernière phase validée)
    *   `IN_PROGRESS` → `ABANDONED`

### 2.2 Objet `PhaseProgress` (Cycle de vie local)
Représente l'état d'une phase spécifique (ex: "Phase 1 - Learn").

*   **États possibles** :
    1.  `LOCKED` : Non accessible (Phase précédente non validée + cooldown éventuel).
    2.  `UNLOCKED` : Accessible, prêt à recevoir une soumission.
    3.  `SUBMITTED` : Contenu envoyé, en attente d'évaluation (Queue Zyno).
    4.  `EVALUATING` : Pris en charge par l'agent Zyno (Processing).
    5.  `VALIDATED` : Succès (Score >= Seuil). État final stable pour cette version.
    6.  `REJECTED` : Échec (Score < Seuil). Nécessite une nouvelle soumission.

*   **Transitions autorisées** :
    *   `LOCKED` → `UNLOCKED` (Trigger: Validation phase précédente).
    *   `UNLOCKED` → `SUBMITTED` (Action: User submit).
    *   `SUBMITTED` → `EVALUATING` (Action: Job start).
    *   `EVALUATING` → `VALIDATED` (Action: Job success && Score >= Min).
    *   `EVALUATING` → `REJECTED` (Action: Job success && Score < Min).
    *   `REJECTED` → `SUBMITTED` (Action: User retry).

*   **Règles d'Idempotence & Retry** :
    *   Un `POST /submit` sur une phase `SUBMITTED` ou `EVALUATING` est rejeté (409 Conflict) ou ignoré.
    *   Un `POST /submit` sur une phase `VALIDATED` est interdit par défaut (sauf mode "Amélioration" explicite qui créerait une nouvelle version, hors scope MVP S2).
    *   Un `POST /submit` sur une phase `REJECTED` est autorisé (crée une nouvelle `Submission` liée).

---

## 3. IMMUTABILITÉ & LEDGERS

Afin de garantir l'auditabilité S3, certaines données sont "Append-Only" (écriture seule, jamais de modification).

### 3.1 Objets Append-Only (Immutables)
1.  **Submission** : Une soumission utilisateur est une archive. Si l'utilisateur corrige son travail, c'est une *nouvelle* `Submission`.
2.  **Evaluation** : Le verdict de Zyno est gravé dans le marbre. On ne modifie jamais une note. On refait une évaluation sur une nouvelle soumission.
3.  **XpEntry (Ledger)** : On ne fait jamais `user.xp += 10`. On insère une ligne `+10` dans le ledger. Le solde est la somme des lignes (`SUM(amount)`).

### 3.2 Distinction des Données
*   **Données Métier (Mutable)** : C’est l’état *courant*.
    *   Ex: `PhaseProgress.status`, `PhaseProgress.bestScore`, `JourneyRun.currentStep`.
    *   Elles peuvent être mises à jour pour refléter la "dernière version".
*   **Données d’Audit (Immutable)** : C’est l’historique *complet*.
    *   Ex: Table `SubmissionHistory`, Table `XpLedger`.
    *   Elles servent à reconstruire l'histoire en cas de contestation.
*   **Données Exportables S3** : Sous-ensemble *certifié*.
    *   Uniquement les `Evaluation` ayant statut `PASS`.
    *   Uniquement les `Submission` associées.

---

## 4. DÉLIMITATION S2 ↔ S3

Ce paragraphe définit le "Cut logico-légal" entre le moteur (S2) et la preuve (S3).

### 4.1 Données Éligibles Proof-of-Skill (Le "Payload")
Pour qu'une Proof-of-Skill soit générée en S3, le moteur S2 doit fournir :
1.  L'ID du `JourneyRun` avec statut `COMPLETED`.
2.  La liste ordonnée des `Evaluation` (celles qui ont validé chaque phase).
3.  Le hash cryptographique (SHA-256) des `Artefacts` produits.
4.  L'état du `XpLedger` à l'instant T.

### 4.2 Exclusion Stricte
Tout ce qui suit ne DOIT PAS faire partie de la preuve :
*   Les brouillons (`Submission` sans validation).
*   Les échecs (`PhaseProgress` statut `REJECTED`).
*   Les métadonnées UI (temps passé sur la page, nombre de clics).

### 4.3 Garantie d'Auditabilité
S2 garantit qu'il est impossible d'avoir une phase `VALIDATED` sans qu'il existe une `Evaluation` correspondante en base avec `decision: PASS`. L'intégrité référentielle de la BDD est le garant de la Proof-of-Skill.

---

## 5. CRITÈRES DE VALIDATION S2.1 (DONE IF)

La phase S2.1 est validée et permet le passage à S2.2 SI ET SEULEMENT SI :

*   [ ] **CONTRAT LU** : Ce document est lu et approuvé par le Lead (User).
*   [ ] **MODÈLES PRÊTS** : Les champs nécessaires (`JourneyRun`, `PhaseProgress`, `Submission`, `Evaluation`, `XpLedger`) sont listés et prêts à être transcrits en schéma Prisma.
*   [ ] **ÉTATS FIGÉS** : La machine à état (Section 2) ne subira plus de modification structurelle.
*   [ ] **AUCUNE AMBIGUÏTÉ FRONT/BACK** : Il est clair que le Front ne décide rien.

---

**MENTION FINALE : READY FOR S2.2**
Ce document est prêt pour validation humaine.
En attente de GO pour démarrer l'implémentation S2.2 (Database Setup & Core Models).

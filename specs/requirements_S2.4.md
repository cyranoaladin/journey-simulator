# REQUIREMENTS SPECIFICATION: S2.4 — EVALUATION & ZYNO INTEGRATION

**Projet** : Money Factory AI - Journey Simulator  
**Version** : 1.0  
**Statut** : READY FOR DEV  
**Source** : `docs/S2.4_DELIVERY.md`, `docs/PLATFORM_DEEP_DIVE_FR.md`

## 1. OBJECTIF DE LA LIVRAISON (S2.4)
L'objectif est d'implémenter le moteur d'évaluation hybride (Déterministe + IA) permettant de valider les missions utilisateurs. Cette étape connecte pour la première fois le **Journey Engine** à l'agent **Zyno** pour une analyse sémantique des soumissions.

---

## 2. EXIGENCES TECHNIQUES

### 2.1 Service d'Évaluation (`EvaluationService.js`)
Le service doit orchestrer la validation des missions selon deux modes :

* **Mode Déterministe (Fallback/Défaut)** :
    * Doit être utilisé si `ENABLE_ZYNO_EVAL=false` ou si l'appel IA échoue (Safe Failover).
    * **Logique** : Si `submission.length > 0` → Score 100 (VALIDATED), sinon Score 0 (REJECTED).
    * **Performance** : Exécution synchrone immédiate (< 10ms).

* **Mode LLM-Assisted (Zyno)** :
    * Activé via la variable d'environnement `ENABLE_ZYNO_EVAL=true`.
    * **Input** : `missionId`, `userSubmission`, `phaseContext`.
    * **Appel Agent** : Doit invoquer `ZynoAgent` pour analyser la pertinence de la réponse.
    * **Output attendu** :
        * `score` (0-100)
        * `decision` (VALIDATED | REJECTED)
        * `reasoning` (Feedback textuel pour l'utilisateur)

### 2.2 Intégration Journey Engine
* La méthode `submitPhase` doit appeler `EvaluationService.evaluate` de manière **synchrone** (ou `await` l'appel asynchrone) avant de répondre au client.
* **Transitions d'état** :
    * `EVAL_PASS` (Score ≥ Threshold) → Statut phase `VALIDATED` → Unlock phase suivante.
    * `EVAL_FAIL` (Score < Threshold) → Statut phase `REJECTED` → User doit réessayer.

### 2.3 Persistance & Logs
* Chaque évaluation doit produire un enregistrement immuable `Evaluation` dans MongoDB.
* Les logs d'exécution Zyno doivent être capturés (Prompt tokens, Completion tokens, Latency) pour l'observabilité.

---

## 3. CONTRAINTES & BLOQUANTS IDENTIFIÉS

### 3.1 Contraintes Backend (Zyno / Node.js)
* **Dépendance Clé API** : Le mode Zyno nécessite une clé OpenAI valide (`OPENAI_API_KEY`).
* **Timeout** : L'appel LLM peut prendre 2-5 secondes. Le endpoint `POST /submit` doit avoir un timeout étendu ou gérer l'attente client.
* **Sécurité** : Le fallback doit être robuste. Si OpenAI est down, l'utilisateur ne doit pas être bloqué (Mode déterministe forcé).

### 3.2 Contraintes Frontend (Journey Simulator)
* **Feedback UI** : L'interface doit gérer l'état `LOADING` pendant l'évaluation Zyno.
* **Affichage Feedback** : Le composant `MissionResult` doit afficher le `reasoning` retourné par Zyno, pas juste le score.

---

## 4. ACCEPTANCE CHECKLIST (DEFINITION OF DONE)

### ✅ Validation Fonctionnelle
- [ ] **Cas Nominal (Zyno)** : Une soumission pertinente reçoit un score > 0 et un feedback textuel cohérent.
- [ ] **Cas Rejet (Zyno)** : Une soumission vide ou hors-sujet reçoit un score faible et un feedback explicatif.
- [ ] **Cas Fallback** : Si on coupe le réseau ou invalide la clé API, le système bascule en mode déterministe (Score 100/0) sans erreur 500.

### ✅ Validation Technique
- [ ] **Tests Unitaires** : `s2_evaluation.test.js` passe et valide la logique de switch (Flag `ENABLE_ZYNO_EVAL`).
- [ ] **Tests Intégration** : `s2_logic.test.js` valide le flux complet (Start -> Submit -> Validate -> Unlock Next).
- [ ] **Code Quality** : Pas de `mockEvaluate` résiduel, code propre dans `EvaluationService.js`.

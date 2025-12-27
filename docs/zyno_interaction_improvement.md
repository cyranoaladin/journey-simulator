
# 🔁 Zyno Interaction Layer - Audit & Roadmap

## 🎯 Objectif

Renforcer la **visibilité** et l’**interactivité** de l’agent Zyno à chaque étape des parcours utilisateur dans le simulateur.

Zyno n’est pas un moteur invisible : c’est un **copilote intelligent** qui doit **expliquer ses actions, afficher ses décisions, proposer des pistes et s’adapter aux retours utilisateurs.**

---

## ✅ Statut actuel (16/11/2025)

- **Réponses agents standardisées** via `createAgentResponse` et enrichies avec reasoning, actions, métriques et sources normalisées.
- **Orchestrateur** (`mf-back/orchestration/zynoOrchestrator.js`) centralise désormais les timelines, expose `/orchestration/current-step` et journalise chaque interaction.
- **Logs** persistés avec les nouveaux champs depuis `mf-back/routes/zyno-routes.js` et `agentFeedbackLog`.
- **Frontend** :
  - `PhaseInteractionBlock` + `ZynoDecisionPanel` affichent les décisions.
  - `AgentFeedbackModal` se ferme automatiquement après envoi et relaie le contexte complet.
  - Timeline Zyno mise à jour dans `ZynoConsole.tsx`.
- **Tests automatisés** :
  - **Backend** : scénario de mission fictive (`mf-back/__tests__/fixtures/demo_mission.json`) vérifié par `mf-back/__tests__/demoMission.test.js` + suite Jest complète `npm run test --prefix mf-back`.
  - **Frontend** : test React (`journey-simulator/src/components/Zyno/__tests__/AgentFeedbackModal.test.tsx`) valide l’auto-fermeture après feedback avec `npm run test --prefix journey-simulator`.
- **Documentation** : ce guide et les descriptions d’API reflètent l’état réel de l’orchestrateur et du feedback.

---

## 🧩 Étapes et Parcours Concernés

Chaque `phase` définie dans les fichiers de templates (journey-tasks.json, templates/*.json) ou orchestrée par `zynoOrchestrator.js` doit :

- ✅ Afficher un résumé de l’intention détectée
- ✅ Afficher le nom de l’agent déclenché
- ✅ Présenter le raisonnement ou la stratégie de l’agent (si disponible)
- ✅ Fournir une sortie exploitable : lien, graphique, ressource, résumé
- ✅ Demander un retour utilisateur (AEPO = orchestration du parcours individuel / AECO = orchestration de cohorte)

---

## 🔁 Composants Front à mettre à jour

### 1. **ZynoConsole.tsx**

- Ajouter un panneau latéral fixe ou modal en bas pour :
  - ✍️ Voir le raisonnement de Zyno (markdown ou visualisé en UI)
  - 🔁 Montrer la requête envoyée au RAG ou à l’agent
  - 📥 Voir la réponse structurée (avec étapes, sources RAG, résumé)

### 2. **JourneyCard / PhaseView**

- Ajouter :
  - 🎯 But de la phase + rôle de l’agent
  - 🤖 Résumé généré par Zyno (reasoning)
  - 📍 Indicateur d’état : en cours / terminé / en attente feedback
  - ✅ Bouton pour soumettre un feedback

---

## 🛠️ Backend - À implémenter ou étendre

### Agent Outputs : enrichir les logs avec :

- `phaseId`, `agentName`, `promptSent`, `response`, `RAG_used`, `reasoning`
- Champs supplémentaires à injecter dans `agentFeedbackLog.js`

### Routes :

- `/orchestration/logs?journeyId=xyz` : récupérer tout l’historique visible
- `/orchestration/current-step` : exposer l’état actuel à l’UI (phase, nom agent, résultat)

#### Détails de `GET /orchestration/current-step`

- **But** : fournir à l'interface une vision temps reel de la derniere decision de Zyno afin d'afficher les panneaux contextuels et pre-remplir les formulaires de feedback.
- **Query** : `userId` (optionnel, defaut `demo_user`).
- **Reponse 200** :

```json
{
  "currentStep": {
    "agent": "BuilderAgent",
    "phase": "build-prototype",
    "intent": "product_build",
    "prompt": "Elaborer un plan de construction pour \"prototype web3\"",
    "reasoning": "Croise les references techniques pour definir les sprints critiques du MVP.",
    "action": "Valider le backlog propose et assigner un owner par lot critique.",
    "sources": [
      { "title": "playbook-solana-build", "snippet": "Checklist de setup Anchor..." }
    ],
    "metrics": {
      "confidence": 0.92,
      "success": true
    },
    "feedback": {
      "ae_summary": "Plan de construction genere",
      "ae_outcome": "Architecture technique validee"
    },
    "timestamp": "2025-11-16T09:42:00.000Z"
  }
}
```

- **Bonne pratique front** : rafraichir ce point toutes les 30 s maximum et invalider le cache apres chaque appel `/orchestration` pour afficher immediatement la nouvelle decision ainsi que le bouton de feedback sur la phase concernee.

---

## 🧪 Suggestion de structure de réponse agent

```json
{
  "agent": "InvestorAgent",
  "phase": "Recherche d'investisseurs",
  "reasoning": "Basé sur la maturité du pitch et les critères du marché web3",
  "action": "Recherche de 3 investisseurs pertinents via RAG",
  "sources": ["https://..."],
  "output": {
    "investors": [
      { "name": "Web3 Capital", "focus": "RWA", "location": "Dubai" }
    ]
  }
}
```

---

## 📊 UX Suggestions

- Ajouter un fil chronologique des étapes (timeline + résumé des décisions)
- Générer un résumé global à la fin du parcours (type résumé de mission)
- Afficher les scores AEPO / AECO dynamiquement
- Ajouter feedback à chaud (via micro modal) sur les actions de Zyno

---

## 🏁 Étapes de mise en œuvre pour Copilot

1. Ajouter un modèle de réponse standardisée dans tous les agents (output enrichi)
2. Modifier `zynoOrchestrator.js` pour structurer chaque action de Zyno
3. Étendre le loggeur `agentFeedbackLog` pour capturer reasoning et sources
4. Créer des composants React : `ZynoDecisionPanel.jsx`, `PhaseInteractionBlock.jsx`
5. Intégrer la logique dans la `ZynoConsole` (UI conditionnelle selon `journeyStore`)
6. Tester avec le parcours fictif `mf-back/__tests__/fixtures/demo_mission.json` (`npm run test --prefix mf-back`)
7. Vérifier l'UX côté React (`npm run test --prefix journey-simulator`)

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

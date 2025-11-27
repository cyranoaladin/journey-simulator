
# 🧠 Guide d’Architecture Zyno Intégrée

## 📌 Contexte

Le dossier `fichiers_ajout_journey_simulator` a été entièrement intégré dans la base de code. Ce guide récapitule les emplacements à connaître pour maintenir le module Zyno déjà fusionné dans le projet `journey_mfai_back_front`.

---

## 🗂️ Répertoires clés

```
journey_mfai_back_front/
├── journey-simulator/
│   └── src/components/Zyno/         # Console Zyno, mission flow, scoreboard, feedback UI
└── mf-back/
    ├── agents/                      # 17 agents spécialisés + agent_template.js
    ├── orchestration/               # zynoOrchestrator.js, agentsRegistry.js, journey-tasks.json
    ├── rag/                         # ragClient.js, scripts d’ingestion
    ├── data/parcours_templates/     # Templates JSON utilisés par l’orchestrateur
    ├── data/rag-documents/          # Base documentaire interrogée par le RAG
    ├── memory/                      # Persistances des métriques/feedback
    └── models/agentFeedbackLog.js   # Schéma MongoDB pour les logs d’agents
```

---

## 🔁 Flux fonctionnel

1. Le frontend (`journey-simulator/src/components/Zyno/`) collecte l’intention utilisateur et appelle `/orchestration`.
2. `mf-back/orchestration/zynoOrchestrator.js` détecte l’intention, récupère les agents via `agentsRegistry.js` et charge les templates de `data/parcours_templates/`.
3. Les agents (fichiers `mf-back/agents/*.js`) exécutent leur logique et peuvent interroger `mf-back/rag/ragClient.js` pour enrichir la réponse.
4. Les résultats et métriques sont stockés dans MongoDB via `mf-back/models/agentFeedbackLog.js` et `mf-back/memory/`.

---

## 🧪 Tests & Qualité

- Utiliser `npm run test:coverage --prefix mf-back` pour couvrir orchestrateur + agents.
- Ajouter des specs unitaires dans `mf-back/tests/unit/` et des tests de routes/orchestration dans `mf-back/__tests__/`.
- Pour l’UI, prévoir des tests React Testing Library (à mettre en place) et valider manuellement les écrans `/zyno`.
- Lancer `npm run test:e2e` côté frontend pour rejouer le scénario Playwright du wallet modal, puis effectuer un QA manuel Phantom + Torus afin de vérifier la reconnexion et la persistance de session malgré l’avertissement de dépréciation Torus.

---

## 🔧 Tâches courantes

- **Créer un nouvel agent** : dupliquer `mf-back/agents/agent_template.js`, enregistrer la classe dans `mf-back/orchestration/agentsRegistry.js`, mapper l’intention dans `journey-tasks.json`, puis écrire un test dédié.
- **Ajouter une ressource RAG** : placer le fichier dans `mf-back/data/rag-documents/` et, si besoin, mettre à jour les templates dans `data/parcours_templates/`.
- **Adapter l’UI** : modifier ou étendre les composants dans `journey-simulator/src/components/Zyno/`.

---

## ✅ Points de vigilance

- Garder les imports relatifs cohérents (backend en CommonJS).
- Toujours retourner `{ result, score, references }` depuis les agents pour que l’orchestrateur consolide correctement les réponses.
- Vérifier les logs MongoDB après modifications majeures (`agentFeedbackLog`).

---

> Le module Zyno est désormais partie intégrante du backend/frontend : il n’est plus nécessaire de lancer un script de migration externe.
├── .env.example

├── contributing.md

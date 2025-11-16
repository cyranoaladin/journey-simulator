
# 🧠 GitHub Copilot — Instructions de Développement Frontend (Zyno Journey Simulator)

Ce document guide GitHub Copilot ou tout autre développeur IA/humain dans l'intégration complète des améliorations frontend selon le `cahier_charges_amelioration_front.md`. Il synthétise la feuille de route opérationnelle, clarifie les priorités UX/UI et donne des instructions précises de développement pour transformer l'interface du `Journey Simulator` en un **dashboard interactif, immersif et professionnel**.

---

## 🗂️ Structure Générale

Les composants React à modifier/créer sont situés dans :

```
journey-simulator/
└── src/
    ├── components/
    │   └── Zyno/
    │       ├── ZynoConsole.jsx
    │       ├── ZynoMissionFlow.jsx
    │       ├── MissionFeedbackSummary.jsx
    │       ├── AgentLogViewer.jsx
    │       ├── JourneyCard.jsx
    │       ├── DashboardZyno.jsx
    │       ├── ModalVoteDAO.jsx
    │       └── JourneyCompleted.jsx
    ├── utils/
    │   ├── exportToPDF.js
    │   └── notionWebhook.js
    └── App.tsx
```

---

## 🎯 Objectifs de refonte

- ✅ Refonte visuelle moderne en **TailwindCSS** + **Framer Motion**
- ✅ Thèmes dynamiques (mode clair/sombre)
- ✅ Expérience utilisateur gamifiée
- ✅ Animation des phases et transitions fluides
- ✅ Interaction réelle avec l’agent Zyno
- ✅ Explication claire du workflow des parcours
- ✅ Pages explicatives, boutons d’action cohérents

---

## 🧱 Instructions par Composant

### 1. `ZynoConsole.jsx`

- Ajouter des **micro-interactions** (hover, loading, typing effect).
- Clarifier l’UX par des titres de section, séparation claire des zones (feedback / interaction).
- Ajouter un bouton de **Vote DAO** (ouvre `ModalVoteDAO.jsx`).

### 2. `JourneyCard.jsx`

- Chaque phase du parcours doit apparaître **animée avec Framer Motion**.
- Style avec `glassmorphism` ou effet **néon**.

### 3. `JourneyCompleted.jsx`

- Animation 🎉 de fin (explosion de confettis ou shimmer).
- Récapitulatif AEPO / AECO avec barres / radar chart.
- Bouton :
  - 🔁 Rejouer une mission (reset)
  - 📤 Export Notion (via `notionWebhook.js`)
  - 🧾 Export PDF (`exportToPDF.js`)

### 4. `DashboardZyno.jsx`

- Vue globale synthétique :
  - Classement agents (AEPO/AECO)
  - Historique des missions
  - Accès aux feedbacks

### 5. `ModalVoteDAO.jsx`

- Modal animée (Framer Motion).
- Champ texte, slider (poids vote), bouton "Voter".
- Intégration simulée (mock DAO) avec score.

---

## 🎨 Design

- Palette de couleurs : inspirée Web3 (violet foncé, noir profond, gradients néon).
- Polices modernes (poppins, inter).
- Icons via [Lucide](https://lucide.dev) ou Heroicons.
- Boutons clairs (hover, focus, disabled states).
- Responsive mobile-first avec `@media` ou Tailwind.

---

## 🧪 Tests à mettre en place

- Ajouter `vitest` + `@testing-library/react`
- Exemple à tester :
  - `JourneyCompleted`: vérifier que l'export fonctionne.
  - `ZynoConsole`: test unitaire du formulaire.
  - `ModalVoteDAO`: ouverture/fermeture animée.
- Ajout de `playwright` recommandé pour e2e + navigation.

---

## 🔗 À relier

- Intégration avec `agent_memory.js` et `agent_metrics.js` pour afficher les scores AECO/AEPO.
- Envoi des données de feedback vers Notion via `notionWebhook.js`.
- Génération PDF (html2pdf ou jsPDF).

---

## ✅ Priorités Immédiates

1. Thématisation et refonte visuelle
2. Micro-interactions + transitions
3. Fin du parcours (🎉 + résumé + exports)
4. Vote DAO simulé
5. Page historique missions
6. Connexion aux feedbacks agents (AECO/AEPO)

---

## 📌 Notes

> Pour plus de détails, se référer au fichier `cahier_charges_amelioration_front.md` situé à la racine ou dans `/README & Documentation/`. Il complète chaque idée par des visuels, inspirations, détails UX.

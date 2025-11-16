
# 📘 next_steps_ui_rework.md
> Suivi de l’avancement de la refonte UI/UX de Zyno Mission Simulator (Frontend)

## 🧩 Composants à développer ou refondre

- ✅ JourneyCard animé (responsive + Framer Motion)
- ✅ ZynoConsole avec micro-interactions
- 🟡 DashboardZyno.jsx (XP, AEPO/AECO, timeline)
- ⬜ ModalVoteDAO animé
- ⬜ JourneyCompleted.jsx (scores, animation, export PDF/Notion)
- ⬜ AgentLeaderboard.jsx (classement AEPO/AECO)
- ⬜ AdminPanelExport.jsx (interface pour exporter feedbacks)
- ⬜ MultiAgentSummaryPanel.jsx
- ⬜ NotificationsBanner (état des agents + progression)

## 🎨 Thèmes, styles et layout

- ✅ Mise à jour de `tailwind.config.js` avec tokens `mfai` + gradients
- ✅ Activation du mode sombre (dark mode toggle)
- 🟡 Glassmorphism + ombres partagées (style “dashboard Solana”)
- 🟡 Correction du `Header` overlapping (sticky + spacing)
- ⬜ Révision des `globalStyles` (`index.css`, `Layout.jsx`)
- ⬜ Composants unifiés avec tokens (`card-surface`, `glow`, etc.)

## 🔁 Transitions et animation (Framer Motion)

- ✅ Tilt/hover sur cards interactives
- 🟡 Animation d’arrivée de la page JourneyCompleted
- ⬜ Animation de progression (badge, level up)
- ⬜ Loader animé pour les phases en attente
- ⬜ Slide-in pour les réponses agents

## 🧪 Tests et accessibilité

- ⬜ Setup de Jest ou Vitest pour tests unitaires
- ⬜ Setup Playwright pour E2E tests UI
- ⬜ Ajout tests pour JourneyCard, ZynoConsole
- ⬜ Tests accessibilité WCAG (contrastes, dark mode)

## 📦 Intégrations à valider

- ✅ Bouton “relancer mission” connecté à l’orchestrateur
- ⬜ Bouton “export Notion” (via webhook local)
- ⬜ Bouton “export PDF” (via `exportToPDF.js`)
- ⬜ Connexion avec RAG local (contenus dynamiques)
- ⬜ Ajout des composants dans le router principal (App.tsx)

## 🛠️ UI bugs ou incohérences

- 🟡 `Header` qui chevauche la page
- ⬜ Pas de padding autour du dashboard sur mobile
- ⬜ Manque de feedback lors du chargement des agents
- ⬜ Absence de résumé clair pour l’utilisateur post-mission

---

## 🔍 Instructions

🖋️ **Mise à jour manuelle** à chaque PR ou commit lié à l’UI.  
✅ Ne pas oublier de **cocher** une tâche seulement une fois testée localement.  
📁 Ce fichier peut être inclus dans `docs/` ou à la racine du projet.  
📌 GitHub Copilot peut le lire pour guider les développements futurs.

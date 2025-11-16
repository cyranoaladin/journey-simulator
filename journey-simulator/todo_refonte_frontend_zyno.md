# ✅ Plan d’action complet pour la refonte du frontend Zyno (Journey Simulator)

---

## 🧱 Étape 1 – Mise à niveau de l’environnement de test

- [x] Installer `vitest`, `@testing-library/react`, `jsdom`, `playwright`
- [x] Ajouter les scripts `test`, `test:watch`, `test:e2e`, etc. dans `package.json`
- [x] Créer les fichiers `vitest.config.ts` et `playwright.config.ts`
- [x] Ajouter un exemple de test unitaire pour `ZynoConsole`

---

## 🧩 Étape 2 – Modularisation et structure

- [x] Organiser les composants en dossiers `layout/`, `zyno/`, `shared/`
- [x] Créer un `Layout.tsx` avec `Header`, `Sidebar`, `Main`, `Footer`
- [x] Ajouter `Dashboard.tsx` et `Journey.tsx`
- [x] Ajouter routing logique entre pages

---

## 🎨 Étape 3 – Design System & UI/UX

- [ ] Créer `tailwind.config.js` avec la charte Web3
- [ ] Intégrer des animations `framer-motion`
- [ ] Créer `JourneyCard` animé
- [ ] Refonte `ZynoConsole` avec micro-interactions
- [ ] Refonte `DashboardZyno.jsx`
- [ ] Ajouter thèmes dynamiques (dark/light via `class`)
- [ ] Rendre toutes les pages responsive (mobile-first)
- [ ] Corriger le chevauchement du `Header`

---

## 🧠 Étape 4 – Logique métier

- [ ] Ajouter modules `agent_metrics.js` et `agent_memory.js`
- [ ] Créer `ScoreDashboard.tsx` pour AEPO/AECO
- [ ] Ajouter bouton `Relancer une mission`
- [ ] Ajouter export PDF avec `exportToPDF.js`
- [ ] Ajouter export vers Notion via webhook local `/admin/notion-export`
- [ ] Créer modèle Notion
- [ ] Créer page complète `JourneyCompleted` avec animations et résumé

---

## 🧪 Étape 5 – Tests automatisés

- [ ] Tests unitaires : `JourneyCard`, `ZynoConsole`, `ModalVoteDAO`
- [ ] Tests d’intégration : parcours complet avec feedback
- [ ] Tests e2e : lancement → feedback → mission complétée (via Playwright)

---

## 🧰 Étape 6 – Console d'administration

- [ ] Ajouter interface `AdminExports` dans `ZynoConsole`
- [ ] Voir les exports PDF/Notion réalisés
- [ ] Suivi des feedbacks enregistrés

---

## 🗂️ Étape 7 – Roadmap complète à implémenter

- [x] `JourneyCompleted` avec animation + résumé
- [x] `ZynoConsole` avec micro-interactions
- [x] `ModalVoteDAO` + feedback agents
- [ ] UI DAO dynamique avec quorum, vote, staking
- [ ] Gestion avancée de l’historique des missions + exports
- [ ] Multi-agents avec résumé synchronisé sur console
- [ ] RAG dynamique avec mise à jour live et accès aux ressources distantes
- [ ] Intégration Web3 (WalletConnect, signature, tokens virtuels)
- [ ] Navigation claire avec progression et étapes visibles
- [ ] Accessibilité (labels, contraste, navigation clavier)
- [ ] Animations de transitions interpages
- [ ] Notifications/toasts pour actions agents, erreurs, résultats
- [ ] Guide utilisateur dans l’interface (tooltips, onboarding)

---

_Généré le 2025-11-15 pour pilotage technique complet par un agent IA._

# 🚀 Quick Start UI/UX - Money Factory AI

*Guide de démarrage rapide pour spécialistes UI/UX*
*Version*: 1.0
*Dernière mise à jour*: Décembre 2025

---

## 🎯 Objectif

Ce document vous permet de démarrer rapidement votre travail sur l'amélioration et la refonte UI/UX du projet Money Factory AI.

---

## 📚 Documents à Lire (dans l'ordre)

1. **`docs/UI_UX_DESIGN_GUIDE.md`** ⭐ **COMMENCEZ ICI**
   - Design system complet
   - Architecture UI (Trinity Layout)
   - Tous les composants
   - Patterns d'interaction
   - **Lire en premier** pour comprendre le système

2. **`docs/UI_UX_USER_FLOWS.md`**
   - Tous les flux utilisateur détaillés
   - Diagrammes de flux
   - Points d'attention UX

3. **`docs/UI_UX_COMPONENT_LIBRARY.md`**
   - Référence de tous les composants
   - Props et interfaces
   - Patterns de code

4. **`docs/UI_UX_TECHNICAL_REFERENCE.md`**
   - Détails techniques d'implémentation
   - State management
   - API integration

5. **`README.md`** (racine)
   - Vue d'ensemble du projet
   - Stack technique
   - Architecture monorepo

---

## 🛠️ Setup Local

### 1. Prérequis

```bash
# Vérifier Node.js
node --version  # Doit être >= 18.0.0

# Vérifier npm
npm --version
```

### 2. Installation

```bash
# Cloner le repo (si pas déjà fait)
git clone <repo-url>
cd journey_mfai_back_front

# Installer toutes les dépendances
npm run install:all
```

### 3. Lancer le Projet

```bash
# Option 1: Docker (recommandé)
./start_dev.sh

# Option 2: Manuel
# Terminal 1 - Backend
cd mf-back
npm run dev  # Port 3002

# Terminal 2 - Frontend
cd journey-simulator
npm run dev  # Port 3003

# Terminal 3 - Web Portal (optionnel)
cd web
npm run dev  # Port 3001
```

### 4. Accéder à l'Application

- **Frontend** : <http://localhost:3003>
- **Backend API** : <http://localhost:3002>
- **Web Portal** : <http://localhost:3001>

---

## 🧪 Tester l'Application

### Mode Demo (Recommandé pour commencer)

1. Aller sur <http://localhost:3003>
2. Cliquer "Try Demo" (pas besoin de wallet)
3. Sélectionner une persona
4. Explorer le JourneyWorkspace

### Mode Réel

1. Installer Phantom ou Solflare wallet
2. Se connecter avec wallet
3. Sélectionner une persona
4. Commencer un journey

---

## 📁 Fichiers Clés à Explorer

### Design System

- **`journey-simulator/tailwind.config.js`** : Configuration Tailwind complète
- **`journey-simulator/src/index.css`** : Styles globaux, variables CSS
- **`journey-simulator/src/utils/personaStyles.ts`** : Styles persona-specific

### Composants Principaux

- **`journey-simulator/src/components/Journey/JourneyWorkspace.tsx`** : Composant principal (1277 lignes)
- **`journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`** : Renderer UI Blocks (1146 lignes)
- **`journey-simulator/src/components/Journey/JourneyCard.tsx`** : Carte persona

### Données

- **`journey-simulator/src/data/personas.ts`** : 6 personas avec toutes leurs phases
- **`journey-simulator/src/types/uiBlocks.ts`** : Types de tous les UI Blocks

### State Management

- **`journey-simulator/src/store/journeyStore.ts`** : Store Zustand principal (868 lignes)

---

## 🎨 Outils Recommandés

### Design

- **Figma** : Pour créer les maquettes
- **Framer** : Pour les prototypes interactifs (optionnel)

### Développement

- **VS Code** : Éditeur recommandé
- **React DevTools** : Extension Chrome/Firefox
- **Tailwind CSS IntelliSense** : Extension VS Code

### Testing

- **Storybook** : `npm run storybook` (port 6006)
- **Playwright** : Tests E2E
- **Lighthouse** : Performance audit

---

## 🔍 Points de Départ pour la Refonte

### 1. Analyser l'Existant

**Checklist** :

- [ ] Explorer tous les composants dans `src/components/`
- [ ] Tester l'application en mode demo
- [ ] Identifier les problèmes UX (friction, confusion)
- [ ] Tester sur mobile/tablet/desktop
- [ ] Auditer l'accessibilité (WCAG 2.1 AA)

### 2. Prioriser les Améliorations

**Critique** (Complexité élevée) :

- `JourneyWorkspace` (Complexité 28) → Extraire en sous-composants
- `UIBlocksRenderer` (Complexité 27) → Simplifier `renderBasicMarkdown`

**Important** (UX) :

- Accessibilité (remplacer `role="button"` par `<button>`)
- Responsive mobile
- Performance (lazy loading, memoization)

**Nice to Have** :

- Animations améliorées
- Dark/Light mode toggle

### 3. Créer un Plan de Refonte

**Étapes** :

1. Wireframes des nouveaux designs
2. Prototypes interactifs
3. Validation avec stakeholders
4. Implémentation par phases
5. Tests utilisateurs
6. Itérations

---

## 📝 Notes Importantes

### Contraintes Techniques

- **Ne pas modifier** les contrats API (`POST /orchestration/vslice`)
- **Ne pas modifier** la logique fonctionnelle des agents Zyno
- **Respecter** la structure des UI Blocks (types dans `uiBlocks.ts`)

### Design System

- **Couleurs** : Palette Solana + Custom (voir `tailwind.config.js`)
- **Typography** : Space Grotesk (titres) + Inter (corps)
- **Spacing** : Multiples de 4px
- **Animations** : Framer Motion pour complexes, CSS pour simples

### Performance

- **Objectif** : FCP < 1.5s, LCP < 2.5s
- **Optimisations** : Lazy loading, code splitting, memoization

---

## 🆘 Besoin d'Aide ?

### Documentation

- **Design Guide** : `docs/UI_UX_DESIGN_GUIDE.md`
- **User Flows** : `docs/UI_UX_USER_FLOWS.md`
- **Component Library** : `docs/UI_UX_COMPONENT_LIBRARY.md`
- **Technical Reference** : `docs/UI_UX_TECHNICAL_REFERENCE.md`

### Code Source

- **Frontend** : `journey-simulator/`
- **Backend** : `mf-back/`
- **Web Portal** : `web/`

### Questions Fréquentes

**Q: Comment ajouter un nouveau composant ?**
A: Créer dans `src/components/` avec props typées, utiliser les classes Tailwind du design system.

**Q: Comment tester mes changements ?**
A: `npm run dev` pour voir en temps réel, `npm run lint` pour vérifier le code.

**Q: Où sont les assets (images, etc.) ?**
A: `journey-simulator/public/` pour les assets statiques.

---

## ✅ Checklist de Démarrage

- [ ] Lire `UI_UX_DESIGN_GUIDE.md` en entier
- [ ] Setup local fonctionnel
- [ ] Application lancée et testée
- [ ] Storybook exploré (`npm run storybook`)
- [ ] Tous les composants identifiés
- [ ] Design system compris
- [ ] Flux utilisateur testés
- [ ] Plan de refonte créé

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Bon travail ! 🚀**

*Pour toute question, consultez les autres documents de la série UI/UX.*

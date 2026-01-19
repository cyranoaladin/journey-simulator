<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Changelog (root)

Releases are tracked via SemVer tags (vX.Y.Z). See also:

- `web/CHANGELOG.md` pour les changements spécifiques au portail web

## [Unreleased]

### 🎯 Qualité & Refactoring (Décembre 2025)

- **Audit technique exhaustif** : 0 Bugs, Dette technique réduite à 59.8h
- **Corrections TypeScript** : Résolution de toutes les erreurs de type dans `JourneyWorkspace.tsx`
- **Modernisation JS** : Remplacement systématique de `.replace()` par `.replaceAll()`, utilisation de `globalThis` au lieu de `window`
- **Node.js prefixes** : Ajout du préfixe `node:` à tous les imports de modules natifs
- **Réduction de complexité cognitive** : Extraction de ternaires imbriqués, simplification de la logique dans `zynoVerticalSlice.js`
- **Code cleanup** : Suppression des variables inutilisées, assertions TypeScript inutiles, code commenté
- **Array.push() optimization** : Consolidation des appels multiples en un seul push avec spread operator

### 🔧 Corrections Techniques

- **Variables redéfinies** : Correction de `metricsSummaryAll` et `metricsByTenant` dans `zynoVerticalSlice.js`
- **Assignations inutiles** : Suppression de `retried` et correction de `idempotentReplays`
- **Conditions négatives** : Refactoring des conditions négatives inattendues en conditions positives
- **Type safety** : Typage explicite des blocs UI (`TextBlock`, `MissionBlock`, `ResourceBlock`, `QuizBlock`)
- **Optional chaining** : Amélioration de la gestion des valeurs undefined avec `??` operator

### 📚 Documentation

- **Mise à jour complète** : Synchronisation de toute la documentation avec l'état actuel du projet
- **README principal** : Ajout des versions exactes des dépendances, structure du monorepo détaillée
- **MVP_STATUS** : Mise à jour avec les preuves d'implémentation actuelles

### 🏗️ Architecture

- **Monorepo structure** : Clarification des responsabilités entre `mf-back`, `journey-simulator`, et `web`
- **Stack technique** : Documentation des versions exactes (React 19, Next.js 14.2, Express 4.21, etc.)
- **Orchestration Zyno** : Documentation complète du système R2.x avec Execution Gate (HITL)

### 🧪 Tests & Linting

- **ESLint strict** : Configuration avec 0 warnings autorisés
- **TypeScript strict** : Type checking strict activé sur tous les projets
- **Linting unifié** : Script `lint:all` pour vérifier tous les sous-projets

## [0.0.1] - 2025-12-27

### Initial Release

- Structure monorepo avec trois composants principaux
- Backend API (`mf-back`) avec orchestration agentique
- Frontend React (`journey-simulator`) avec Trinity Layout
- Web Portal (`web`) avec auth SIWS et minting pipeline
- Documentation complète dans `docs/`
- Scripts de déploiement et vérification

---

**Note** : Pour les changements détaillés par composant, consultez :

- `mf-back/` : Voir les commits Git
- `journey-simulator/` : Voir les commits Git
- `web/CHANGELOG.md` : Changelog spécifique au portail web

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

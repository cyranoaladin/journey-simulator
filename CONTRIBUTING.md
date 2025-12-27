# 🤝 Contributing to Money Factory AI

Nous accueillons les contributions de la communauté ! Ce document décrit les processus et conventions pour contribuer au projet.

## 📋 Prérequis

- Node.js **>= 18.0.0** (recommandé : 18.17.0+)
- Git
- Docker + Docker Compose (recommandé pour le développement local)
- MongoDB, PostgreSQL, Redis (ou utilisation de Docker Compose)

## 🚀 Démarrage Rapide

1. **Fork le repository**
2. **Clone votre fork** :

   ```bash
   git clone https://github.com/votre-username/journey_mfai_back_front.git
   cd journey_mfai_back_front
   ```

3. **Installez les dépendances** :

   ```bash
   npm run install:all
   ```

4. **Configurez les variables d'environnement** :
   - Copiez les fichiers `.example` dans chaque sous-projet
   - Configurez selon vos besoins locaux
5. **Lancez le projet en développement** :

   ```bash
   ./start_dev.sh
   ```

## 🌿 Workflow Git

### Branches

- `main` : Branche stable, prête pour la production
- `dev` : Branche de développement actif
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `docs/*` : Améliorations de documentation

### Processus de Contribution

1. **Créer une branche** depuis `main` ou `dev` :

   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```

2. **Faire vos modifications** :
   - Suivez les conventions de code (voir ci-dessous)
   - Écrivez des tests si nécessaire
   - Mettez à jour la documentation si besoin

3. **Vérifier le code** :

   ```bash
   npm run lint:all
   npm run test:all
   ```

4. **Commit vos changements** :

   ```bash
   git add .
   git commit -m "feat: description claire de votre changement"
   ```

5. **Push vers votre fork** :

   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```

6. **Créer une Pull Request** vers `main` ou `dev`

## 📝 Conventions de Code

### Messages de Commit

Nous suivons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation uniquement
- `style:` : Formatage, point-virgules manquants, etc.
- `refactor:` : Refactoring de code
- `test:` : Ajout ou modification de tests
- `chore:` : Maintenance, dépendances, etc.

Exemples :

```
feat: ajout du système de staking dans JourneyWorkspace
fix: correction de la gestion des erreurs dans zynoVerticalSlice
docs: mise à jour du README avec les nouvelles dépendances
```

### TypeScript

- **Type checking strict** : Tous les fichiers TypeScript doivent passer `tsc --noEmit`
- **Pas de `any`** : Utilisez des types explicites ou `unknown`
- **Optional chaining** : Préférez `?.` et `??` pour gérer les valeurs undefined/null

### JavaScript (Backend)

- **Node.js prefixes** : Utilisez `node:fs`, `node:path`, etc. pour les modules natifs
- **Modern JS** : Préférez `replaceAll()` à `replace()`, `globalThis` à `window`/`global`
- **Structured clone** : Utilisez `structuredClone()` au lieu de `JSON.parse(JSON.stringify())`

### React/TypeScript (Frontend)

- **Functional components** : Utilisez des composants fonctionnels avec hooks
- **Type safety** : Typage explicite des props et états
- **Keys stables** : Utilisez des clés stables et uniques pour les listes (pas d'index)
- **Accessibilité** : Utilisez des éléments HTML sémantiques (`<button>` au lieu de `role="button"`)

### Linting

- **ESLint strict** : 0 warnings autorisés
- **Prettier** : Formatage automatique activé
- **Vérification avant commit** : `npm run lint:all` doit passer

## 🧪 Tests

### Structure des Tests

- **Unitaires** : `*.test.ts` / `*.test.js` dans chaque sous-projet
- **E2E** : `journey-simulator/tests/e2e/` (Playwright)
- **Coverage** : Objectif de 80%+ de couverture

### Exécuter les Tests

```bash
# Tous les tests
npm run test:all

# Tests backend uniquement
npm run test:back

# Tests frontend uniquement
npm run test:simulator

# Tests E2E
npm run test:e2e:simulator
```

## 📚 Documentation

### Mise à Jour de la Documentation

- **README.md** : Mise à jour si changement d'architecture ou de stack
- **CHANGELOG.md** : Ajout d'une entrée pour chaque changement significatif
- **docs/** : Documentation détaillée dans le dossier `docs/`
- **Commentaires** : Code auto-documenté, commentaires pour la logique complexe uniquement

### Fichiers de Documentation Principaux

- `README.md` : Vue d'ensemble du projet
- `CHANGELOG.md` : Historique des changements
- `MVP_STATUS.md` : État actuel du MVP
- `docs/ARCHITECTURE.md` : Architecture détaillée
- `docs/PLATFORM_DEEP_DIVE_FR.md` : Deep dive produit/tech

## 🔍 Review Process

### Pull Request Checklist

Avant de soumettre une PR, assurez-vous que :

- [ ] Le code passe `npm run lint:all`
- [ ] Les tests passent (`npm run test:all`)
- [ ] La documentation est à jour
- [ ] Les commits suivent les conventions
- [ ] Le code est testé localement
- [ ] Aucun secret/credential n'est exposé

### Review Criteria

Les PRs sont évaluées sur :

1. **Qualité du code** : Lisibilité, maintenabilité, performance
2. **Tests** : Couverture appropriée, tests pertinents
3. **Documentation** : Mise à jour si nécessaire
4. **Conformité** : Respect des conventions et standards
5. **Impact** : Pas de régression, amélioration ou ajout de valeur

## 🐛 Reporting Bugs

### Template de Bug Report

```markdown
**Description** : Description claire du bug

**Reproduction** :
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement attendu** : Ce qui devrait se passer

**Comportement actuel** : Ce qui se passe réellement

**Environnement** :
- OS: [e.g. Linux, macOS, Windows]
- Node.js: [e.g. 18.17.0]
- Navigateur: [e.g. Chrome 120]

**Logs** : Logs pertinents si disponibles
```

## 💡 Proposer des Features

### Template de Feature Request

```markdown
**Problème** : Description du problème à résoudre

**Solution proposée** : Description de la solution

**Alternatives considérées** : Autres solutions envisagées

**Impact** : Impact sur le projet et les utilisateurs
```

## 📞 Contact

Pour toute question ou discussion :

- Ouvrir une issue sur GitHub
- Consulter la documentation dans `docs/`

## 📄 Code of Conduct

Ce projet suit un Code of Conduct. En participant, vous acceptez de respecter ses termes.

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Merci de contribuer à Money Factory AI ! 🚀**

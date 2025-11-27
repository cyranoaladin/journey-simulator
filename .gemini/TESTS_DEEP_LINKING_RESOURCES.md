# Tests Suite - Deep Linking & Resource Validation

## Vue d'ensemble
Suite complète de tests créée pour valider les améliorations de deep linking et de validation des ressources.

## Tests Créés

### 1. Tests Backend

#### Tests Unitaires (`mf-back/tests/unit/`)
- **`resourceValidator.test.js`** ✅ (4/4 passed)
  - Validation des domaines autorisés
  - Rejet des domaines non autorisés
  - Sanitisation des blocs de ressources
  - Sanitisation de réponses complètes

#### Tests d'Intégration (`mf-back/tests/integration/`)
- **`resourceValidator.integration.test.js`** ✅ (4/4 passed)
  - Sanitisation dans le contexte API complet
  - Préservation des blocs non-ressource
  - Gestion des tableaux de ressources vides
  - Gestion des réponses sans ui_blocks

### 2. Tests Frontend

#### Tests Unitaires (`journey-simulator/src/test/`)
- **`Journey.deep-linking.test.tsx`** (À exécuter)
  - Auto-sélection de persona via URL
  - Non-sélection si persona déjà active
  - Gestion des IDs invalides
  - Rendu sans paramètre journeyId
  - Validation de tous les IDs de personas valides

#### Tests E2E (`journey-simulator/tests/e2e/`)

##### Deep Linking
- **`deep-linking.spec.ts`** ✅ (4/4 passed)
  - Navigation directe vers un parcours spécifique via URL
  - Gestion gracieuse des IDs de parcours invalides

##### Navigation Workflow
- **`journey-navigation-workflow.spec.ts`** (Nécessite ajustements)
  - Navigation de la sélection de persona vers l'espace de travail
  - Retour de l'espace de travail vers la sélection
  - Maintien de l'état lors de la navigation entre routes
  - Changement entre différents parcours
  - Navigation navigateur (back/forward)

##### Validation des Ressources
- **`resource-validation.spec.ts`** (Nécessite ajustements)
  - Affichage des ressources avec URLs valides
  - Gestion des ressources avec URLs invalides
  - Copie d'informations de ressource même sans URL

## Résultats

### ✅ Tests Passants
- **Backend Unitaires**: 4/4
- **Backend Intégration**: 4/4
- **E2E Deep Linking**: 4/4

### ⚠️ Tests Nécessitant Ajustements
- **E2E Navigation Workflow**: Échecs dus à l'absence de bouton "Start Journey" dans l'implémentation actuelle
- **E2E Resource Validation**: Échecs dus aux mocks de routes API qui ne correspondent pas exactement au flow réel

## Améliorations Implémentées

### 1. Deep Linking
- Route dynamique `/journeys/:journeyId` ajoutée
- Auto-sélection de persona basée sur l'URL
- Gestion des IDs invalides
- Tests unitaires et E2E complets

### 2. Validation des Ressources
- Utilitaire `resourceValidator.js` créé
- Liste blanche de domaines de confiance
- Sanitisation automatique dans `ZynoAgent`
- Logging des URLs invalides
- Tests unitaires et d'intégration

## Recommandations

### Tests E2E à Ajuster
Les tests E2E de navigation et validation de ressources nécessitent:
1. **Analyse du flow réel**: Inspecter comment les utilisateurs sélectionnent réellement un persona
2. **Mocks API précis**: Aligner les mocks avec les endpoints réels utilisés
3. **Sélecteurs robustes**: Utiliser des data-testid ou des sélecteurs plus spécifiques

### Prochaines Étapes
1. Exécuter les tests unitaires frontend: `npm test src/test/Journey.deep-linking.test.tsx`
2. Ajuster les tests E2E de navigation selon le flow réel
3. Valider manuellement le deep linking en environnement de dev
4. Documenter les URLs de deep linking pour la démo

## Commandes de Test

```bash
# Backend - Tests unitaires
cd mf-back
npm test tests/unit/resourceValidator.test.js

# Backend - Tests d'intégration
npm test tests/integration/resourceValidator.integration.test.js

# Frontend - Tests E2E deep linking
cd journey-simulator
npx playwright test tests/e2e/deep-linking.spec.ts

# Frontend - Tests unitaires (à exécuter)
npm test src/test/Journey.deep-linking.test.tsx
```

## Couverture Fonctionnelle

### Deep Linking ✅
- [x] Route dynamique implémentée
- [x] Auto-sélection de persona
- [x] Gestion des erreurs
- [x] Tests unitaires
- [x] Tests E2E

### Validation des Ressources ✅
- [x] Utilitaire de validation créé
- [x] Intégration dans ZynoAgent
- [x] Liste blanche de domaines
- [x] Tests unitaires
- [x] Tests d'intégration
- [ ] Tests E2E (nécessitent ajustements)

## Notes Techniques

### Domaines Autorisés
La liste blanche inclut:
- Solana ecosystem (solana.com, spl.solana.com, etc.)
- Dev tools (github.com, npmjs.com, etc.)
- Documentation (developer.mozilla.org, react.dev, etc.)
- Social (twitter.com, discord.com, telegram.org, etc.)
- Money Factory AI (moneyfactory.ai)

### Comportement de Sanitisation
- URLs invalides → remplacées par chaîne vide
- Label et description → préservés
- Logging → console.warn pour debugging
- UI → bouton "Ouvrir" masqué si URL vide

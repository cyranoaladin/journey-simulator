# journey-simulator

Brève description du projet (une ligne).

## Installation

Prérequis : Node.js >= 18, npm (ou pnpm/yarn)

```bash
# installer dépendances
npm ci
```

## Usage

Exemples d'utilisation et commandes utiles :

```bash
# lint
npm run lint

# typecheck
npm run typecheck

# tests
npm test

# build
npm run build
```

## Scripts recommandés (package.json)
- "lint": "eslint 'src/**/*.{ts,tsx}' --max-warnings=0"
- "format": "prettier --write ."
- "typecheck": "tsc --noEmit"
- "test": "vitest" (ou "jest")
- "build": "tsc -p tsconfig.build.json" (ou bundler)

## Contribuer

Voir CONTRIBUTING.md (ajouter un guide court ici).

## Licence

Choisir et indiquer une licence (ex : MIT).
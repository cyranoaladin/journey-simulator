# journey-simulator

A TypeScript project to simulate journeys (placeholder description).

## Table of contents
- [About](#about)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Scripts](#scripts)
- [Testing](#testing)
- [Linting and formatting](#linting-and-formatting)
- [Contributing](#contributing)
- [Onboarding checklist](#onboarding-checklist)
- [License](#license)

## About
Provide a brief project description here: purpose, high-level architecture, what the simulator models. Replace this placeholder with project-specific details.

## Prerequisites
- Node.js v18+ (LTS recommended)
- npm (or yarn/pnpm) 

## Installation
Clone the repo and install dependencies:

```bash
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator
npm ci
```

## Development
Run the type checker, linter and tests locally before opening PRs.

## Scripts
Add these scripts to package.json if not present:

```json
{
  "scripts": {
    "lint": "eslint 'src/**/*.{ts,tsx}' --max-warnings=0",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "build": "tsc -p tsconfig.build.json"
  }
}
```

## Testing
Use Vitest or Jest. Example (Vitest):

```bash
npm run test
```

## Linting and formatting
We recommend ESLint + Prettier. Use husky + lint-staged for pre-commit checks.

## Contributing
See CONTRIBUTING.md for the contribution workflow and guidelines.

## Onboarding checklist
See ONBOARDING.md for a step-by-step checklist for new contributors.

## License
This repository currently has no license declared. If you are the repository owner, add a LICENSE file (MIT/Apache-2.0 recommended).

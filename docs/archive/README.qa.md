<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */

# Guide QA – Playwright (Linux Mint)

## Prérequis
- Node >= 18, npm.
- MongoDB local accessible (défaut `mongodb://localhost:27017/journey`).
- Backend écoutant sur `http://127.0.0.1:3002` (prod-like) ou `3000` (dev).

## Seeding prod-like
```bash
npm run seed:test-user
```
Crée `test@mfai.app` / `MFAITest2026!` via le modèle User (hash unique).

## Auth globale Playwright
- Le global setup appelle `/auth/login` et enregistre cookies + localStorage dans `journey-simulator/test-results/.auth/user.json`.
- Point d’API configurable via `BACKEND_URL` (défaut `http://127.0.0.1:3002`).

## Lancer les tests
```bash
cd journey-simulator
BACKEND_URL=http://127.0.0.1:3002 npm run test:full-audit
```
Rapport HTML : `journey-simulator/test-results/html-report/index.html`.

## Visual regression
- Snapshots `toMatchSnapshot` pour Dashboard / Wallet / Artifacts (tests e2e 02-visual-regression).  
- Mettre à jour : `npm run test:visual-update -- --project=chromium`.

## Notes
- Storage state : `journey-simulator/test-results/.auth/user.json`.
- Aucune clé API n’est stockée en dur ; utiliser les variables d’environnement.

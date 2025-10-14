# Journey Web (Next.js)

Architecture premium, sécurisée, browser-first (UI) + backend strict (API).

## Sommaire
- Stack: Next.js 14 (app dir), TailwindCSS
- Wallet: @solana/wallet-adapter (Phantom, extensible)
- API: /api/tx/prepare (web3.js) — construit des transactions non signées côté serveur
- Sécurité: CSP stricte, headers de sécurité, aucun secret côté client
- Tests: unitaires (Jest + RTL) et E2E (Playwright)
- DevOps: Dockerfile multi-stage, échantillons Nginx + systemd
- Observabilité: Sentry (client & serveur) via @sentry/nextjs (DSN via .env)
- CI: GitHub Actions (lint, build, unit, E2E)

## Démarrer

```bash
npm install
# Variables (devnet conseillé)
cp .env.example .env
# Éditez .env et définissez SOLANA_RPC_URL et/ou NEXT_PUBLIC_SOLANA_RPC_URL
npm run dev
```

## Build & exécution
```bash
npm run build
npm start
```

## Tests
- Unitaires (avec couverture minimale backend >=85%):
```bash
npm run test:unit
```
- End-to-end:
```bash
npm run e2e:install   # première fois uniquement (installe les navigateurs)
npm run test:e2e      # lance Playwright, démarre le serveur en mode dev pour éviter les flakes build
```
- Tout vérifier localement (lint + build + unit + e2e):
```bash
npm run verify
```

### Conventions E2E anti-flake
- Utiliser des data-testid stables pour les éléments critiques:
  - /tx: tx-heading, tx-wallet-cta, tx-submit, status
  - /ai: ai-heading, ai-echo-submit, ai-echo-result, ai-echo-error
- Préférer les locators Playwright robustes:
  - getByTestId('...') plutôt que du texte potentiellement localisé
  - Attentes résilientes: toBeVisible/toContainText avec timeout augmenté (jusqu’à 15s)
  - Synchroniser avec le réseau: attendre la réponse /api/ai/echo avant d’asserter le rendu
- Éviter networkidle avec Next.js; préférer les attentes ciblées et expect.poll si nécessaire
- Traces Playwright conservées en cas d’échec (trace: 'retain-on-failure') et uploadées en artifacts CI

Notes:
- Les tests unitaires incluent des mocks pour web3 et l’API route, sans secrets ni réseau.
- Un mode test côté client est proposé via NEXT_PUBLIC_TEST_MODE=1 (bypass de la signature pour E2E si besoin).

## Principes
- Aucune API Node/secret dans le navigateur
- Opérations sensibles (IA/DB/RPC sign, préparation de transactions) côté serveur (app/api)
- Signature côté wallet utilisateur (non-custodial)

## À configurer
- Polices Inter/Poppins si souhaitées (via CSS @font-face global)
- Variables d’environnement (.env)
- web3.js (actuel) ou Metaplex UMI si besoin pour préparer des transactions (voir app/api/tx/prepare)

## Metaplex (devnet) — Mint Certificat NFT (MVP)
- Real devnet path (Phase 2b): un signer isolé (SimSigner) est déjà interfacé; branchement KMS/HSM ensuite.
- Feature flags: ENABLE_UMI_REAL (0 par défaut) pour activer le chemin UMI réel à l’avenir.
- Endpoints: /api/mint/simulate (devnet, dry-run), /api/mint/execute (guarded, kill-switch, MINTER_SECRET_KEY requis)
- UI: /mint, bouton “Simuler mint (devnet)”
- Sécurité: jamais de clé en clair, MINTER_SECRET_KEY via .env; killswitch activable

## Base de données (Prisma + SQLite)
- Modèles: User, Journey, Achievement, MintLog, AgentRun
- Fichier: web/prisma/dev.db
- Commandes:
  - prisma: npm --prefix web run prisma -- --help (ou npx prisma ...)

## Déploiement & CI
- CI GitHub Actions: .github/workflows/ci.yml (Node 20, cache npm, Playwright E2E)

## Déploiement
- Docker (prod):
```bash
docker build -t journey-web:latest .
docker run --env-file .env -p 3000:3000 journey-web:latest
```
- Nginx (reverse proxy): voir deploy/nginx/next.conf.sample
- systemd: voir deploy/systemd/journey-web.service

## Conformité et qualité
- ESLint + Prettier (warnings non bloquants, script format fourni)
- Couverture backend >=85% (API app/api/**)
- CSP stricte (durcie en production)
- Sentry initialisé (DSN via .env)
- Aucun secret en dur (dotenv), HTTPS en prod

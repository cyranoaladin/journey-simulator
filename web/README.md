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

### Santé & métriques
- GET /api/health et GET /api/healthz → simple healthcheck JSON
- GET /api/metrics → métriques internes JSON (compteurs, latence)

## À configurer
- Polices Inter/Poppins si souhaitées (via CSS @font-face global)
- Variables d’environnement (.env)
  - Solana: SOLANA_RPC_URL, NEXT_PUBLIC_SOLANA_RPC_URL, SOLANA_CLUSTER
  - Admin: ADMIN_API_KEY (protège /admin/*)
  - LLM (OpenAI Responses API): OPENAI_API_KEY, OPENAI_BASE_URL (optionnel), LLM_MODEL_NAME, LLM_MAX_OUTPUT_TOKENS, LLM_TEMPERATURE
- web3.js (actuel) ou Metaplex UMI si besoin pour préparer des transactions (voir app/api/tx/prepare)

## Metaplex (devnet) — Mint Certificat NFT (MVP)
- Real devnet path (Phase 2b): un signer isolé (SimSigner) est déjà interfacé; branchement KMS/HSM ensuite.
- Feature flags: ENABLE_UMI_REAL (0 par défaut) pour activer le chemin UMI réel à l’avenir.
- Endpoints:
  - POST /api/mint/simulate (devnet, dry-run)
  - POST /api/mint/execute (guarded, kill-switch, MINTER_SECRET_KEY requis) — supporte l’en-tête `x-user-id` pour associer le mint à un utilisateur
  - GET  /api/mint/last — retourne le dernier mint (filtrable par `x-user-id` ou `?userId=`)
- UI: /mint, bouton “Simuler mint (devnet)” + exécution; toast de succès et lien Explorer après mint
- Sécurité: jamais de clé en clair, MINTER_SECRET_KEY via .env; killswitch activable

## Base de données (Prisma + SQLite)
- Modèles: User, Journey, Achievement, MintLog, AgentRun
- Fichier: web/prisma/dev.db
- Commandes:
  - prisma: npm --prefix web run prisma -- --help (ou npx prisma ...)

### Réinitialiser un utilisateur de démo
- Supprimer les logs et mints de 'demo_user', et (optionnel) réinitialiser un JourneyState:
```bash
# Depuis web/
npm run reset:demo
# Ou, avec un journeyId spécifique
npm run reset:demo -- --journeyId=YOUR_JOURNEY_ID
```

### Migrations / Index
- Dev: appliquez le schéma sans créer de migration (convenable pour SQLite dev)
```bash
npx prisma db push
```
- Prod: créez/validez des migrations et déployez-les
```bash
# Générer une migration locale (exemple)
npx prisma migrate dev -n add_agentlog_user_idx
# Déployer en environnement
npx prisma migrate deploy
```
- Note: un index a été ajouté sur AgentLog(userId, ts) pour accélérer le filtrage ?userId=... sur /admin/logs.

### Admin (dev-only) — Accès protégé par x-api-key
- Pages Admin disponibles pour inspection rapide:
-  - /admin/state → derniers JourneyState (50)
-  - /admin/logs → derniers AgentLog (50) — filtrable via ?journeyId=... et ?userId=...
-  - /admin/users → derniers utilisateurs (20) agrégés depuis AgentLog et MintLog
- Ces routes sont protégées par le middleware (header obligatoire: x-api-key == ADMIN_API_KEY).

Configurer une clé locale (dev):
```bash
# Dans web/.env
ADMIN_API_KEY=dev_admin_key

# Démarrer ensuite
npm run dev
```

Tester en ligne de commande:
```bash
# JourneyState
curl -H 'x-api-key: dev_admin_key' http://127.0.0.1:3000/admin/state

# Agent logs (tous)
curl -H 'x-api-key: dev_admin_key' http://127.0.0.1:3000/admin/logs

# Agent logs (filtrés par journeyId)
curl -H 'x-api-key: dev_admin_key' 'http://127.0.0.1:3000/admin/logs?journeyId=YOUR_JOURNEY_ID'

# Users récents (20 derniers)
curl -H 'x-api-key: dev_admin_key' http://127.0.0.1:3000/admin/users
```

Snippet JS (Node 18+, fetch natif):
```js
const API_KEY = process.env.ADMIN_API_KEY || 'dev_admin_key'
const BASE = process.env.ADMIN_BASE_URL || 'http://127.0.0.1:3000'

async function getState(){
  const res = await fetch(`${BASE}/admin/state`, { headers: { 'x-api-key': API_KEY } })
  if(!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function getLogs(journeyId){
  const url = new URL(`${BASE}/admin/logs`)
  if(journeyId) url.searchParams.set('journeyId', journeyId)
  const res = await fetch(url, { headers: { 'x-api-key': API_KEY } })
  if(!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

;(async()=>{
  console.log('State:', await getState())
  console.log('Logs:', await getLogs(process.env.JOURNEY_ID))
})().catch(console.error)
```

Note: En production, utilisez une vraie valeur de secret (vault/CI secrets), et ne laissez pas la clé par défaut.

## Déploiement & CI
- CI GitHub Actions: .github/workflows/ci.yml (Node 20, cache npm, Playwright E2E)
- CD par tags SemVer: .github/workflows/release.yml (push sur vX.Y.Z)
  - Étapes: lint, build, unit, E2E, artifacts (coverage + Playwright)
  - Optionnel: upload des sourcemaps Sentry si SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT sont configurés
  - Optionnel: build & push image Docker si DOCKER_REGISTRY/DOCKER_USERNAME/DOCKER_PASSWORD/DOCKER_IMAGE sont définis

### CI/CD Secrets & post-deploy checks
- Secrets requis/optionnels (Repository Settings → Secrets and variables → Actions):
  - DATABASE_URL: utilisé par le job deploy-migrate (Prisma migrate deploy)
  - HEALTHCHECK_BASE_URL: base publique (ex: https://app.example.com) pour le job post-deploy-health
  - ADMIN_API_KEY: clé d’accès admin pour le smoke test /admin/state
  - (Optionnels) SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT, DOCKER_*
- Jobs:
  - deploy-migrate: applique les migrations Prisma en prod (condition: DATABASE_URL défini)
  - post-deploy-health: vérifie /api/healthz et /admin/state (condition: HEALTHCHECK_BASE_URL défini; ADMIN_API_KEY requis pour /admin/state)

## Déploiement
- Docker (prod):
```bash
docker build -t journey-web:latest .
docker run --env-file .env -p 3000:3000 journey-web:latest
```
- Nginx (reverse proxy): voir deploy/nginx/next.conf.sample
- systemd: voir deploy/systemd/journey-web.service

### Publication (tag SemVer)
- Créez un tag versionné pour déclencher la release CI/CD:
```bash
git tag v1.0.0
git push origin v1.0.0
```
- Secrets optionnels à renseigner dans GitHub Actions (Repository Settings → Secrets and variables → Actions):
  - SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT (upload sourcemaps)
  - DOCKER_REGISTRY, DOCKER_USERNAME, DOCKER_PASSWORD, DOCKER_IMAGE (push image)

### Déploiement VPS (Nginx + systemd/pm2)

Prérequis VPS:
- Ubuntu 22.04+, Node.js 20+, npm, git, sqlite3 (si SQLite), Nginx
- DNS pointé vers le VPS

Étapes (utilisateur non-root avec sudo):
1) Récupérer le code et configurer l’environnement
```bash
cd /opt
sudo mkdir -p journey-web && sudo chown "$USER":"$USER" journey-web
cd journey-web
# Cloner votre dépôt
git clone <repo_url> .
# Installer les dépendances
npm ci
# Variables d’environnement
cp .env.example .env
# Ouvrez .env et renseignez:
# - OPENAI_API_KEY
# - SOLANA_RPC_URL / NEXT_PUBLIC_SOLANA_RPC_URL
# - ADMIN_API_KEY
# - MINTER_SECRET_KEY (devnet) & KILL_SWITCH
```

2) Build + migrations Prisma (production)
```bash
# Build Next.js
npm run build
# Appliquer les migrations Prisma (prod)
npx prisma migrate deploy --schema web/prisma/schema.prisma
```

3) Lancement via systemd (recommandé)
- Adaptez le service (deploy/systemd/journey-web.service) puis copiez-le:
```bash
sudo cp deploy/systemd/journey-web.service /etc/systemd/system/journey-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now journey-web
sudo systemctl status journey-web --no-pager
```
- Exemple de points à vérifier dans l’unité systemd:
  - WorkingDirectory=/opt/journey-web/web
  - EnvironmentFile=/opt/journey-web/web/.env
  - ExecStart=npm start --prefix /opt/journey-web/web

4) Reverse proxy Nginx + TLS
```bash
# Copiez le modèle et adaptez le server_name / proxy_pass
sudo cp deploy/nginx/next.conf.sample /etc/nginx/sites-available/journey-web
sudo ln -s /etc/nginx/sites-available/journey-web /etc/nginx/sites-enabled/journey-web
sudo nginx -t && sudo systemctl reload nginx
# (Optionnel) Certbot / acme.sh pour TLS
```

5) Alternative pm2 (si vous préférez pm2 à systemd)
```bash
npm i -g pm2
pm2 start npm --name journey-web -- start --prefix ./web
pm2 save
pm2 startup  # génère la commande à exécuter pour l’autostart
```

6) Vérifications post-déploiement
- /api/healthz → { ok: true }
- /api/metrics → JSON métriques
- /admin/* → nécessite x-api-key (ADMIN_API_KEY)
- Logs journalctl (systemd) ou pm2 logs

Note sécurité:
- Aucune clé en clair en front (NEXT_PUBLIC_* seulement publiques)
- HTTPS obligatoire en prod
- Activez le KILL_SWITCH si besoin pour bloquer l’exécution on-chain

## Conformité et qualité
- ESLint + Prettier (warnings non bloquants, script format fourni)
- Couverture backend >=85% (API app/api/**)
- CSP stricte (durcie en production)
- Sentry initialisé (DSN via .env)
- Aucun secret en dur (dotenv), HTTPS en prod

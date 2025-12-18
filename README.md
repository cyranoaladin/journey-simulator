# Money Factory AI — Journey Monorepo

Monorepo “journey.mfai.app” : backend API (`mf-back`), UI React/Vite (`journey-simulator`), et portail Next.js (`web`).

## 🧭 Produit (source de vérité)

- **6 personas**: `cognitive-activation-hub`, `capital-foundry`, `system-architect`, `experience-studio`, `impact-engine`, `resilience-master`
- **6 phases (Launch last)**: Learn → Build → Prove → Activate → Scale → **Launch (Collaterize simulation)**
- **MVP**: testnet/devnet, “building in public”

La source de vérité des personas/phases côté UI est `journey-simulator/src/data/personas.ts`.

## ✅ Prérequis

- Node.js **>= 18**
- Docker + Docker Compose (recommandé pour un run complet)

## 🚀 Démarrage rapide (Docker, recommandé)

```bash
# depuis la racine
./start_dev.sh
```

Services (dev) :
- **API (mf-back)**: `http://localhost:3002`
- **UI (journey-simulator)**: `http://localhost:3003`

## 🧪 Tests / Lint

```bash
npm run install:all
npm run lint:all
npm run test:all
npm run build:all
```

## 🔐 Variables d'environnement

- Dev backend: `mf-back/env.development.example`
- Prod backend: `mf-back/env.production.example`
- Déploiement: `.deploy.env` / `.deploy.env.example`

## 📚 Docs clés

- Deep dive: `docs/PLATFORM_DEEP_DIVE_FR.md`
- Déploiement: `DEPLOY.md`, `DEPLOY_SERVER.md`, `docker-compose.prod.yml`

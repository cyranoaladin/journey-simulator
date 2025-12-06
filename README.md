# Money Factory AI - Monorepo

Welcome to the Money Factory AI platform monorepo.
This repository hosts the complete stack for the Cognitive Activation Protocol™ platform.

## 🏗️ Structure

-   **`mf-back`**: Node.js Express Backend. Handles AI agents, Journey state machine, and MongoDB data.
-   **`journey-simulator`**: React (Vite) Frontend. The interactive simulation experience.
-   **`web`**: Next.js Portal. Marketing, Dashboard, and Wallet identity source of truth.

## 🚀 Quickstart for Developers

### Prerequisites
-   Node.js 18+
-   MongoDB (running locally or URI provided)
-   PostgreSQL (optional, for `web` portal)

### 1. Setup Environment
Copy example env files and adjust as needed:
```bash
cp mf-back/.env.example mf-back/.env
cp journey-simulator/.env.example journey-simulator/.env
cp web/.env.example web/.env
```

### 2. Install Dependencies
Install all dependencies from the root:
```bash
npm run install:all
```

### 3. Run Development Servers
You can run services individually:
```bash
npm run dev:back       # Starts backend on :3000
npm run dev:simulator  # Starts simulator on :5173
npm run dev:web        # Starts portal on :3001
```

### 4. Run Tests
```bash
npm run test:all       # Runs unit tests for all projects
npm run lint:all       # Runs lint checks
npm run test:e2e:simulator # Runs Playwright E2E for simulator
```

## 📦 Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment modes:
-   **Mode A**: VPS + PM2 (Bare Metal)
-   **Mode B**: Docker Compose

## 📚 Documentation
-   **Architecture**: [docs/ARCHITECTURE_DATA.md](docs/ARCHITECTURE_DATA.md)
-   **Auth Flows**: [docs/AUTH_FLOWS.md](docs/AUTH_FLOWS.md)
-   **Agent Runs**: [docs/AGENT_RUNS.md](docs/AGENT_RUNS.md)
-   **Journey State**: [docs/JOURNEY_STATE_MACHINE.md](docs/JOURNEY_STATE_MACHINE.md)
-   **Healthcheck**: [docs/HEALTHCHECK.md](docs/HEALTHCHECK.md)

---
*Legacy info preserved for reference:*

## Pitch
- Plateforme scalable, modulaire, extensible
- IA multi-agent, RAG, blockchain intégrée
- UX gamifiée, traçabilité, sécurité

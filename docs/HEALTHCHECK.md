<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->


## 👁️ Observability Update – mf-back

**Date**: 6 December 2025
**Scope**: Added Agent Runs logging and Health checks

### New Endpoints

-   `GET /api/agents/runs`: List agent executions.
-   `GET /api/agents/runs/:id`: Detailed run info.
-   `GET /api/health`: Service status (MongoDB, Uptime).

### Security Audit (mf-back)
-   **Last Verified**: 6 December 2025
-   **Status**: 0 Vulnerabilities (Fixed `jws` high severity via `npm audit fix`)
-   **Frequency**: Run `npm audit` monthly or before release.

### Investor Demo
- **URL**: `/demo/investor`
- **Verification**:
    1. Visit `/demo/investor`.
    2. Click "Launch Interactive Demo".
    3. Verify simulator loads "Capital Foundry".
    4. Admin Dashboard (`/admin/journeys/metrics`) should increment "Investor Demo Runs".

## 🌐 Health & Security – web

**Scope**: Next.js Frontend & API Routes

### Healthcheck
-   **Endpoint**: `GET /api/health` (Returns `{ status: 'ok' }`)
-   **CLI Verification**: `npm run verify` (Runs lint, build, unit tests, e2e)

### Security Audit
-   **Last Verified**: 6 December 2025
-   **Status**: 0 Vulnerabilities
-   **Action Taken**: Applied `npm audit fix --force` to resolve critical Next.js/Playwright issues.
-   **Note**: `eslint-config-next` was downgraded to matching version to resolve peer dependency conflicts.

## 🎮 Health & Security – journey-simulator

**Scope**: Vite SPA (React)

### Healthcheck
-   **Build Check**: `npm run build`
-   **Lint/Test**: `npm run lint && npm test`

### Security Audit
-   **Last Verified**: 6 December 2025
-   **Status**: Known Vulnerabilities (Vite/jsPDF)
-   **Action Required**: Major version upgrades required. deferred to dedicated refactor.
-   **Reference**: See [DEPENDENCIES_JOURNEY_SIMULATOR.md](./DEPENDENCIES_JOURNEY_SIMULATOR.md) for details.

### Logging

-   All agent executions via `BaseAgent` are now logged to the `AgentRun` collection in MongoDB (voir [docs/AGENT_RUNS.md](docs/AGENT_RUNS.md)).
-   Les flux RAG associés (ingestion, snippets) suivent le runbook [docs/RAG_OPERATIONS.md](docs/RAG_OPERATIONS.md) pour les contrôles et alertes.
-   Tracks inputs, outputs, success/failure status, and duration.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

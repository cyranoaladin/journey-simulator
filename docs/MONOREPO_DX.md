<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Monorepo Developer Experience & Workspace Plan

## Current Status
We currently operate as a **Polyrepo-style Monorepo** without workspace tooling (npm/yarn/pnpm workspaces). Each package (`mf-back`, `journey-simulator`, `web`) has its own `node_modules` and lockfile.

## Future Target Structure

We aim to migrate to a standard workspace structure to share dependencies and code efficiently.

### Proposed Directory Layout

```
/
├── apps/
│   ├── journey-simulator  (moved from root)
│   ├── web                (moved from root)
│   └── mf-back            (moved from root)
├── packages/
│   ├── shared-types       (new)
│   ├── shared-ui          (future)
│   └── shared-utils       (future)
├── package.json           (root workspace config)
├── pnpm-workspace.yaml    (if using pnpm)
└── turbo.json             (for task orchestration)
```

## Tooling Recommendation

**Recommendation: pnpm workspaces + Turborepo**

-   **pnpm**: Superior disk space efficiency and strict dependency management (avoids phantom dependencies).
-   **Turborepo**: Fast, incremental builds and task orchestration (`turbo run test`, `turbo run build`).

### Pros vs npm workspaces
-   Faster installation.
-   Better handling of duplicate dependencies.
-   Native support for monorepo patterns.

## Migration Steps

1.  **Preparation**:
    -   Consolidate tooling versions (Node 20+).
    -   Standardize scripts (done in this PR).

2.  **Move to Workspaces**:
    -   Create `pnpm-workspace.yaml`.
    -   Move directories to `apps/`.
    -   Update CI paths.

3.  **Shared Packages**:
    -   Extract common types (e.g., `User`, `Journey`, `AgentRun`) to `@mf/shared-types`.
    -   Consume this package in `mf-back`, `web`, and `journey-simulator`.

4.  **CI/CD Update**:
    -   Update `deploy_pm2.sh` and `Dockerfile` to handle workspace paths.

## Candidates for Shared Code

1.  **`@mf/shared-types`**:
    -   TypeScript interfaces for API responses.
    -   Domain models (`Journey`, `AgentRun`).
2.  **`@mf/shared-utils`**:
    -   Validation logic (Zod schemas).
    -   Formatting helpers.

## API Contracts

We use OpenAPI 3.1 to define the contract between `mf-back` and frontends. This enables automatic client generation (see `journey-simulator/src/api/mf-back-client.ts`), ensuring type safety across the network boundary.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

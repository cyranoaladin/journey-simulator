# Dependency Shield Global Rule

## Objective
Ensure monorepo consistency and core dependency stability.

## Rules
- **Solana Alignment**: Ensure `@solana/web3.js` versions are aligned across `journey-simulator` and `mf-back`.
- **Zustand Persistence**: Ensure `journeyStore.ts` uses consistent persistence versions.
- **Conflict Resolution**: Proactively check for peer dependency conflicts during `npm install` cycles.

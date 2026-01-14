# MFAI Monorepo — Vue d’ensemble (Claude Code)

## Architecture

- Frontend `journey-simulator/` : React 19 + Vite + Tailwind + Zustand, UI Blocks (Trinity Layout).
- Backend `mf-back/` : Express + Mongo + OpenAI SDK, orchestre Zyno (agents, mémoire, routes `/journey`, `/api/agents/*`).
- Web portal `web/` : Next.js (App Router) + Prisma + Postgres + BullMQ, intégration wallet/mint.
- Ports (dev par défaut) : simulator 3003, mf-back 3002, web 3001.

## Commandes globales (depuis la racine)

- Installer tout : `npm run install:all`
- Dev full-stack (concurrently) : `npm run dev`
- Build full : `npm run build:all`
- Tests full : `npm run test:all`
- Lint full : `npm run lint:all`
- Preflight (santé locale) : `npm run preflight`
- CI locale complète : `npm run ci:verify`
- Diagnostic Claude : `claude doctor`

## Workflow Git

- Branche courante : respecter la convention interne (feature/*, fix/*).
- Pre-commit : `lint-staged` + `npm run test:fast` (mf-back ciblé).
- Commits : messages courts, orientés impact (ex. `fix: csrf guard middleware path`).
- Ne pas pousser de secrets/.env ; voir règles de sécurité dans `.claude/settings.json`.
- Après inspection Git (checkout hash), toujours revenir à la branche initiale.

## Contexte Claude Code

- Filtres MCP et agents définis dans `.claude/`.
- Réduire le contexte avec `.claudeignore` (builds, assets lourds, locks).
- Modèles : par défaut Sonnet ; pour tâches légères (doc/logs) utiliser `--model claude-3-haiku-20240307`. Garder les fichiers CLAUDE/*.json stables pour profiter du cache de prompts.
- MCP : `postgres-local` (web/Prisma), `git-history`. Optionnel : commenter/activer un inspecteur de logs Zyno dans `.claude/mcp.json`.
- Agents : `@ZynoArchitect`, `@FrontendMaster`, `@SolanaGuard`, `@QA-Sentinel` (tests only).

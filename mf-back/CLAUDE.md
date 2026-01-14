# mf-back — Claude Code Brief

## Tech & Entrées
- Stack : Node.js/Express, Mongo (Mongoose), OpenAI SDK, Pino/Morgan, csurf/helmet.
- Port dev : 3000 (proxifié en 3002 via docker-compose/nginx).
- Scripts : `npm start` (prod), `npm run dev` (nodemon), `npm test`, `npm run test:coverage`, `npm run compliance:check`.

## Architecture Zyno
- Agents définis sous `agents/` (registry + prompts). Orchestration dans `routes/zyno-routes.js` + services sous `orchestration/`.
- Mémoire : `memory/agent_memory.js` (persistance JSON, fallback), orchestrateur gère `agent_runs`, `history`.
- Intents / routing : `orchestration/zynoVerticalSlice.js` + `orchestration/zynoOrchestrator.js` ; `ragClient.js` pour RAG, `scoringService.js` pour scoring.
- Middleware sécurité : `helmet`, `cors`, `csrfGuard` (custom + csurf), rate limiting (via express-rate-limit dans app.js si activé).

## Règles de code
- Controllers sous `controllers/`, routes sous `routes/`, services/orchestration sous `orchestration/`.
- Erreurs : utiliser `next(createError(...))` ou réponses JSON structurées `{ success: false, error }`.
- Logging : `debug` pour dev ciblé, `pino`/`morgan` pour requêtes ; éviter `console.log` en prod.
- Tests : Jest + Supertest (`__tests__/`, `tests/`), respecter SKIP_DB_CONNECTION pour unitaires.

## Commandes utiles
- Lancer API : `npm run dev`
- Tests unit/intégration : `npm test`
- Couverture : `npm run test:coverage`
- Compliance : `npm run compliance:check`
- Lint rapide (pre-commit hook) : `npm run test:fast` depuis la racine.

## Points d’attention Claude
- Pas de secrets en clair (.env bannis). Respecter ports invariants (3002 exposé via compose).
- Ne pas déplacer la logique runtime hors mf-back sans demande explicite.
- Pour RAG, vérifier `RAG_SEARCH_URL`/`RAG_INDEX_NAME` avant modifications. 
- CSRF : `csrfGuard` + `csurf` conditionnel, tests alignés ; ne pas retirer sans motif.
- Mémoire : `memory/agent_memory.js` fallback en RO ; tenir compte des erreurs EROFS (compose read_only).

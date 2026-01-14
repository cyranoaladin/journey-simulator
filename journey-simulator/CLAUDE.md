# journey-simulator — Claude Code Brief

## Tech
- React 19 + TypeScript + Vite + Tailwind + Framer Motion.
- State : Zustand (`journeyStore.ts`, `tokenStore.ts`), Playwright pour E2E, Vitest pour unitaires.
- Port dev : 3003 (vite).

## Commandes
- Dev : `npm run dev`
- Build : `npm run build` (tsc + vite)
- Lint : `npm run lint`
- Tests unitaires : `npm run test`
- Tests E2E : `npm run test:e2e` (Playwright), variantes `test:e2e:smoke`, `test:full-audit`.
- Typecheck : `npm run typecheck`
- Génération API TS depuis OpenAPI : `npm run generate:api`

## Design System — Trinity Layout
- Layout 3 zones : Navigator (gauche), Zyno Pulse/Console (droite), Central Stage (UI Blocks).
- UI Blocks rendus via `components/UIBlocks/UIBlocksRenderer.tsx` (quiz, missions, analytics…).
- Animations : Framer Motion, suivre spacing Tailwind et glassmorphism (bordures/blur).
- Accessibilité : pas de clés React sur index, role/button + tabIndex + onKeyDown pour éléments interactifs non natifs.

## State & API
- `journeyStore` : gère `runMode`, `apiJourneyId`, `userProgress`, `lastStep`. Toujours passer par les actions fournies (setRunMode, ensureApiJourneyId, runInteractiveStep…).
- API facade : `src/utils/api.ts` agrège `api-modules/*` (API_BASE_URL résolu via env). Éviter d’appeler fetch direct ; préférer `api.*`.
- `tokenStore` : stockage des tokens (localStorage). Ne pas injecter de secrets dans le bundle.

## Tests / QA
- Playwright config sous `tests/e2e`; fixtures `realModeTest.ts` pour mode real (headers).
- Vitest : dossiers `src/**/__tests__` + utils.
- Storybook : `npm run storybook` / `build-storybook` si besoin visuel.

## Bonnes pratiques Claude
- Garder le contexte léger : éviter d’inclure assets/public dans prompts.
- Respecter le Trinity Layout et les UI Blocks existants au lieu de recréer des composants parallèles.
- Pour les flows E2E réels, vérifier `RUN_MODE` et stockage d’accessToken dans `tests/e2e/fixtures/realModeTest.ts`.

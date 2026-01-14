# web — Claude Code Brief

## Tech
- Next.js (App Router) + TypeScript, Tailwind, React 18.3.
- Prisma (Postgres), BullMQ/ioredis pour workers, Sentry intégré.
- Solana wallet adapters (Phantom/Solflare/Torus), mint worker (`scripts/run-mint-worker.ts`).
- Port dev/prod : 3001.

## Commandes
- Dev : `npm run dev`
- Build : `npm run build`
- Start : `npm start`
- Lint : `npm run lint`
- Tests unitaires : `npm run test:unit`
- Tests e2e : `npm run test:e2e` (Playwright)
- Vérif complète : `npm run verify`
- Prisma seed : `npx prisma db push && npx prisma db seed` (seed défini dans `prisma/seed.ts`)
- Worker mint : `npm run worker:mint` (requiert Redis + RPC Solana)

## Pratiques
- Config env via `.env` (non partagée) : Postgres/Redis/Solana RPC.
- API routes dans `app/api/*`; workers/queues dans `scripts/`.
- Wallet & mint : vérifier `worker:mint`, dépend de Redis + Postgres + RPC Solana.
- Sentry : activé via `@sentry/nextjs`; respecter instrumentation existante.
- Prisma : migrations contrôlées, vérifier `prisma/schema.prisma` avant push/seed ; DSN via env uniquement.

## Claude Tips
- Éviter d’inclure `.next`, assets lourds, dumps Prisma dans le contexte (voir `.claudeignore`).
- Pour requêtes DB, préférer Prisma Client existant ; ne jamais hardcoder DSN.

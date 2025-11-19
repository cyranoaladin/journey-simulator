# Onboarding (≤2h)

1) Prérequis: Node 20, npm, sqlite3, Phantom (devnet)
2) cd web && npm ci
3) cp .env.example .env et renseigner: OPENAI_API_KEY, SOLANA_RPC_URL, NEXT_PUBLIC_SOLANA_RPC_URL, ADMIN_API_KEY
4) npx prisma db push
5) npm run dev
6) Tests: npm run verify
7) Démo: suivre docs/demo/script.md

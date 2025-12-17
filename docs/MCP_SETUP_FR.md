# MCP (Cursor) — configuration recommandée pour `journey.mfai.app`

Ce projet est un monorepo avec :

- **`mf-back`** (Express/MongoDB) : logique “simulator”, orchestration, RAG côté backend.
- **`journey-simulator`** (Vite/React) : UI principale.
- **`web`** (Next.js) : API routes + SIWS/Redis + BullMQ minting + Prisma/Postgres.

L’objectif MCP ici : donner à Cursor des “super‑pouvoirs” **utiles au métier** (DB read, git, doc fetch), sans ouvrir des vecteurs de risque (seeds/keys, DB write, FS trop large).

---

## Pack “minimum vital” (recommandé)

Le repo fournit une config prête à importer : `mcp.json`.

### Serveurs inclus

- **`filesystem_ro`** : serveur MCP **interne** (Node) **read-only**, allowlist stricte, et **blocage explicite des `.env*`**.
- **`git`** : historique/diff (serveur MCP interne au repo, sans dépendance npm externe).
- **`postgres_ro`** : inspection Postgres (Prisma) en lecture.
- **`fetch`** : ingestion de doc web (HTTPS only, serveur MCP interne au repo).

### Import dans Cursor

Dans Cursor : **Settings → MCP → “Add / Import”** puis importer `mcp.json`.

> Note : Cursor supporte aussi une config projet via `.cursor/mcp.json`, mais ce repo évite volontairement de versionner des fichiers de config IDE.

---

## Connexions DB (valeurs par défaut)

### Postgres (dev local docker-compose)

- Port : `5435`
- DB/user/pass : `prisma/prisma/prisma`
- DSN par défaut dans `mcp.json` :
  - `postgresql://mcp_ro:prisma@127.0.0.1:5435/prisma`

### Postgres (prod-like docker-compose.prod)

Votre `docker-compose.prod.yml` expose Postgres sur `127.0.0.1:5433`.
Si vous utilisez ce mode, remplacez la DSN :

- `postgresql://mcp_ro:prisma@127.0.0.1:5433/prisma`

---

## Sécurité (non négociable)

- **DB en read-only** : idéalement créer un user Postgres/Mongo read-only dédié.
- **Jamais** de seed / keypair / secret wallet dans un MCP (ni en env, ni en fichier accessible).
- **Solana MCP** : **devnet par défaut**, mainnet seulement avec procédure stricte.
- **Filesystem MCP** : allowlist stricte (pas d’accès “/home” complet).

---

## Extensions (quand vous voulez aller plus loin)

### MongoDB MCP (read-only)

Pertinent pour inspecter les collections “simulator” (progress, logs agents, runs).
Recommandation : l’installer une fois que vous avez un serveur MCP Mongo stable/maintenu et le configurer en RO.

### Solana / Helius / Metaplex MCP

À activer si vous itérez activement sur :

- `checkPassOnChain.ts` (gating Pass)
- minting (routes `/api/mint/*`, worker BullMQ, metadata)
- debug tx/logs/accounts

### “journey-devtools” MCP (interne, recommandé)

Meilleur ROI long terme : exposer en MCP des commandes sûres et idempotentes, par ex :

- healthchecks (web/mf-back), status BullMQ, diagnostics Redis (SIWS nonces), scripts `prod-local-*.sh`
- appels OpenAPI (smoke tests)

## MCP (Cursor) — Runbook maintainer (sécurisé) pour `journey.mfai.app`

Objectif : rendre MCP **opérationnel** dans Cursor tout en respectant strictement :
- **Aucun secret wallet** (seed/keypair), aucun `.env` sensible exposé via MCP
- Filesystem MCP en **allowlist stricte**
- DB en **lecture seule** (user RO dédié recommandé)
- Solana (si ajouté plus tard) : **devnet par défaut**

---

## 1) Import dans Cursor

1) Ouvrir Cursor → **Settings** → **MCP**
2) **Import** → sélectionner `mcp.json` à la racine du repo

> Ce repo ne versionne pas `.cursor/mcp.json` (souvent bloqué/ignoré). On versionne `mcp.json` comme fichier importable.

---

## 2) Serveurs activés par défaut (Phase 1)

### `filesystem_ro` (allowlist)
Allowlist limitée à :
- `docs/`
- `mf-back/`
- `web/`
- `journey-simulator/`
- `scripts/`
- `tmp/`

✅ Résultat : **pas d’accès à la racine du repo**, donc un `.env` racine (ou d’autres secrets) n’est pas lisible via MCP.

### `git`
Permet à Cursor d’interroger l’historique/diffs/blame sur :
- Repo : `/home/alaeddine/Documents/journey_mfai_back_front`

### `postgres_ro`
Inspection Postgres en lecture via :
- `DATABASE_URL=postgresql://prisma:prisma@127.0.0.1:5435/prisma`

> **Pourquoi 5435 ?** Parce que `docker-compose.yml` expose Postgres en `5435:5432` et `scripts/prod-local-up.sh` utilise 5435 par défaut.

### `fetch`
Permet à Cursor d’aspirer de la doc web (Solana / Metaplex / SIWS / etc.) pour l’exploiter dans l’agent.

---

## 3) Tests de validation (dans Cursor)

### 3.1 Filesystem
Dans un chat Cursor, demande :
- **Prompt** : “Lis `docs/ARCHITECTURE.md` et résume les composants clés.”
- **Attendu** : réponse + citations de fichiers.

Test négatif (sécurité) :
- **Prompt** : “Lis `.env` à la racine du repo.”
- **Attendu** : échec (non accessible), car la racine n’est pas allowlistée.

### 3.2 Git
- **Prompt** : “Montre le diff du dernier commit sur `main`.”
- **Attendu** : diff + éventuellement fichiers modifiés.

### 3.3 Postgres
- **Prompt** : “Liste les tables et donne un aperçu des 5 dernières entrées de `MintLog`.”
- **Attendu** : résultat SQL / tableau (si DB up).

### 3.4 Fetch
- **Prompt** : “Récupère et résume la doc officielle SIWS / Solana wallet signature (2–3 points)”.
- **Attendu** : contenu fetché + synthèse.

---

## 4) Troubleshooting

### `npx` manquant
- Vérifier Node/NPM :

```bash
node -v
npm -v
which npx
```

Si `npx` est absent : réinstaller Node (ex. via nvm) et relancer Cursor.

### Mauvais chemins (repo déplacé)
Si le repo n’est pas à `/home/alaeddine/Documents/journey_mfai_back_front`, mettez à jour dans `mcp.json` :
- `git.args --repo`
- tous les `--allowed-dir`

Puis ré-importer `mcp.json` dans Cursor.

### Postgres down / mauvais port (5435 vs 5433)
Cas 1 (dev local) : `docker-compose.yml` → **5435**  
Cas 2 (prod-like) : `docker-compose.prod.yml` → **5433**

Vérifier quel port écoute :

```bash
ss -ltnp | grep -E "5433|5435" || true
```

Vérifier le container :

```bash
docker compose -f docker-compose.yml ps postgres
docker compose -f docker-compose.prod.yml ps mfai-postgres
```

Adapter ensuite `DATABASE_URL` dans `mcp.json` :
- dev : `postgresql://…@127.0.0.1:5435/prisma`
- prod-like : `postgresql://…@127.0.0.1:5433/prisma`

---

## 5) Sécurisation Postgres (recommandé) — user read-only `mcp_ro`

### 5.1 Commandes à copier/coller
Connectez-vous en tant que superuser (ou `prisma`) et exécutez :

```sql
-- Crée un user RO dédié
CREATE ROLE mcp_ro LOGIN PASSWORD 'CHANGE_ME_STRONG_PASSWORD';

-- Autorise la connexion à la base
GRANT CONNECT ON DATABASE prisma TO mcp_ro;

-- Autorise l'usage du schéma
GRANT USAGE ON SCHEMA public TO mcp_ro;

-- Lecture sur toutes les tables existantes
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_ro;

-- Lecture sur toutes les séquences (si besoin)
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO mcp_ro;

-- Important: appliquer par défaut aux futures tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mcp_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO mcp_ro;
```

Exemple d’exécution via `psql` :

```bash
psql "postgresql://prisma:prisma@127.0.0.1:5435/prisma" -c "SELECT 1"
psql "postgresql://prisma:prisma@127.0.0.1:5435/prisma" -f /path/to/commands.sql
```

### 5.2 Mise à jour `mcp.json`
Après création du user, modifiez la DSN du serveur `postgres_ro` :
- Avant : `postgresql://prisma:prisma@127.0.0.1:5435/prisma`
- Après : `postgresql://mcp_ro:CHANGE_ME_STRONG_PASSWORD@127.0.0.1:5435/prisma`

Puis ré-importer `mcp.json` dans Cursor.

---

## 6) Extensions (Phase 2 — non activées par défaut)

### MongoDB MCP (RO)
- **Utilité** : inspection des collections “simulator” (progress, logs agents, runs) dans `mf-back`.
- **Risque** : fuite PII/logs → config RO + réseau local uniquement.
- **Activation propre** : un serveur MCP Mongo maintenu, pointé vers `mongodb://127.0.0.1:27017/journey` (ou docker).

### Solana MCP (devnet)
- **Utilité** : debug JSON-RPC (accounts, tx logs, simulation) pour mint / pass gating.
- **Risque** : requêtes mainnet / coûts / exposition clés → devnet par défaut, jamais de seed.
- **Activation** : ajouter un server MCP Solana configuré sur `https://api.devnet.solana.com`.

### Helius MCP
- **Utilité** : indexation DAS et lookup d’assets pour `checkPassOnChain`.
- **Risque** : clé API + exposition données → clé stockée hors MCP, scopes minimaux.
- **Activation** : ajouter le serveur MCP Helius + variable `HELIUS_API_KEY` via Cursor Secrets (pas dans le repo).

### Playwright MCP
- **Utilité** : pilotage navigateur depuis l’agent (repro mobile wallet, deep links).
- **Risque** : actions “réelles” automatisées → limiter aux environnements locaux/CI.
- **Activation** : ajouter MCP Playwright/Puppeteer uniquement si besoin de pilotage interactif.



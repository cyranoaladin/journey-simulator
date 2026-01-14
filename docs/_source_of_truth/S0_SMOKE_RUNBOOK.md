<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# S0 Smoke Runbook (prod-safe, AS-IS)

Runbook S0 = **contrat minimal** + **commande** + **quoi collecter en cas d’échec**.

## Contrat S0 Health (AS-IS, sans ambiguïté)

### Public (OBLIGATOIRE)

- `GET /` (UI)
- `GET /api/health` (API `mf-back` via Nginx)

**Important (S0)** :

- **Aucun autre endpoint public de santé n’est supposé.**
- Les endpoints `mf-back` **non préfixés `/api`** (`/health`, `/healthz`, `/readyz`) sont **LOCALHOST ONLY** en S0, **sauf** si une config Nginx serveur prouve explicitement le contraire (hors scope ici).

### Localhost (OBLIGATOIRE)

Sur le serveur, sur `mf-back` (port 3002) :

- `GET http://127.0.0.1:3002/healthz`
- `GET http://127.0.0.1:3002/readyz`
- `GET http://127.0.0.1:3002/api/health`

### Localhost (OPTIONNEL)

Uniquement si les ports écoutent sur le serveur :

- UI : `GET http://127.0.0.1:3003/`
- web (Next API-only) : `GET http://127.0.0.1:3001/api/health` et `GET http://127.0.0.1:3001/api/healthz`

## Script

- Fichier : `scripts/s0_smoke_server.sh`
- Propriétés :
  - Bash `set -euo pipefail`
  - Ne print **aucun secret**
  - Read-only : `curl`, `docker ps`, `docker inspect`, `nginx -t` (optionnel), `ss`
  - Sortie : **PASS/FAIL** + liste des raisons (+ WARN non bloquants)

## Exécution (on-call)

Depuis le repo sur le serveur (ex: `/srv/journey-mfai`) :

```bash
chmod +x scripts/s0_smoke_server.sh
./scripts/s0_smoke_server.sh
```

Domaine différent (rare) :

```bash
S0_DOMAIN=journey.mfai.app ./scripts/s0_smoke_server.sh
```

Capture de sortie (recommandé) :

```bash
./scripts/s0_smoke_server.sh 2>&1 | tee /tmp/mfai_s0_smoke.txt
```

## Interprétation (junior-friendly)

### RESULT: PASS

- UI publique répond (HTTP 200–399) sur `/`
- API publique répond (HTTP 200) sur `/api/health`
- `mf-back` répond localement (HTTP 200) sur `/healthz`, `/readyz`, `/api/health`

### WARNINGS (non bloquants)

- Outils manquants (`nginx` absent, `docker ps` interdit sans permissions)
- Ports optionnels non présents (3001/3003)
- Checks optionnels (UI/web en localhost) en erreur

### RESULT: FAIL

Un check **obligatoire** a échoué. Priorité de tri :

1) **Local mf-back** (3002) down → backend/containers
2) **Public /api/health** down → proxy/TLS/DNS ou backend down
3) **Public /** down → proxy/UI container

## En cas d’échec : “evidence pack” à coller dans le chat

Collez d’abord : la sortie complète du script (`/tmp/mfai_s0_smoke.txt` si vous l’avez).

Ensuite exécutez et collez :

### 1) Contexte machine

```bash
date -u
uname -a
```

### 2) Ports & listeners (read-only)

```bash
ss -lntp | egrep ':(3001|3002|3003)\b' || true
```

### 3) Docker (read-only)

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
```

Health status si disponible :

```bash
for c in $(docker ps -q); do
  name=$(docker inspect -f '{{.Name}}' "$c" | sed 's#^/##')
  hs=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$c")
  echo "$name $hs"
done
```

### 4) Nginx (optionnel)

```bash
nginx -t || true
systemctl status nginx --no-pager || true
tail -n 120 /var/log/nginx/journey.mfai.app.error.log || true
```

### 5) cURL ciblés (sans secrets)

Local (mf-back) :

```bash
curl -sv http://127.0.0.1:3002/healthz 2>&1 | tail -n 80
curl -sv http://127.0.0.1:3002/readyz 2>&1 | tail -n 80
curl -sv http://127.0.0.1:3002/api/health 2>&1 | tail -n 120
```

Public :

```bash
curl -sv https://journey.mfai.app/ 2>&1 | tail -n 80
curl -sv https://journey.mfai.app/api/health 2>&1 | tail -n 120
```

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

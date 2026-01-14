<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# MFAI — Runtime / Infra Reality (Production)

This document is intended to prevent tooling (Cursor) and contributors from making incorrect runtime assumptions.

## Hard facts (do not guess)
- **UI**: `journey-simulator` runs on **port 3003**
- **Journey runtime API**: `mf-back` runs on **port 3002**
- **Next API-only service**: `web` runs on **port 3001**
- **Reverse proxy**: host **Nginx** (no Traefik, no Kubernetes)
- **Routing**: `/api/*` currently routes to **mf-back**
- **Exposure**: `web` is **not exposed yet** in production
- **Constraint**: zero-downtime; use **progressive routing by path**
- **Redis**: required by some flows but may not be present; validate before relying on it

## Where to verify in this repo
- Compose:
  - `docker-compose.prod.yml`
  - `docker-compose.deploy.yml`
- Deployment:
  - `DEPLOY_SERVER.md`
  - `DEPLOYMENT_INSTRUCTIONS.md`
- Health:
  - `docs/HEALTHCHECK.md`

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

# DOCS_OPERATIONS — Money Factory AI

Rôle: SOP de maintenance et supervision (Head of Ops & SRE). Objectif: préserver 100% de dispo et de résilience prouvées.

## 1. Monitoring Zyno (Real-time Pulse)
- Cible: WebSocket Zyno via mfai-api (port 3002). Vérifier l’upgrade 101 vers `ws://localhost:3002/orchestration/stream`.
- Sonde latence: journaliser `time_connect` et `time_first_byte` sur le WS; alerte si latence > 2s.
- Sonde API: `curl -f http://localhost:3002/orchestration/mode` ; alerte si HTTP 500 ou délai > 2s.
- Logs ciblés: `docker logs mfai-api --tail=200 | grep orchestration`.
- Alerting: seuils critiques → Pager/Slack SRE si (latence WS > 2s) OU (HTTP 5xx sur /orchestration/mode).

## 2. Procédure Hot-Fix (Blue/Green Docker Compose)
- Principe: reconstruire un service sans interrompre l’autre (frontend vs backend).
- Frontend seul: `docker compose -f docker-compose.deploy.yml build mfai-web && docker compose -f docker-compose.deploy.yml up -d mfai-web`
- Backend seul: `docker compose -f docker-compose.deploy.yml build mfai-api && docker compose -f docker-compose.deploy.yml up -d mfai-api`
- Blue/Green simplifié (tag provisoire): `docker compose -f docker-compose.deploy.yml -p mfai-green up -d mfai-web` puis bascule DNS/port; après validation, `docker compose -f docker-compose.deploy.yml -p mfai-blue down`.
- Vérification post-déploiement: `curl -I http://localhost:3003` (web) et `curl -f http://localhost:3002/api/health` (api). Aucun downtime attendu.

## 3. Gestion Incidents DB (Persistence Recovery)
- Mongo (journey):
  - Backup: `docker exec mfai-mongo sh -c 'mongodump --db journey --out /backup/journey_$(date +%F_%H%M)'`
  - Restore: `docker exec mfai-mongo sh -c 'mongorestore --drop /backup/journey_YYYY-MM-DD_HHMM/journey'`
- Postgres (web):
  - Backup: `docker exec mfai-postgres pg_dump -U postgres mfai > backups/pg_mfai_$(date +%F_%H%M).sql`
  - Restore: `docker exec -i mfai-postgres psql -U postgres mfai < backups/pg_mfai_YYYY-MM-DD_HHMM.sql`
- Redis (drain & clean en cas de corruption): `docker exec mfai-redis redis-cli FLUSHALL` (à coupler avec redémarrage contrôlé des workers).
- Après toute restauration: relancer mfai-api et mfai-web, puis rejouer `tools/system-health.js` pour valider JWT, RAG, mémoire.

## 4. Audit de Sécurité Quotidien
- ReadOnly + Non-root (live):  
  - `docker exec mfai-api sh -c 'id && mount | grep \" / \" && test -w / || echo readonly_ok'`  
  - `docker exec mfai-web sh -c 'id && mount | grep \" / \" && test -w / || echo readonly_ok'`
- CSP unifiée: `curl -I http://localhost:3003 | grep -i content-security-policy`
- Scan RBAC bypass (logs): `docker logs mfai-api --since=1h | grep -Ei \"(unauthorized|forbidden|rbac|permission)\"`
- Secret leak guard: `scripts/scan-token-leaks.sh` (existe dans artifacts); alerte si OPENAI_API_KEY ou JWT_SECRET sont détectés.

## Runbook d’alerte (résumé)
- Dégradation WS/latence: vérifier mfai-api (health, logs), puis redéployer mfai-web ou mfai-api en blue/green.
- Erreur 500 /orchestration/mode: relancer mfai-api, valider Mongo/Redis, purger cache si nécessaire.
- Corruption DB: restaurer Mongo/Postgres selon les commandes ci-dessus, flusher Redis, redémarrer services, rejouer `tools/system-health.js`.

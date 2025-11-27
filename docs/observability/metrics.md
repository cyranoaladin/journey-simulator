# Observabilité & Metrics

Endpoints
- GET /api/health, /api/healthz → disponibilité
- GET /api/metrics → JSON (compteurs simples). Option Prometheus possible ultérieurement.

Compteurs (web/src/server/metrics.ts)
- visits, healthHits, echoHits, txPrepared

Admin (protégé par x-api-key): pages à activer si nécessaire (logs/state/users).

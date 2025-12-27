# Observabilité & Metrics

Endpoints

- GET /api/health, /api/healthz → disponibilité
- GET /api/metrics → JSON (compteurs simples). Option Prometheus possible ultérieurement.
- GET /readyz → readiness (Mongo connecté, dépendances critiques prêtes)

Compteurs (web/src/server/metrics.ts)

- visits, healthHits, echoHits, txPrepared

Admin (protégé par x-api-key): pages à activer si nécessaire (logs/state/users).

## Intégration des probes /healthz et /readyz

- **Polling orchestrateur** : `journey-simulator/src/components/Zyno/ZynoConsole.tsx` interroge désormais `/healthz` (liveness) et `/readyz` (readiness) toutes les 60s et affiche les statuts dans le header Mission Control. Un clic sur "Refresh" force un nouveau hit – pratique pendant les démos.
- **Dashboards externes** : ajoutez ces endpoints comme checks HTTP (BetterStack, UptimeRobot, Grafana Synthetic Monitoring). Exemple d’entrée YAML :

```yaml
- name: mfai-back-healthz
  method: GET
  url: https://api.moneyfactory.ai/healthz
  expectStatus: 200
  tags: [liveness, orchestrator]
- name: mfai-back-readyz
  method: GET
  url: https://api.moneyfactory.ai/readyz
  expectStatus: 200
  retry: 2
  tags: [readiness, mongo]
```

- **Automation simple** :

```bash
curl -sf ${API_BASE_URL:-http://localhost:3000}/healthz >/dev/null && \
curl -sf ${API_BASE_URL:-http://localhost:3000}/readyz >/dev/null
```

Déployez la commande ci-dessus dans vos cron/agents Ansible pour alimenter vos tableaux de bord SIEM.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

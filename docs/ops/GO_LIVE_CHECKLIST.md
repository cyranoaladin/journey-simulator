# GO_LIVE_CHECKLIST

## Pré-release (blocant)
- [ ] `npm run release:preflight` (status OK)
- [ ] `npm run release:smoke` (PASS)
- [ ] `npm run release:smoke-e2e` (PASS) si disponible
- [ ] `KILL_SWITCH=false` et `EXECUTION_ENABLED=false`
- [ ] Clé `OPENAI_API_KEY` présente en PROD ou fallback DEMO validé

## Configuration runtime
- [ ] `CONCURRENCY_MAX_RUNNING` et `CONCURRENCY_MAX_QUEUE` adaptés au trafic attendu
- [ ] `DEMO_MODE` désactivé sauf besoin démo (LLM mock forcé)
- [ ] `REAL_EXECUTION_MODE` absent ou `shadow` (pas de side-effect par défaut)

## Vérifications observabilité/HA
- [ ] `systemStatus.circuitBreakers` tous `CLOSED`
- [ ] `ops.concurrency.shed === false`
- [ ] `systemStatus.alerts` sans CRITICAL
- [ ] `systemStatus.runtime.coldStart === false` après premier run

## Go-live
- [ ] Lancer `npm run release:go-live` (enchaîne preflight + smoke-e2e + snapshot SLO)
- [ ] Publier le log JSON de sortie dans le canal ops

## Post-go-live (surveillance courte)
- [ ] Surveiller alertes CRITICAL (latence p95, queue shed, cold starts)
- [ ] Vérifier aucune ouverture durable de circuit breaker
- [ ] Confirmer absence de `load_shed` ou `cost_block` dans `ops.fallbacks`

## Rollback rapide (si anomalie)
- [ ] `npm run release:rollback`
- [ ] Réactiver `DEMO_MODE=true` si besoin de démo safe
- [ ] Relancer smoke (`npm run release:smoke`)

## Docs liées
- `docs/ops/RUNBOOK_PROD.md`
- `docs/ops/INCIDENT_MATRIX.md`

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

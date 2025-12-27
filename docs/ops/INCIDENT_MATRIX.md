# INCIDENT_MATRIX

| Incident | Signal / Détection | Action immédiate | Fallback attendu | Vérification |
| --- | --- | --- | --- | --- |
| Latence p95 CRITICAL | Alerte CRITICAL `orchestration_latency_p95` | Activer kill switch REAL_ONLY, réduire `CONCURRENCY_MAX_RUNNING`, relancer smoke | DRY_RUN, `ops.execution.mode=DRY_RUN` | `systemStatus.alerts` retombe à WARN/OK |
| Queue saturation | `ops.concurrency.shed=true` ou SLO queue shed | Limiter trafic, augmenter capacité, vérifier RUNTIME_ENV | DRY_RUN + `load_shed` | `ops.concurrency.shed=false` |
| Circuit breaker OPEN | `systemStatus.circuitBreakers.*.state=OPEN` | Forcer mock LLM, attendre demi-vie, analyser `reason` | LLM mock, DRY_RUN | CB repasse `CLOSED` |
| Cold starts répétés | Alerte `cold_start_rate` | Stabiliser déploiements, vérifier crash logs, augmenter TTL in-memory si besoin | DRY_RUN, pas de perte ops | `systemStatus.runtime.coldStart=false` |
| Web3 guard BLOCK | `systemStatus.web3.level=BLOCK` | Rester en DRY_RUN, corriger payload proof/anchor/mint | DRY_RUN, ops.blockReasons contient `web3_*` | Guard repasse WARN/OK |
| Budget coût BLOCK | `cost_block` ou `cost_budget_exceeded` | Forcer mock LLM, réduire topK/maxTokens, revoir budget constraints | DRY_RUN | `ops.costGuards` sans `cost_block` |
| Kill switch manuel | `systemStatus.killSwitch.active=true` | Confirmer portée (ALL / REAL_ONLY), communiquer, garder DRY_RUN | DRY_RUN | Kill switch désactivé proprement |
| Idempotent replay massif | `systemStatus.idempotent=true` fréquent | Vérifier clients, augmenter TTL stores si besoin, surveiller audit trail | Réponses réutilisées, pas d’exception | Diminution replays |
| Audit trail saturé | `audit.entriesStored` proche max | Purger via `release:rollback`, augmenter `MAX_ENTRIES` si approprié | DRY_RUN | Compteur retombe sous seuil |
| DEMO_MODE oublié | Résultats trop stables / ops.fallbacks contient `demo_mode` en PROD | Désactiver `DEMO_MODE`, rétablir clés, relancer smoke | LLM réel ou mock contrôlé | Disparition `demo_mode` |

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# RUNBOOK_PROD

## Objectif
Procédure courte pour exploiter Zyno en production sans effets de bord et avec diagnostics activables en quelques secondes.

## Vérifications préalables (blocking)
- `npm run release:preflight` (doit renvoyer status OK)
- `npm run release:smoke` (smoke S0 local sans HTTP, DRY_RUN)
- `npm run release:smoke-e2e` (smoke API/e2e si disponible)

## Démarrage / Redémarrage
- Vérifier `KILL_SWITCH` à `false` et `EXECUTION_ENABLED` absent ou `false`.
- Lancer le service (`start_dev.sh` ou PM2 selon l’environnement).
- Sur premier run, vérifier `systemStatus.runtime.coldStart === true` puis qu’il repasse à `false` après quelques requêtes.

## Supervision temps-réel (léger)
- Observer les logs JSON (level INFO/WARN/CRITICAL).
- `systemStatus.circuitBreakers` : tout doit être `CLOSED`.
- `ops.concurrency` : `shed` doit rester `false`; si `true`, réduire le trafic entrant.
- `systemStatus.alerts` : traiter en priorité les CRITICAL (latence p95, queue shed, cold start répétés).

## Actions courantes
- **Activer kill switch** : `KILL_SWITCH=true` (scope ALL par défaut) puis redéployer/reloader. Vérifier `systemStatus.killSwitch.active`.
- **Purger stores volatils** : lancer `npm run release:rollback` (purgé idempotency/audit/memory + kill switch ALL).
- **Forcer mode démo** : `DEMO_MODE=true` (LLM mock, RAG local, sorties stables).
- **Shadow REAL** : `REAL_EXECUTION_MODE=shadow` (comparaison DRY_RUN vs REAL simulé, aucun side-effect).

## Signaux d’alerte (SLO/HA)
- Alerte CRITICAL latence p95 → vérifier surcharge, réduire `CONCURRENCY_MAX_RUNNING`, activer kill switch REAL_ONLY.
- Circuit breaker OPEN → LLM forcé mock, DRY_RUN : surveiller cause (`reason`), attendre demi-vie avant reset.
- Queue `shed=true` → montée en charge trop forte : augmenter ressources ou baisser trafic.
- Cold starts fréquents → vérifier déploiements trop rapprochés ou crashes.

## Sortie de route / Récupération
- Si outputs incohérents : activer `KILL_SWITCH=ALL`, purger stores (`release:rollback`), relancer smoke S0.
- Si Web3 guard BLOCK répété : vérifier payloads proof/anchor/mint et rester en DRY_RUN.

## Documentation associée
- `docs/ops/GO_LIVE_CHECKLIST.md`
- `docs/ops/INCIDENT_MATRIX.md`

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

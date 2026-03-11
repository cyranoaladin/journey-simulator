# SOVEREIGN OPERATIONS MANUAL (MFAI-OPS)

**Authors**: Antigravity & Command
**Version**: 1.0.0 (Genesis)
**Status**: GENESIS_READY

## 🚀 1. IGNITION (Launch Sequence)
To deploy the full Money Factory AI Sovereign System in production mode:

```bash
./scripts/sovereign-up.sh
```

*This script verifies environment variables, checks RPC endpoints, and launches the Docker Swarm.*

## 👁️ 2. SURVEILLANCE (Swarm Monitoring)
Access the Command Center to monitor the pulse of all **51 Agents**:

- **URL**: `http://localhost:3002/admin/command-center` (Protected)
- **Metrics**: Check for `HEARTBEAT_LOSS` or `LATENCY_SPIKE`.
- **Drill-down**: Click any agent ID to view its internal logs (Postgres: `agent_runs`).

## 🚨 3. EMERGENCY PROTOCOLS
### Case: `SECURITY_SCAN_FAIL`
If the automated sentinels detect a breach or anomaly:

1.  **KILL SWITCH**: Executed automatically, but manual override is:
    ```bash
    export MFAI_EMERGENCY_STOP=true
    docker-compose -f docker-compose.prod.yml restart api
    ```
2.  **ROLLBACK**:
    ```bash
    ./scripts/sovereign-snapshot.sh --restore latest
    ```
    *Restores the last sealed Neural Snapshot from `artifacts/backups`.*

## 🛡️ MAINTENANCE
- **Logs**: `docker logs -f mfai_neural_core`
- **Backups**: Auto-generated daily at 00:00 UTC via cron.

---
**VERDICT**: SYSTEM IS AUTONOMOUS. TRUST THE SWARM.

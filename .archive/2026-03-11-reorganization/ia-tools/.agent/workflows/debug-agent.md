---
description: Debug Agent health and orchestration logs.
---
# Debug Agent Workflow

1. Check Deep Health Endpoint.
   // turbo
   ```bash
   curl -s http://localhost:3002/api/health/deep | python3 -m json.tool
   ```

2. Stream Zyno Orchestrator logs.
   ```bash
   # Tail the logs for the Orchestrator service (adjust path if log file differs)
   # Assuming logs are piped to stdout or a specific file. For now, we check the running process output if captured.
   echo "Check the terminal where 'npm run start' is running for Zyno logs."
   ```
   
   Alternatively, if you want to test the orchestrator specifically:
   ```bash
   node mf-back/scripts/orchestration-diagnose.js
   ```

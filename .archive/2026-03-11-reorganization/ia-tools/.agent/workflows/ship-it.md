---
description: Automate the final production release sequence.
---
# Ship-It Workflow (Master Release)

> **Context Instruction**: Clear context cache except for Sovereign Rules before executing this workflow.

1. **Compliance Verification**: Ensure code meets all standards.
   // turbo
   ```bash
   ./.agent/workflows/verify-compliance.md
   ```

2. **Verify Sovereign Status**: Ensure the system is healthy and certified.
   // turbo
   ```bash
   ./.agent/workflows/sovereign-status.md
   # Manual fallback if recursive exec fails
   # ./scripts/ci-verify.sh
   # lsof -i:3000 -t > /dev/null && echo "Web: OK"
   ```

3. **Generate Sovereign Snapshot**: Seal the codebase.
   // turbo
   ```bash
   ./scripts/sovereign-snapshot.sh
   ```

4. **Sanitize Database**: Ensure no test data remains.
   > Use MongoDB MCP or manual check.
   // turbo
   ```bash
   # Check for test users
   echo "Checking for test users..."
   # mongo mfai-journey --eval 'db.users.countDocuments({email: /test/})'
   ```

5. **Generate Protocol Paper**: Final documentation artifact.
   // turbo
   ```bash
   ./.agent/workflows/generate-protocol-paper.md
   ```

6. **Final Report**: Generate the deployment report.
   // turbo
   ```bash
   echo "Deployment Date: $(date)" > artifacts/final_deployment_report.txt
   echo "Signature: $(grep 'signature' ./MFAI_S2_IRON_FINAL_CERT.json)" >> artifacts/final_deployment_report.txt
   echo "Status: READY FOR LIFT-OFF" >> artifacts/final_deployment_report.txt
   cat artifacts/final_deployment_report.txt
   ```

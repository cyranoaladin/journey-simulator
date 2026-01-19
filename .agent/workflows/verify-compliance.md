---
description: Verify compliance by running CI checks and R1 (English-only) scans.
---
# Compliance Verification Workflow

1. Execute the main verification script.
   ```bash
   ./scripts/ci-verify.sh
   ```

2. Run the R1 (English-Only) Scan.
   // turbo
   ```bash
   grep -r "[àâäéèêëîïôöùûüç]" --include="*.{js,ts,tsx,md}" . | grep -v "node_modules" | grep -v ".git" || echo "R1 Scan Passed: No French characters found."
   ```

3. Analyze results.
   - If `ci-verify.sh` fails, check the logs under `artifacts/`.
   - If French characters are found, use the `fix-r1.js` script if applicable, or manually correct them.

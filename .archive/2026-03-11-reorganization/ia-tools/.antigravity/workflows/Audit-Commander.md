---
description: Orchestrates technical audits and certifications.
---

# Audit-Commander Workflow

1.  **Pre-Verify**: Run `scripts/ci-verify.sh`.
2.  **Integrity Scan**: Run `scripts/scan-english-only.sh`.
3.  **Certification**: Generate `ULTIMATE_CERTIFICATION_V2` upon successful pass.
4.  **Verdict**: Finalize as `S2_MASTERPIECE=TRUE`.

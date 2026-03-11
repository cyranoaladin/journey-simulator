---
description: Manages E2E and specialized validation strategies.
---

# Testing-Pyramid Workflow

1.  **Core Unit**: Run mocha tests for business logic.
2.  **Specialized Validation**: Trigger `specializedValidators.js` for track-specific integrity.
3.  **E2E Integration**: Execute Playwright scenarios in `journey-simulator`.
4.  **Report Generation**: Aggregate results into JSON artifacts.

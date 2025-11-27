---
description: Verify Demo Mode Functionality
---

This workflow verifies that the "Load Demo State" functionality works correctly by running backend checks and frontend E2E tests.

1. Check Backend API Response
   Run a curl command to verify the backend returns the `progress` object.
   
   ```bash
   curl -X POST http://localhost:3002/journey/load-demo -H "Content-Type: application/json" -d '{"personaId": "capital-foundry"}' | grep "progress"
   ```

2. Run E2E Tests
   Run the Playwright E2E test for demo mode.
   
   ```bash
   cd journey-simulator && npx playwright test tests/e2e/demo-mode.spec.ts
   ```

3. Manual Verification Steps
   - Open the application in your browser.
   - Ensure you are logged out or in a fresh session.
   - Click "Load Demo State" on any journey card.
   - Verify redirection to Workspace.
   - Verify XP is updated.
   - Verify phases are marked as completed.

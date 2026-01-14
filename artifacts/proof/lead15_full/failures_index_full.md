# Failures Index (Auto-Generated)

## Console/Font/Network (1)

### 1. should switch to Simulation mode and update UI
- **Project**: chromium
- **File**: `01-navigation/header-navigation.spec.ts`
- **Error**: `Error: locator.isVisible: Error: strict mode violation: locator('[data-testid="app-loading"]') resolved to 2 elements:`
```text
Error: locator.isVisible: Error: strict mode violation: locator('[data-testid="app-loading"]') resolved to 2 elements:
    1) <div data-testid="app-loading" class="flex min-h-screen items-center justify-center bg-[#09081a] text-slate-400">…</div> aka getByTestId('app-loading').first()
    2) <div data-testid="app-loading" class="flex min-h-[30vh] items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-200">Loading experience...</div> aka getByText('Loading experience...')

Call log:
```


## Timeout/Navigation (35)

### 1. Header: Verify all top-level links are strictly visible and clickable
- **Project**: chromium
- **File**: `01-navigation/comprehensive-menu.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 2. Menu Dropdown: strict verification of all items
- **Project**: chromium
- **File**: `01-navigation/comprehensive-menu.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 3. Menu Navigation: DAO
- **Project**: chromium
- **File**: `01-navigation/comprehensive-menu.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 4. Menu Navigation: Zyno Console
- **Project**: chromium
- **File**: `01-navigation/comprehensive-menu.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 5. Menu Navigation: Resources
- **Project**: chromium
- **File**: `01-navigation/comprehensive-menu.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 6. should handle invalid demo journey ID
- **Project**: chromium
- **File**: `01-navigation/error-pages.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveURL[2m([22m[32mexpected[39m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveURL[2m([22m[32mexpected[39m[2m)[22m failed

Expected pattern: [32m/\/journeys\/demo$/[39m
Received string:  [31m"http://localhost:3000/journeys/demo/invalid-persona-id"[39m
Timeout: 30000ms
```


### 7. should display all header navigation elements
- **Project**: chromium
- **File**: `01-navigation/header-navigation.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 8. should switch to Demo mode and update UI
- **Project**: chromium
- **File**: `01-navigation/header-navigation.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m`
```text
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m"demo"[39m
Received: [31m"real"[39m

```


### 9. should navigate to Journeys page
- **Project**: chromium
- **File**: `01-navigation/header-navigation.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 10. should open Menu dropdown
- **Project**: chromium
- **File**: `01-navigation/header-navigation.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 11. should navigate to DAO from Menu
- **Project**: chromium
- **File**: `01-navigation/header-navigation.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 12. Mode Switching: Demo -> Simulation -> Real -> Demo with API Context Check
- **Project**: chromium
- **File**: `01-navigation/mode-persistence.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m`
```text
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m"simulation"[39m
Received: [31m"real"[39m

```


### 13. Mode Context: API Headers reflect mode
- **Project**: chromium
- **File**: `01-navigation/mode-persistence.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeAttached[2m([22m[2m)[22m failed

Locator: getByTestId('nav-menu-journeys').first()
Expected: attached
Timeout: 5000ms
```


### 14. Phase 1: Mission -> Agent -> Resource -> Dashboard
- **Project**: chromium
- **File**: `02-agent-core/phase-1-discovery.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByTestId('journey-recent-outputs')
Expected: visible
Timeout: 15000ms
```


### 15. Phase 2 Transition: Discovery -> Strategy -> Plan Generation
- **Project**: chromium
- **File**: `02-agent-core/phase-2-strategy.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('h1').filter({ hasText: 'Strategy' })
Expected: visible
Timeout: 10000ms
```


### 16. Journey workspace has zero console errors
- **Project**: chromium
- **File**: `02-visual-regression/console-guard.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 30000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first() to be visible[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/02-visual-regression/console-guard.spec.ts:18:27
```


### 17. Trinity layout: Navigator, Pulse, Stage have no overlap
- **Project**: chromium
- **File**: `02-visual-regression/layout-trinity.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByTestId('trinity-layout')
Expected: visible
Timeout: 30000ms
```


### 18. No unintended horizontal scroll in Trinity layout
- **Project**: chromium
- **File**: `02-visual-regression/layout-trinity.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 60000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 60000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/02-visual-regression/layout-trinity.spec.ts:114:27
```


### 19. Screenshot: Journey workspace (desktop)
- **Project**: chromium
- **File**: `02-visual-regression/screenshots-desktop.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 15000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/02-visual-regression/screenshots-desktop.spec.ts:48:27
```


### 20. Simulate InvestorDemoAgent execution and verify dashboard summary
- **Project**: chromium
- **File**: `03-agent-workflows/resource-production.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 10000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for locator('article').filter({ has: getByRole('heading', { name: 'The Cognitive Activation Hub' }) })[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/03-agent-workflows/resource-production.spec.ts:117:27
```


### 21. Journey completion state is tracked correctly
- **Project**: chromium
- **File**: `03-user-workflows/journey-completion.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 10000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/03-user-workflows/journey-completion.spec.ts:21:27
```


### 22. Persona can onboard and access journey workspace
- **Project**: chromium
- **File**: `03-user-workflows/persona-onboarding.spec.ts`
- **Error**: `TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.`
```text
TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('[data-testid="app-shell"], [data-testid="app-error"]') to be visible[22m

    at waitForAppReady (/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/helpers/hardening.ts:67:31)
```


### 23. Journey phases progress correctly with state persistence
- **Project**: chromium
- **File**: `03-user-workflows/phase-progression.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 10000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/03-user-workflows/phase-progression.spec.ts:20:27
```


### 24. Unauthorized access is blocked at UI and API level
- **Project**: chromium
- **File**: `03-user-workflows/rbac-enforcement.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 15000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/03-user-workflows/rbac-enforcement.spec.ts:23:27
```


### 25. Resources unlock after phase completion
- **Project**: chromium
- **File**: `03-user-workflows/resource-unlock.spec.ts`
- **Error**: `TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.`
```text
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for locator('article') to be visible[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/03-user-workflows/resource-unlock.spec.ts:19:20
```


### 26. quiz pass and mint queued (mocked backend)
- **Project**: chromium
- **File**: `04-core-game-loop.spec.ts`
- **Error**: `TimeoutError: locator.click: Timeout 60000ms exceeded.`
```text
TimeoutError: locator.click: Timeout 60000ms exceeded.
Call log:
[2m  - waiting for locator('[data-testid="journey-card"]').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/04-core-game-loop.spec.ts:67:21
```


### 27. Journey workspace surfaces intel panels in real mode
- **Project**: chromium
- **File**: `04-dashboard-intel/resource-rendering.spec.ts`
- **Error**: `TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.`
```text
TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('[data-testid="app-shell"], [data-testid="app-error"]') to be visible[22m

    at waitForAppReady (/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/helpers/hardening.ts:67:31)
```


### 28. Zyno chat panel opens and displays messages without console errors
- **Project**: chromium
- **File**: `04-dashboard-intel/zyno-chat-scroll.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 15000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/04-dashboard-intel/zyno-chat-scroll.spec.ts:25:27
```


### 29. Chat messages scroll behavior is stable
- **Project**: chromium
- **File**: `04-dashboard-intel/zyno-chat-scroll.spec.ts`
- **Error**: `TimeoutError: locator.waitFor: Timeout 15000ms exceeded.`
```text
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('article').first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/04-dashboard-intel/zyno-chat-scroll.spec.ts:68:27
```


### 30. UI Runtime English Compliance - Guide Page
- **Project**: chromium
- **File**: `99-english-compliance/ui-runtime.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed`
```text
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('h1')
Expected: visible
Timeout: 30000ms
```


### 31. Dashboards & Navigation Consistency Check
- **Project**: chromium
- **File**: `supreme-auditor.spec.ts`
- **Error**: `TimeoutError: locator.fill: Timeout 60000ms exceeded.`
```text
TimeoutError: locator.fill: Timeout 60000ms exceeded.
Call log:
[2m  - waiting for getByLabel('Email Address')[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/supreme-auditor.spec.ts:9:48
```


### 32. Visual Integrity: Z-Index Check (Toast vs Banner)
- **Project**: chromium
- **File**: `supreme-auditor.spec.ts`
- **Error**: `TimeoutError: locator.evaluate: Timeout 60000ms exceeded.`
```text
TimeoutError: locator.evaluate: Timeout 60000ms exceeded.
Call log:
[2m  - waiting for locator('div').filter({ hasText: /Demo Mode|Mode Démo/i }).first()[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/supreme-auditor.spec.ts:101:38
```


### 33. Security Breach: Mode Mismatch Rejection
- **Project**: chromium
- **File**: `supreme-integrity.spec.ts`
- **Error**: `TimeoutError: page.waitForRequest: Timeout 60000ms exceeded while waiting for event "request"`
```text
TimeoutError: page.waitForRequest: Timeout 60000ms exceeded while waiting for event "request"
    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/supreme-integrity.spec.ts:22:33
```


### 34. UI Stress: Double-Click Protection
- **Project**: chromium
- **File**: `supreme-integrity.spec.ts`
- **Error**: `TimeoutError: locator.fill: Timeout 60000ms exceeded.`
```text
TimeoutError: locator.fill: Timeout 60000ms exceeded.
Call log:
[2m  - waiting for getByPlaceholder('Email')[22m

    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/supreme-integrity.spec.ts:59:79
```


### 35. Real Mode Integrity: Headers and Data Sync
- **Project**: chromium
- **File**: `supreme-isolation.spec.ts`
- **Error**: `[31mTest timeout of 120000ms exceeded.[39m`
```text
[31mTest timeout of 120000ms exceeded.[39m
```


## Data/Store (2)

### 1. Two users have isolated orchestration state
- **Project**: chromium
- **File**: `05-agents-orchestration/multi-user-isolation.spec.ts`
- **Error**: `AxiosError: Request failed with status code 500`
```text
AxiosError: Request failed with status code 500
    at settle (/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/node_modules/axios/lib/core/settle.js:19:12)
    at IncomingMessage.handleStreamEnd (/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/node_modules/axios/lib/adapters/http.js:793:11)
    at Axios.request (/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/node_modules/axios/lib/core/Axios.js:45:41)
    at ensureUserAndLogin (/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/helpers/authStates.ts:68:9)
```


### 2. Solana: Real Transaction Proof
- **Project**: chromium
- **File**: `supreme-integrity.spec.ts`
- **Error**: `Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeDefined[2m()[22m`
```text
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeDefined[2m()[22m

Received: [31mundefined[39m
    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/supreme-integrity.spec.ts:143:27
```


## Other (1)

### 1. Navigation flow has zero console errors
- **Project**: chromium
- **File**: `02-visual-regression/console-guard.spec.ts`
- **Error**: `Error: Console/page errors detected (1 total):`
```text
Error: Console/page errors detected (1 total):
  1. [CONSOLE ERROR] Failed to load resource: the server responded with a status of 404 (Not Found)
    at Object.assertNoErrors (/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/helpers/console-guard.ts:49:23)
    at /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/02-visual-regression/console-guard.spec.ts:46:15
```



**Total Failures:** 39

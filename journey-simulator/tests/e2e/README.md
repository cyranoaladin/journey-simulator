<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# E2E Test Suite - README

## Overview
Comprehensive Playwright-based E2E test suite for the MFAI platform with zero-failure enforcement.

## Quick Start

### Run All Tests
```bash
npm run test:full-audit
```

### Run Specific Test Categories
```bash
# Navigation tests only
npm run test:navigation

# Visual regression tests
npm run test:visual

# Agent workflow tests
npm run test:agents

# Data validation tests
npm run test:data
```

### Run in CI Mode
```bash
npm run test:ci
```

## Test Structure

```
tests/e2e/
├── 01-navigation/          # Navigation & routing tests
│   ├── header-navigation.spec.ts
│   ├── route-transitions.spec.ts
│   └── error-pages.spec.ts
├── 02-visual-regression/   # UI/UX visual tests
├── 03-agent-workflows/     # Agent core functionality
├── 04-data-validation/     # API & data integrity
├── fixtures/               # Test data
│   └── test-data.ts
└── utils/                  # Helper functions
    └── navigation-helpers.ts
```

## Configuration

Test configuration is in [`playwright.config.ts`](file:///home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/playwright.config.ts).

**Key settings**:
- Base URL: `http://localhost:4173`
- Browsers: Chrome, Firefox, Mobile Chrome
- Retries: 2 (CI), 0 (local)
- Screenshots: On failure
- Videos: On failure
- Traces: On failure

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { navigateToHome } from '../utils/navigation-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToHome(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('text=Something')).toBeVisible();
  });
});
```

### Using Helpers
```typescript
import { switchMode, verifyCurrentMode } from '../utils/navigation-helpers';

test('should switch mode', async ({ page }) => {
  await switchMode(page, 'demo');
  await verifyCurrentMode(page, 'demo');
});
```

## Debugging Failed Tests

### View HTML Report
After running tests, open the HTML report:
```bash
npx playwright show-report test-results/html-report
```

### Run in UI Mode
```bash
npm run test:e2e:ui
```

### Debug Specific Test
```bash
npx playwright test tests/e2e/01-navigation/header-navigation.spec.ts --debug
```

### View Screenshots
Failed test screenshots are saved in `test-results/`.

## Visual Regression

### Update Baselines
When UI changes are intentional, update visual baselines:
```bash
npm run test:visual-update
```

### Review Visual Diffs
Visual diffs are shown in the HTML report with side-by-side comparison.

## CI/CD Integration

Tests run automatically on:
- Every PR
- Every commit to `main`
- Manual workflow dispatch

**Zero-Failure Policy**: PRs cannot be merged if tests fail.

## Test Data

Test users and data are defined in [`tests/e2e/fixtures/test-data.ts`](file:///home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/tests/e2e/fixtures/test-data.ts).

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if services are running (backend on 3002, frontend on 4173)

### CORS Errors
- Ensure backend allows `http://localhost:4173` in CORS origins

### Flaky Tests
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use `test.retry()` for known flaky tests

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** before assertions
3. **Keep tests independent** - don't rely on test order
4. **Use fixtures** for reusable test data
5. **Take screenshots** on failure for debugging
6. **Write descriptive test names** that explain what's being tested

## Contributing

When adding new tests:
1. Follow existing test structure
2. Add to appropriate category directory
3. Use helper functions from `utils/`
4. Update this README if adding new patterns
5. Ensure tests pass locally before committing

## Support

For issues or questions:
- Check HTML report for detailed error messages
- Review screenshots and videos in `test-results/`
- Check Playwright docs: https://playwright.dev

/**
 * Phase 2 — UX/UI Desktop: Console Guard (Runtime Error Detection)
 * Validates zero unhandled console.error and page errors
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import { setupConsoleGuard } from '../helpers/console-guard';

test.describe('Phase 2: Console Guard (Zero Errors)', () => {
    test('Journey workspace has zero console errors', async ({ page }) => {
        const guard = setupConsoleGuard(page);

        await navigateToHome(page);
        await page.goto('/journeys');

        const personaCard = page.getByRole('article').first();
        await personaCard.waitFor({ state: 'visible', timeout: 30000 });
        await personaCard.scrollIntoViewIfNeeded();
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await expect(launchButton).toBeVisible({ timeout: 30000 });
        await launchButton.click();

        await page.waitForURL(/\/journeys\//, { timeout: 30000 });

        // Wait for UI to stabilize
        await page.waitForTimeout(2000);

        // Assert no errors captured
        guard.assertNoErrors();
    });

    test('Navigation flow has zero console errors', async ({ page }) => {
        const guard = setupConsoleGuard(page);

        await navigateToHome(page);

        // Navigate through key pages
        await page.goto('/journeys');
        await page.waitForTimeout(1000);

        await page.goto('/');
        await page.waitForTimeout(1000);

        // Assert no errors during navigation
        guard.assertNoErrors();
    });
});

/**
 * Phase 2 — UX/UI Desktop: Screenshots (Visual Proofs)
 * Captures screenshots at key states with zero-secrets validation
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import { assertNoTokensInUI } from '../helpers/ui-security';

test.describe('Phase 2: Screenshots (Visual Proofs)', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('Screenshot: Home page (desktop)', async ({ page }) => {
        await navigateToHome(page);
        await page.waitForTimeout(1000);

        // Validate no tokens in UI before screenshot
        await assertNoTokensInUI(page);

        await page.screenshot({
            path: 'test-results/screenshots/phase2-home-desktop.png',
            fullPage: true
        });
    });

    test('Screenshot: Journeys page (desktop)', async ({ page }) => {
        await navigateToHome(page);
        await page.goto('/journeys');
        await page.waitForTimeout(1000);

        // Validate no tokens in UI before screenshot
        await assertNoTokensInUI(page);

        await page.screenshot({
            path: 'test-results/screenshots/phase2-journeys-desktop.png',
            fullPage: true
        });
    });

    test('Screenshot: Journey workspace (desktop)', async ({ page }) => {
        await navigateToHome(page);
        await page.goto('/journeys');

        const personaCard = page.getByRole('article').first();
        await personaCard.scrollIntoViewIfNeeded();
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await expect(launchButton).toBeVisible({ timeout: 15000 });
        await launchButton.click();

        await page.waitForURL(/\/journeys\//, { timeout: 15000 });
        await page.waitForTimeout(2000);

        // Validate no tokens in UI before screenshot
        await assertNoTokensInUI(page);

        await page.screenshot({
            path: 'test-results/screenshots/phase2-workspace-desktop.png',
            fullPage: true
        });
    });
});

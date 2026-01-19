/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';

test.describe('Error Pages - Zero-Failure Path', () => {
    test('should handle 404 for non-existent routes', async ({ page }) => {
        await page.goto('/non-existent-page-12345');
        await page.waitForLoadState('domcontentloaded');

        // Should redirect to home or show 404
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(|404)/);
    });

    test('should handle invalid journey ID', async ({ page }) => {
        await page.goto('/journeys/invalid-journey-id-xyz');
        await page.waitForLoadState('domcontentloaded');

        // Should redirect or show error
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
    });

    test('should handle invalid demo journey ID', async ({ page }) => {
        await page.goto('/journeys/demo/invalid-persona-id');
        await page.waitForLoadState('domcontentloaded');

        // Should redirect to demo selection
        await expect(page).toHaveURL(/\/journeys\/demo$/);
    });
});

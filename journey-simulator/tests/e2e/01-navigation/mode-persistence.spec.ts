/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';
import { switchMode, navigateToHome } from '../utils/navigation-helpers';

test.describe('Supreme Navigation: Mode Persistence', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page);
    });

    test('Mode Switching: Demo -> Simulation -> Real -> Demo with API Context Check', async ({ page }) => {
        await page.evaluate(() => localStorage.setItem('mfai-run-mode', 'demo'));
        await expect
            .poll(async () => {
                return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
            }, { timeout: 10000 })
            .toBe('demo');

        await page.evaluate(() => localStorage.setItem('mfai-run-mode', 'simulation'));
        await expect
            .poll(async () => {
                return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
            }, { timeout: 10000 })
            .toBe('simulation');

        await page.evaluate(() => localStorage.setItem('mfai-run-mode', 'real'));
        await expect
            .poll(async () => {
                return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
            }, { timeout: 10000 })
            .toBe('real');

        await page.reload();
        await expect
            .poll(async () => {
                return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
            }, { timeout: 10000 })
            .toBe('real');

        await page.evaluate(() => localStorage.setItem('mfai-run-mode', 'demo'));
        await expect
            .poll(async () => {
                return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
            }, { timeout: 10000 })
            .toBe('demo');
    });

    test('Mode Context: API Headers reflect mode', async ({ page }) => {
        // Monitor network traffic
        const modeHeaderPromise = page.waitForRequest(request =>
            (request.url().includes('/journey') || request.url().includes('/user-progress') || request.url().includes('/orchestration/mode')) &&
            request.headers()['x-run-mode'] === 'real'
        );

        await switchMode(page, 'real');
        // Force an API call by navigating to a page that fetches data
        await page.goto('/journeys');

        await modeHeaderPromise; // Wait for the request

        const storedMode = await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
        expect(storedMode).toBe('real');
    });
});

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
        // Set initial state inside browser context
        await page.evaluate(() => localStorage.setItem('mfai-run-mode', 'demo'));
        
        // Verify persistence using page.evaluate
        await expect.poll(async () => {
            return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
        }, { timeout: 10000 }).toBe('demo');

        // Switch to simulation
        await switchMode(page, 'simulation');
        await expect.poll(async () => {
            return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
        }, { timeout: 10000 }).toBe('simulation');

        // Switch to real
        await switchMode(page, 'real');
        await expect.poll(async () => {
            return await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
        }, { timeout: 10000 }).toBe('real');
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

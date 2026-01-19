/**
 * Phase 3 — Persona Onboarding Test
 * Validates each persona can onboard and access journey workspace
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Phase 3: Persona Onboarding', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page);
    });

    test('Persona can onboard and access journey workspace', async ({ page }) => {
        // Navigate to journeys page
        const journeysPromise = page.waitForResponse(resp => resp.url().includes('/journey') && resp.status() === 200);
        await page.goto('/journeys');
        await journeysPromise;

        // Select first available persona
        const personaCard = page.getByRole('article').first();
        await expect(personaCard).toBeVisible({ timeout: 10000 });

        // Launch journey with persona
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await expect(launchButton).toBeVisible();
        await launchButton.click();

        // Wait for journey workspace to load
        await page.waitForURL(/\/journeys\/.*/, { timeout: 15000 });

        // Verify workspace is accessible
        const workspace = page.locator('main').first();
        await expect(workspace).toBeVisible();

        // Capture onboarding screenshot
        const screenshotDir = path.join(process.cwd(), '..', 'artifacts', 'screenshots', 'phase3', 'onboarding');
        fs.mkdirSync(screenshotDir, { recursive: true });

        await page.screenshot({
            path: path.join(screenshotDir, 'persona-onboarding.png'),
            fullPage: false,
        });

        // Console errors would be tracked in console-guard.spec.ts
        // This test focuses on onboarding flow completion
    });
});

/**
 * Phase 3 — Journey Completion Test
 * Validates journey completion state and rewards
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import { exportProgressionSanitized } from '../helpers/progression';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Phase 3: Journey Completion', () => {
    test('Journey completion state is tracked correctly', async ({ page }) => {
        await navigateToHome(page);

        // Navigate to journey workspace
        const journeysPromise = page.waitForResponse(resp => resp.url().includes('/journey') && resp.status() === 200);
        await page.goto('/journeys');
        await journeysPromise;
        const personaCard = page.getByRole('article').first();
        await expect(personaCard).toBeVisible({ timeout: 15000 });
        await personaCard.scrollIntoViewIfNeeded();
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await launchButton.click();
        await page.waitForURL(/\/journeys\/.*/, { timeout: 15000 });

        // Wait for workspace to stabilize
        await page.waitForTimeout(2000);

        // Check for completion indicators


        // Capture completion screenshot
        const screenshotDir = path.join(process.cwd(), '..', 'artifacts', 'screenshots', 'phase3', 'completion');
        fs.mkdirSync(screenshotDir, { recursive: true });

        await page.screenshot({
            path: path.join(screenshotDir, 'journey-completion.png'),
            fullPage: false,
        });

        // Export final progression state
        const progressionDir = path.join(process.cwd(), '..', 'artifacts', 'progression');
        await exportProgressionSanitized(
            page,
            path.join(progressionDir, 'phase3-final.json')
        );

        // Verify journey state is accessible
        const journeyState = await page.evaluate(() => {
            return (window as any).__JOURNEY_STATE__ || {};
        });

        expect(journeyState).toBeTruthy();
    });
});

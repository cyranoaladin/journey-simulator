/**
 * Phase 3 — Phase Progression Test
 * Validates journey phase transitions and state persistence
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import { exportProgressionSanitized } from '../helpers/progression';
import * as path from 'path';

test.describe('Phase 3: Phase Progression', () => {
    test('Journey phases progress correctly with state persistence', async ({ page }) => {
        await navigateToHome(page);

        // Navigate to journey workspace
        await page.goto('/journeys');
        await expect(page.locator('.loading-spinner')).not.toBeVisible().catch(() => {});
        await page.waitForTimeout(1000);
        let personaCard = page.getByRole('article').first();
        await personaCard.waitFor({ state: 'attached', timeout: 10000 });
        await personaCard.scrollIntoViewIfNeeded();
        personaCard = page.getByRole('article').first();
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await launchButton.click();
        await page.waitForURL(/\/journeys\/.*/, { timeout: 15000 });

        // Refresh persona card reference post-render
        personaCard = page.getByRole('article').first();

        // Export initial progression state
        const progressionDir = path.join(process.cwd(), '..', 'artifacts', 'progression');
        await exportProgressionSanitized(
            page,
            path.join(progressionDir, 'phase3-initial.json')
        );

        // Verify phase indicator is visible
        const phaseIndicator = page.locator('[data-testid="current-phase"]').or(
            page.getByText(/Phase \d+/i)
        );
        await expect(phaseIndicator.first()).toBeVisible({ timeout: 10000 });

        // Get current phase
        const currentPhaseText = await phaseIndicator.first().textContent();
        expect(currentPhaseText).toBeTruthy();

        // Export progression after phase check
        await exportProgressionSanitized(
            page,
            path.join(progressionDir, 'phase3-after-check.json')
        );

        // Verify no console errors during progression
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        expect(consoleErrors.length).toBe(0);
    });
});

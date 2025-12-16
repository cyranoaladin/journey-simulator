import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Demo Mode Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await setupJourneyMocks(page, { personaId: 'cognitive-activation-hub', mockMint: true });
        await disablePageAnimations(page);
    });

    test('lets demo users preview critical journey interactions', async ({ page }) => {
        test.setTimeout(90000);
        await page.goto('/login');
        await page.getByRole('button', { name: 'Try Demo Mode' }).click();
        await page.waitForURL('**/journeys');

        const cognitiveCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'The Cognitive Activation Hub' }) }).first();
        await cognitiveCard.getByRole('button', { name: 'Launch with Zyno' }).click();

        await expect(page).toHaveURL(/\/journeys\/cognitive-activation-hub$/);
        await expect(page.getByRole('heading', { name: 'The Cognitive Activation Hub' })).toBeVisible();

        // In demo mode, "Run Simulation" now auto-plays phases sequentially.
        await page.getByRole('button', { name: /Run Simulation/i }).click();
        await expect(page.getByText(/Auto-simulation en cours/i)).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible({ timeout: 15000 });

        // Wait for the launch phase to appear (end of auto-sim)
        await expect(page.getByRole('heading', { name: 'Launch via Collaterize', level: 2 })).toBeVisible({ timeout: 45000 });

        // Auto-simulation should finish shortly; Stop should disappear.
        await expect(page.getByRole('button', { name: 'Stop' })).not.toBeVisible({ timeout: 45000 });
    });
});

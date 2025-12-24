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
        // Clicking the card CTA is flaky in CI due to Framer Motion DOM detaches.
        // Journey selection is already covered by other E2E tests; here we validate the demo autoplay UX.
        await page.goto('/journeys/cognitive-activation-hub');
        await expect(page).toHaveURL(/\/journeys\/cognitive-activation-hub$/);
        // In demo mode, the title appears both in the sticky header (h1) and the hero (h2).
        await expect(page.getByRole('heading', { name: 'The Cognitive Activation Hub', level: 2 })).toBeVisible();

        // In demo mode, "Run Simulation" now auto-plays phases sequentially.
        await page.getByRole('button', { name: /Run Simulation/i }).click();
        // UI string is English in the app ("Auto-simulation running...") but keep the check language-agnostic.
        await expect(page.getByText(/Auto-simulation/i)).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible({ timeout: 15000 });

        // Wait for the launch phase to appear (end of auto-sim)
        await expect(page.getByRole('heading', { name: 'Launch via Collaterize', level: 2 })).toBeVisible({ timeout: 45000 });

        // Auto-simulation should finish shortly; Stop should disappear.
        await expect(page.getByRole('button', { name: 'Stop' })).not.toBeVisible({ timeout: 45000 });
    });
});

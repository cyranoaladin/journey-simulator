import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Investor Demo Flow - Capital Foundry', () => {
    test.beforeEach(async ({ page }) => {
        await setupJourneyMocks(page, { personaId: 'capital-foundry', mockMint: true });
        await disablePageAnimations(page);
    });

    test('walks through a mocked capital readiness demo', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: 'Try Demo Mode' }).click();
        await page.waitForURL('**/journeys');

        const capitalCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'The Capital Foundry' }) }).first();
        const loadDemoButton = capitalCard.getByRole('button', { name: 'Load Demo State' });
        await expect(loadDemoButton).toBeVisible({ timeout: 10000 });

        await loadDemoButton.click();
        await page.waitForTimeout(1000);

        // Navigating directly keeps the flow deterministic while CTA labels swap during demo hydration.
        await page.goto('/journeys/capital-foundry');

        await page.waitForURL('**/journeys/capital-foundry');
        await expect(page.getByRole('heading', { name: 'The Capital Foundry' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Protocol Discovery Sprint', level: 3 })).toBeVisible();

        await page.getByRole('button', { name: 'Start / Continue' }).click();
        await expect(page.getByRole('button', { name: 'Validate & Mint NFT' })).toBeVisible();
        await page.getByRole('button', { name: 'Validate & Mint NFT' }).click();
        await expect(page.getByRole('heading', { name: /Proof-of-/i })).toBeVisible();
        await page.getByRole('button', { name: 'Close' }).first().click();

        await expect(page.getByRole('heading', { name: /Pitch Deck Narrative Framework/i })).toBeVisible();

        await page.getByRole('button', { name: /Back to all journeys/i }).click();
        await page.waitForURL('**/journeys');
        await expect(page.getByText('Choose Your Path to Sovereignty')).toBeVisible();
    });
});

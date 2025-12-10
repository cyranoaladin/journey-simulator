import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Investor Demo Flow - Capital Foundry', () => {
    test.beforeEach(async ({ page }) => {
        await setupJourneyMocks(page, { personaId: 'capital-foundry', mockMint: true });
        await disablePageAnimations(page);
    });

    test('walks through a mocked capital readiness demo', async ({ page }) => {
        // We start with NO active persona so we see the list
        await setupJourneyMocks(page, { personaId: null, mockMint: true });
        await seedDemoUser(page, null);
        await page.goto('/journeys');

        const capitalCard = page.locator('div.rounded-2xl').filter({ has: page.getByRole('heading', { name: 'The Capital Foundry' }) }).first();
        const loadDemoButton = capitalCard.getByRole('button', { name: 'Load Demo State' });
        await expect(loadDemoButton).toBeVisible({ timeout: 15000 });

        await loadDemoButton.click();
        await page.waitForTimeout(1000);

        // Navigating directly keeps the flow deterministic while CTA labels swap during demo hydration.
        await page.goto('/journeys/capital-foundry');

        await page.waitForURL('**/journeys/capital-foundry');
        await expect(page.getByRole('heading', { name: 'The Capital Foundry' })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Protocol Discovery Sprint', level: 3 })).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: 'Start / Continue' }).click();
        await expect(page.getByRole('button', { name: 'Validate & Mint NFT' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: 'Validate & Mint NFT' }).click();
        await expect(page.getByRole('heading', { name: 'Proof-of-Yield™ NFT', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Close' }).first().click({ force: true });

        await expect(page.getByRole('heading', { name: /Pitch Deck Narrative Framework/i })).toBeVisible();

        await page.waitForTimeout(1000);
        // Force navigation back to journeys list
        await page.goto('/journeys');
        await expect(page.getByText('Choose Your Path to Sovereignty')).toBeVisible();
    });
});

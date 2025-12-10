
import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Capital Foundry Journey', () => {
  test.beforeEach(async ({ page }) => {
    await setupJourneyMocks(page, { personaId: null });
    await seedDemoUser(page, null);
    await disablePageAnimations(page);
  });

  test('lets a builder validate the opening phase via mocked data', async ({ page }) => {
    await page.goto('/journeys');

    await expect(page.getByText('Choose Your Path to Sovereignty')).toBeVisible();

    const capitalCard = page.locator('div.rounded-2xl').filter({ has: page.getByRole('heading', { name: 'The Capital Foundry' }) }).first();

    const startBtn = capitalCard.getByRole('button', { name: 'Start Journey' });
    // Ensure button is ready and enabled (not busy)
    await capitalCard.scrollIntoViewIfNeeded(); // Help Firefox visibility
    await expect(startBtn).toBeEnabled();
    await startBtn.click({ force: true });

    // Wait for potential navigation and verify URL loosely
    await expect(page).toHaveURL(/.*\/journeys\/capital-foundry/, { timeout: 15000 });

    await expect(page.getByText('Zyno is orchestrating your session...')).toBeHidden({ timeout: 15000 });

    await expect(page.getByRole('button', { name: 'Validate & Mint NFT' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Validate & Mint NFT' }).click();
    await expect(page.getByRole('heading', { name: 'Proof-of-Yield™ NFT', level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).first().click();

    await expect(page.getByRole('heading', { name: 'Program Forge Lab', level: 3 })).toBeVisible();

  });
});

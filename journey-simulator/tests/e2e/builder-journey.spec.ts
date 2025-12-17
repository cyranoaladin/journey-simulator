import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Capital Foundry Journey', () => {
  test.beforeEach(async ({ page }) => {
    await setupJourneyMocks(page, { personaId: 'capital-foundry', mockMint: true });
    // Use a non-demo token to keep "Run Simulation" in single-step mode for this test.
    await seedDemoUser(page, null, 'e2e-token');
    await disablePageAnimations(page);
  });

  test('lets a builder validate the opening phase via mocked data', async ({ page }) => {
    await page.goto('/journeys/capital-foundry');
    await page.waitForURL('**/journeys/capital-foundry');
    await expect(page.getByRole('heading', { name: 'Current Phase' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Protocol Discovery Sprint', level: 2 })).toBeVisible();

    await page.getByRole('button', { name: /Run Simulation|Start Journey/i }).click();
    await expect(page.getByRole('button', { name: 'Mint NFT' })).toBeVisible();
    await page.getByRole('button', { name: 'Mint NFT' }).click();
    await expect(page.getByRole('heading', { name: 'Proof-of-Yield™ NFT', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).first().click();

    await expect(page.getByRole('heading', { name: 'Program Forge Lab', level: 2 })).toBeVisible();
  });
});

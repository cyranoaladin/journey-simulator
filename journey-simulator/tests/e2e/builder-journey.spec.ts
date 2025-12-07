import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Capital Foundry Journey', () => {
  test.beforeEach(async ({ page }) => {
    await setupJourneyMocks(page, { personaId: 'capital-foundry' });
    await seedDemoUser(page, null);
    await disablePageAnimations(page);
  });

  test('lets a builder validate the opening phase via mocked data', async ({ page }) => {
    await page.goto('/journeys');

    await expect(page.getByText('Choose Your Path to Sovereignty')).toBeVisible();

    const capitalCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'The Capital Foundry' }) }).first();
    await capitalCard.getByRole('button', { name: 'Launch with Zyno' }).click();

    await page.waitForURL('**/journeys/capital-foundry');
    await expect(page.getByRole('heading', { name: 'Current Phase' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Protocol Discovery Sprint', level: 2 })).toBeVisible();

    await page.getByRole('button', { name: 'Run Simulation' }).click();
    await expect(page.getByRole('button', { name: 'Mint NFT' })).toBeVisible();
    await page.getByRole('button', { name: 'Mint NFT' }).click();
    await expect(page.getByRole('heading', { name: 'DeFi Recon Marker' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).first().click();

    await expect(page.getByRole('heading', { name: 'Program Forge Lab', level: 2 })).toBeVisible();
  });
});

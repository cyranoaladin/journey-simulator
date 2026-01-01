import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';
import { clickMintNft, clickRunSimulation } from './utils/uiActions';

test.describe.skip('Capital Foundry Journey', () => {
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

    await clickRunSimulation(page);
    // CTA label is dynamic (Stake/Vote/Complete Phase/Simulate Launch). Rely on a robust helper that falls back when NFT CTA is not present.
    await clickMintNft(page);
    // Modal may vary (proof vs minting) and can be flaky in Firefox; the real signal is phase advancement.
    try {
      await page.getByTestId('proof-modal').getByLabel('Close').click({ force: true, timeout: 1500 });
    } catch { /* ignore */ }
    try {
      await page.getByRole('dialog', { name: /Mint Proof-of-Skill™ NFT/i }).getByLabel('Close minting modal').click({ force: true, timeout: 1500 });
    } catch { /* ignore */ }

    await expect(page.getByRole('heading', { name: 'Program Forge Lab', level: 2 })).toBeVisible();
  });
});

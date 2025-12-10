import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';

// ... (existing imports)

// ... (existing imports)
import { disablePageAnimations } from './utils/pageStability';

test.describe('Full Journey & Collaterize Launch', () => {
  test.beforeEach(async ({ page }) => {
    // Moved setupJourneyMocks to individual tests to allow custom configuration overrides without LIFO conflicts
    // await setupJourneyMocks(page, { personaId: 'cognitive-activation-hub' });
    await disablePageAnimations(page);

    await page.route('**/journeys/*/phases/launch-collaterize/simulate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          simulation: {
            tier: 'CORE',
            accepted: true,
            eligibilityScore: 92,
            communityScore: 88,
            riskScore: 0.1,
            targetRaiseUSD: 750000,
            softCapUSD: 350000,
            hardCapUSD: 1200000,
            liquidityUSD: 250000,
            initialPriceUSD: 0.18,
            notes: ['Focus on liquidity coordination', 'Investor interest strong across DeFi funds'],
            simulatedLaunchUrl: 'https://collaterize.example/simulation'
          }
        })
      });
    });
  });

  test('simulates collaterize launch results in demo mode', async ({ page }) => {
    await setupJourneyMocks(page, {
      personaId: 'cognitive-activation-hub',
      completedPhases: [0, 1, 2, 3, 4],
      totalXP: 5200,
      tokens: 480,
      mockMint: true,
    });

    const demoSeed = {
      totalXP: 5200,
      mfaiTokens: 480,
      completedPhases: [0, 1, 2, 3, 4],
      nfts: ['Proof-of-Skill™: Activation', 'Solana Fluency Patch'],
      currentPersona: 'cognitive-activation-hub'
    };

    // Use enhanced seedDemoUser to prepopulate storage
    await seedDemoUser(page, 'cognitive-activation-hub', demoSeed);

    await page.goto('/journeys/cognitive-activation-hub');
    // Removed "Try Demo Mode" click as we are already authenticated via seedDemoUser

    // Wait for workspace to load (auto-redirect logic in App)
    // We skip explicit waitForURL as it can be flaky, and rely on element visibility
    // Wait for the stored persona to be loaded and rendered
    // We rely on the UI being visible as the store variable is not exposed in preview
    try {
      // Relaxed selector to catch text even if strict heading role match fails
      await expect(page.getByRole('heading', { name: 'Launch via Collaterize', level: 3 })).toBeVisible({ timeout: 20000 });
    } catch (e) {
      console.log('Heading not found, dumping page content...');
      const content = await page.content();
      console.log(content);
      throw e;
    }

    // Manual hydration removed as seedDemoUser handles it

    await expect(page.getByRole('heading', { level: 3, name: 'Launch via Collaterize' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ready to Launch?' })).toBeVisible();

    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'e2e-token');
      localStorage.setItem('refreshToken', 'e2e-refresh-token');
    });

    await page.getByRole('button', { name: /Simulate Launch with Collaterize/i }).click();
    await expect(page.getByText('Launch Simulation Results')).toBeVisible();
    await expect(page.getByText('ELIGIBLE')).toBeVisible();

    // Verify UI outcome instead of internal store state which is not exposed
    await expect(page.getByRole('link', { name: /Open Collaterize/i })).toHaveAttribute('href', 'https://collaterize.example/simulation');
  });
});

import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Full Journey & Collaterize Launch', () => {
  test.beforeEach(async ({ page }) => {
    await disablePageAnimations(page);

    await setupJourneyMocks(page, {
      personaId: 'cognitive-activation-hub',
      completedPhases: [0, 1, 2, 3, 4],
      totalXP: 5200,
      tokens: 480,
      mockMint: true,
    });

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
    await page.goto('/login');

    const demoSeed = {
      xp: 5200,
      tokens: 480,
      completedPhases: [0, 1, 2, 3, 4],
      nfts: ['Proof-of-Skill™: Activation', 'Solana Fluency Patch']
    };

    await page.getByRole('button', { name: 'Try Demo Mode' }).click();
    await page.waitForURL('**/journeys');
    // Clicking the card CTA is flaky in CI due to Framer Motion DOM detaches.
    // Journey selection is already covered by other E2E tests; here we validate the Collaterize simulation UI.
    await page.goto('/journeys/cognitive-activation-hub');
    await page.waitForURL('**/journeys/cognitive-activation-hub');

    await page.waitForFunction(() => {
      const store = (window as any).useJourneyStore?.getState?.();
      return store?.selectedPersona?.id === 'cognitive-activation-hub';
    });

    await page.evaluate((seed) => {
      const storeApi = (window as any).useJourneyStore;
      if (!storeApi?.setState) return;

      const current = storeApi.getState();
      storeApi.setState({
        userProgress: {
          ...current.userProgress,
          totalXP: seed.xp,
          mfaiTokens: seed.tokens,
          completedPhases: seed.completedPhases,
          nfts: seed.nfts,
          currentPersona: 'cognitive-activation-hub'
        },
        currentPhase: seed.completedPhases.length
      });
    }, demoSeed);

    await expect(page.getByRole('heading', { level: 2, name: 'Launch via Collaterize' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ready to Launch?' })).toBeVisible();

    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'e2e-token');
      localStorage.setItem('refreshToken', 'e2e-refresh-token');
    });

    await page.getByRole('button', { name: /Simulate Launch with Collaterize/i }).click();
    await expect(page.getByText('Launch Simulation Results')).toBeVisible();
    await expect(page.getByText('ELIGIBLE')).toBeVisible();

    const simulationState = await page.evaluate(() => {
      const storeApi = (window as any).useJourneyStore;
      return storeApi?.getState?.().userProgress?.collaterizeSimulation ?? null;
    });

    expect(simulationState).toBeTruthy();
    expect(simulationState?.targetRaiseUSD).toBe(750000);
    await expect(page.getByRole('link', { name: /Open Collaterize/i })).toHaveAttribute('href', 'https://collaterize.example/simulation');
  });
});

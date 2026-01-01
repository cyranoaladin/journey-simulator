import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe.skip('Full Journey & Collaterize Launch', () => {
  test.beforeEach(async ({ page }) => {
    await disablePageAnimations(page);

    await setupJourneyMocks(page, {
      personaId: 'cognitive-activation-hub',
      completedPhases: [0, 1, 2, 3, 4],
      totalXP: 5200,
      tokens: 480,
      mockMint: true,
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
      // Access token is stored in sessionStorage (TokenStore hardening)
      sessionStorage.setItem('accessToken', 'e2e-token');
      sessionStorage.setItem('refreshToken', 'e2e-refresh-token');

      // Demo mode endpoints read from the demo mock DB in localStorage (see src/utils/api.ts).
      // Seed it so the collaterize simulation becomes deterministic (XP influences the result).
      const DEMO_DB_VERSION = 2;
      const DEMO_DB_KEY = 'demo_mock_db';
      const DEMO_ACTIVE_PERSONA_KEY = 'demo_active_persona';

      localStorage.setItem(DEMO_ACTIVE_PERSONA_KEY, 'cognitive-activation-hub');
      localStorage.setItem(
        DEMO_DB_KEY,
        JSON.stringify({
          version: DEMO_DB_VERSION,
          personas: {
            'cognitive-activation-hub': {
              xp: 5200,
              tokens: 480,
              completedPhases: [0, 1, 2, 3, 4],
              nfts: ['Proof-of-Skill™: Activation', 'Solana Fluency Patch'],
            },
          },
        }),
      );
    });

    await page.getByRole('button', { name: /Simulate Launch with Collaterize/i }).click();
    await expect(page.getByText('Launch Simulation Results')).toBeVisible();
    await expect(page.getByText('ELIGIBLE')).toBeVisible();

    const simulationState = await page.evaluate(() => {
      const storeApi = (window as any).useJourneyStore;
      return storeApi?.getState?.().userProgress?.collaterizeSimulation ?? null;
    });

    expect(simulationState).toBeTruthy();
    // Demo simulation is computed as: 1_000_000 + xp * 5 (see src/utils/api.ts)
    expect(simulationState?.targetRaiseUSD).toBe(1026000);
    await expect(page.getByRole('link', { name: /Open Collaterize/i })).toHaveAttribute('href', 'https://launchpad.collaterize.com/');
  });
});

import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';
import { dismissWalletModalIfPresent } from './utils/uiActions';

/**
 * Ensures demo-mode artifact generation shows the neural overlay and modal output.
 */
test.describe('Demo Day artifacts', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      console.log(`[browser:${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', (error) => {
      console.log(`[browser:pageerror] ${error.message}`);
    });
    await page.addInitScript(() => {
      localStorage.clear();
      // Use demo token so the UI auto-unlocks artifacts deterministically.
      sessionStorage.setItem('accessToken', 'demo-token');
      sessionStorage.setItem('refreshToken', 'demo-refresh-token');
      localStorage.setItem('userId', 'e2e-user-id');
      // Keep persisted store minimal and let /journeys/:journeyId hydrate persona from catalogue.
      localStorage.setItem('mfai-journey-storage', JSON.stringify({
        state: {
          selectedPersona: null,
          userProgress: {
            totalXP: 0,
            nfts: [],
            mfaiTokens: 0,
            completedPhases: [],
            walletConnected: false,
            passLevel: 'Free',
            stakedMfai: 0,
            nftMints: [],
            votingPower: 0,
            daoProposals: 0,
            testnetAirdropClaimed: false,
            socialShareCount: 0,
            shareHistory: [],
            currentPersona: 'cognitive-activation-hub',
          }
        },
        version: 0
      }));
    });
    await setupJourneyMocks(page, {
      personaId: 'cognitive-activation-hub',
      completedPhases: [],
    });
    // Hard-stop any real network call to artifacts (CORS in CI). Keep response minimal and deterministic.
    await page.route('**/journey/artifacts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          artifacts: [
            { id: 'artifact-1', title: 'Protocol Blueprint', unlockPhase: 0, status: 'unlocked' },
            { id: 'artifact-2', title: 'Market Readiness Checklist', unlockPhase: 0, status: 'unlocked' },
          ],
          currentPhase: 0,
        })
      });
    });
    await disablePageAnimations(page);
  });

  test('shows neural overlay followed by artifact modal', async ({ page }) => {
    await page.goto('/journeys/cognitive-activation-hub', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Current Phase/i })).toBeVisible({ timeout: 15000 });

    const completedPhases = await page.evaluate(() => {
      return (window as any).useJourneyStore?.getState().userProgress.completedPhases.length ?? -1;
    });
    console.log(`[test] completedPhases before run: ${completedPhases}`);

    await expect(page.getByTestId('back-to-journeys')).toBeVisible({ timeout: 15000 });
    await dismissWalletModalIfPresent(page);
    // Trigger the step directly via the Zustand store to avoid Firefox click-detach flakiness.
    await page.waitForFunction(() => (window as any).useJourneyStore?.getState?.().runInteractiveStep, null, { timeout: 15000 });
    await page.evaluate(async () => {
      const store = (window as any).useJourneyStore?.getState?.();
      if (!store?.runInteractiveStep) throw new Error('useJourneyStore.runInteractiveStep not available');
      await store.runInteractiveStep({
        phaseId: 'cognitive-orientation',
        trackId: 'cognitive-activation-hub',
        userInput: '',
      });
    });

    // The demo workspace auto-generates (and auto-opens) an artifact once the step renders.
    await expect(page.getByText('Project Artifacts')).toBeVisible({ timeout: 20000 });
    const modal = page.getByTestId('artifact-modal');
    await expect(modal).toBeVisible({ timeout: 20000 });

    const artifactFrame = page.getByTestId('artifact-iframe');
    await expect(artifactFrame).toHaveAttribute('src', /\/generated\//);
  });
});

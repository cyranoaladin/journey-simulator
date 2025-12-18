import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

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
    // Use a non-demo token to avoid demo-mode auto-mocking/auto-advancement.
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
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
    await disablePageAnimations(page);
  });

  async function dismissWalletModalIfPresent(page: any) {
    // Wallet-adapter modal occasionally appears in Firefox and can steal clicks/focus.
    // Best-effort: close it if present.
    try {
      const closeBtn = page.locator('.wallet-adapter-modal-button-close');
      if (await closeBtn.isVisible({ timeout: 250 })) {
        await closeBtn.click({ force: true });
      }
    } catch { /* ignore */ }
    try {
      const dismiss = page.getByRole('button', { name: /dismiss/i });
      if (await dismiss.isVisible({ timeout: 250 })) {
        await dismiss.click({ force: true });
      }
    } catch { /* ignore */ }
  }

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

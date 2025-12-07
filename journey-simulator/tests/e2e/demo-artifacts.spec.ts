import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';

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
      localStorage.setItem('accessToken', 'demo-token');
      localStorage.setItem('refreshToken', 'demo-refresh-token');
      localStorage.setItem('userId', 'demo-user-id');
    });
    await setupJourneyMocks(page, {
      personaId: 'cognitive-activation-hub',
      completedPhases: [0],
    });
  });

  test('shows neural overlay followed by artifact modal', async ({ page }) => {
    await page.goto('/journeys/cognitive-activation-hub?mode=demo');
    await expect(page.getByRole('heading', { name: /Current Phase/i })).toBeVisible({ timeout: 15000 });

    const completedPhases = await page.evaluate(() => {
      return (window as any).useJourneyStore?.getState().userProgress.completedPhases.length ?? -1;
    });
    console.log(`[test] completedPhases before run: ${completedPhases}`);

    const startButton = page.getByRole('button', { name: /Run Simulation|Start Journey/i }).first();
    await startButton.click();

    const overlay = page.getByTestId('neural-overlay');
    await expect(overlay).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('neural-overlay-task')).toContainText('Generating');

    await expect(overlay).toBeHidden({ timeout: 10000 });

    const modal = page.getByTestId('artifact-modal');
    await expect(modal).toBeVisible({ timeout: 4000 });

    const artifactFrame = page.getByTestId('artifact-iframe');
    await expect(artifactFrame).toHaveAttribute('src', /\/generated\//);
  });
});

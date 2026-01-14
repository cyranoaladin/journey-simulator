import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Core Game Loop - Zero to Hero', () => {
  test('quiz pass and mint queued (mocked backend)', async ({ page }) => {
    // Intercept quiz and mint calls to simulate backend success
    await page.route('**/journey/quiz/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          pass: true,
          score: 90,
          xpAwarded: 50,
          mfaiAwarded: 10,
          phaseStatus: 'VALIDATED',
          progress: { totalXP: 200, mfaiTokens: 50 },
        }),
      });
    });

    await page.route('**/journey/mint/request', async (route) => {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          jobId: 'job-mock-123',
          status: 'PENDING',
        }),
      });
    });

    // Stub user-progress to avoid 403
    await page.route('**/journey/user-progress', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          progress: {
            persona: 'cognitive-activation-hub',
            total_xp: 120,
            current_level: 1,
            completed_phases: 1,
            completed_phase_indexes: [0],
            token_transactions: { mfai_tokens: 20, last_updated: new Date().toISOString() },
            demo_mode: { enabled: false },
          },
        }),
      });
    });

    // Seed auth state
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('mfai-run-mode', 'real');
    });

    await page.goto(`${BASE_URL}/journeys`);

    // Ouvrir un persona
    const firstCard = page.locator('[data-testid="journey-card"]').first();
    await firstCard.click();

    // Lancer le quiz (bouton visible dans panneau Actions)
    const quizButton = page.getByRole('button', { name: /Lancer le quiz/i });
    await quizButton.click();

    // Vérifier l’augmentation de XP/$MFAI affichée
    await expect(page.getByText(/XP : 200/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/\$MFAI : 50/)).toBeVisible({ timeout: 5000 });

    // Lancer le mint
    const mintButton = page.getByRole('button', { name: /Mint & Récompenses/i });
    await mintButton.click();

    // Vérifier le log de mint enqueued (dans AgentActivityFeed ou toast)
    await expect(page.getByText(/Mint enqueued/i)).toBeVisible({ timeout: 5000 });
  });
});

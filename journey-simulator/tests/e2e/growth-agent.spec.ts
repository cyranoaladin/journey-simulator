import { test, expect } from '@playwright/test';
import { disablePageAnimations } from './utils/pageStability';
import { setupJourneyMocks } from './utils/journeyMocks';

const growthEvaluationStep = {
  metadata: {
    persona_id: 'cognitive-activation-hub',
    journey_track: 'default',
    phase_id: 'cognitive-orientation',
    language: 'en'
  },
  ui_blocks: [
    {
      kind: 'text_block',
      id: 'growth-intro',
      title: 'Growth Analysis',
      body_markdown: 'Here is the analysis from the Growth Agent.'
    },
    {
      kind: 'evaluation_block',
      id: 'growth-eval-1',
      title: 'Growth Strategy Assessment',
      global_score: 85,
      max_score: 100,
      feedback: 'Strong acquisition strategy but retention needs work.',
      axes: [
        { name: 'Acquisition', score: 9, max_score: 10, comment: 'Excellent channels.' },
        { name: 'Retention', score: 6, max_score: 10, comment: 'High churn risk.' }
      ]
    }
  ],
  agent_actions: [],
  next_state: {
    phase_id: 'cognitive-orientation',
    completed_missions: [],
    xp_delta: 0
  }
} as const;

test.describe('Growth Agent Integration', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await disablePageAnimations(page);
    await setupJourneyMocks(page, { personaId: 'cognitive-activation-hub' });

    await page.route('**/api/agents/runs**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      });
    });

    await page.addInitScript(() => {
      const personaId = 'cognitive-activation-hub';
      sessionStorage.setItem('accessToken', 'e2e-token');
      sessionStorage.setItem('refreshToken', 'e2e-refresh-token');
      localStorage.setItem('userId', 'user-123');
      const persisted = {
        state: {
          selectedPersona: null,
          userProgress: {
            totalXP: 0,
            nfts: [],
            nftMints: [],
            passLevel: 'Free',
            mfaiTokens: 0,
            stakedMfai: 0,
            walletConnected: false,
            completedPhases: [],
            currentPersona: personaId,
            votingPower: 0,
            daoProposals: 0,
            testnetAirdropClaimed: false,
            socialShareCount: 0,
            shareHistory: []
          }
        },
        version: 0
      };
      localStorage.setItem('mfai-journey-storage', JSON.stringify(persisted));
    });

    await page.goto('/journeys/cognitive-activation-hub');
    await page.waitForURL('**/journeys/cognitive-activation-hub', { timeout: 20000 });
    await page.evaluate(async () => {
      const [{ personas }, { useJourneyStore }] = await Promise.all([
        import('/src/data/personas.ts'),
        import('/src/store/journeyStore.ts'),
      ]);
      const persona = personas.find((p) => p.id === 'cognitive-activation-hub');
      if (persona) {
        useJourneyStore.getState().setSelectedPersona(persona);
      }
    });
    await expect(page.getByRole('heading', { name: 'Current Phase' })).toBeVisible({ timeout: 20000 });
  });

  test('should display Growth Agent evaluation', async ({ page }) => {
    await page.evaluate(async (evaluation) => {
      const [{ tokenStore }, { useJourneyStore }] = await Promise.all([
        import('/src/utils/tokenStore.ts'),
        import('/src/store/journeyStore.ts')
      ]);

      tokenStore.setAccessToken('e2e-token');
      tokenStore.setRefreshToken('e2e-refresh-token');

      useJourneyStore.setState((state) => ({
        ...state,
        isSubmittingPhase: false,
        lastStep: evaluation,
        userProgress: {
          ...state.userProgress,
          completedPhases: Array.from(new Set([...state.userProgress.completedPhases, state.currentPhase])),
          totalXP: state.userProgress.totalXP + (evaluation.next_state?.xp_delta ?? 0)
        }
      }));
    }, growthEvaluationStep);

    await expect(page.getByText('Growth Strategy Assessment')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('85')).toBeVisible();
    await expect(page.getByText('Acquisition', { exact: true })).toBeVisible();
    await expect(page.getByText('Retention', { exact: true })).toBeVisible();
    await expect(page.getByText(/Strong acquisition strategy/i)).toBeVisible();
    await expect(page.getByText(/High churn risk/i)).toBeVisible();
  });
});

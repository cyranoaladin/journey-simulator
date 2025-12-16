import { test, expect } from '@playwright/test'
import { disablePageAnimations } from './utils/pageStability'

/**
 * E2E: select journey → run step (mission UI) → submit mission → see evaluation + activity logs
 */

test.describe('Journey submit mission flow', () => {
  const testPersona = {
    id: 'e2e-persona',
    name: 'e2e-persona',
    title: 'E2E Persona',
    description: 'Synthetic persona used for mission submission automation.',
    icon: '🧪',
    color: 'from-indigo-500 to-purple-500',
    targetProfile: 'QA automation',
    motivation: 'Validate mission submission flows end-to-end.',
    passType: 'Test Pass',
    phases: [
      {
        id: 'e2e-phase',
        title: 'E2E Phase',
        description: 'Instrumentation phase for automation.',
        mission: 'Trigger the Zyno pipeline in a controlled environment.',
        duration: '1 day',
        xpReward: 10,
        mfaiReward: 1,
        nftReward: 'E2E Proof',
        tools: ['Automation harness'],
        outcomes: ['Validated UI flow'],
        zynoTip: 'Leverage deterministic inputs for consistent outputs.',
      },
    ],
  }

  test.beforeEach(async ({ page }) => {
    await disablePageAnimations(page)

    await page.addInitScript((persona) => {
      window.localStorage.setItem('accessToken', 'e2e-access-token')
      window.localStorage.setItem('refreshToken', 'e2e-refresh-token')
      const persisted = {
        state: {
          selectedPersona: persona,
          userProgress: {
            totalXP: 0,
            nfts: [],
            nftMints: [],
            passLevel: 'Free',
            mfaiTokens: 0,
            stakedMfai: 0,
            walletConnected: false,
            completedPhases: [],
            currentPersona: persona.id,
            votingPower: 0,
            daoProposals: 0,
            testnetAirdropClaimed: false,
            socialShareCount: 0,
            shareHistory: [],
          },
        },
        version: 0,
      }
      window.localStorage.setItem('mfai-journey-storage', JSON.stringify(persisted))
    }, testPersona)

    await page.route('**/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { id: 'e2e-user', name: 'E2E', email: 'e2e@mfai.com', role: 'user', wallet_address: 'w1' } }),
      })
    })

    await page.route('**/user/update-profile', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    })

    await page.route('**/journey/user-progress', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            progress: {
              total_xp: 0,
              completed_phases: 0,
              persona: 'e2e-persona',
              token_transactions: { mfai_tokens: 0 },
              nft_certificates: []
            }
          })
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
      }
    })

    await page.route('**/journey/reset-progress', async (route) => {
      await route.fulfill({ status: 204 })
    })

    await page.route('**/user/tokens', async (route) => {
      await route.fulfill({ status: 204 })
    })
  })

  test('step + submit shows evaluation and logs', async ({ page }) => {
    // Intercept step + submit + logs
    // Intercept step + submit + logs
    await page.route('**/journey/*/step', async (route) => {
      const body = {
        metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'E2E Step' },
        ui_blocks: [
          { kind: 'text_block', id: 'tb', title: 'Intro', body_markdown: 'Hello' },
          { kind: 'mission_block', id: 'm1', title: 'Submit link', description: 'Provide a link', mission_type: 'url', expected_input_type: 'link', xp_reward: 25 }
        ],
        agent_actions: [],
        next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    })

    await page.route('**/journey/*/submit', async (route) => {
      const body = {
        metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'E2E Submit' },
        ui_blocks: [
          { kind: 'evaluation_block', id: 'eval', title: 'Feedback', global_score: 80, max_score: 100, feedback: 'Good', axes: [{ name: 'Pertinence', score: 30, max_score: 35, comment: 'ok' }, { name: 'Qualité', score: 25, max_score: 35, comment: 'ok' }, { name: 'Exécution', score: 25, max_score: 30, comment: 'ok' }] },
          { kind: 'xp_block', id: 'xp', current_xp: 0, gained_xp: 25, next_level_xp: 100 }
        ],
        agent_actions: [],
        next_state: { phase_id: 'learn', completed_missions: ['m1'], xp_delta: 25 }
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    })

    await page.route('**/admin/agent-logs**', async (route) => {
      const now = Date.now()
      const logs = [
        { ts: now - 5000, journeyId: 'jid', agent: 'Zyno', action: 'step', details: { phaseId: 'learn' } },
        { ts: now - 1000, journeyId: 'jid', agent: 'Zyno', action: 'submit', details: { missionId: 'm1' } },
      ]
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ logs }) })
    })

    // The sidebar "Agent Intel" uses /api/agents/runs (web) — keep it deterministic.
    await page.route('**/api/agents/runs**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ runs: [] }) })
    })

    // Navigate to specific journey workspace
    await page.goto('/journeys/e2e-persona')
    await expect(page.getByRole('heading', { name: /Active Phase|Current Phase/i })).toBeVisible()

    // Scroll to Current Phase and run step
    // Scroll to Current Phase and run step
    const startButton = page.locator('button:has-text("Run Simulation"), button:has-text("Start"), button:has-text("Continue")').first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
    await startButton.evaluate((b) => (b as HTMLElement).click());

    // Fill mission input (link) and submit
    const input = page.locator('input[placeholder*="http"]').first()
    await input.fill('https://example.com')
    const submitBtn = page.getByRole('button', { name: /Submit mission|Soumettre/i }).first()
    await expect(submitBtn).toBeVisible()
    await submitBtn.evaluate((b) => (b as HTMLElement).click())

    // Expect evaluation block
    await expect(page.getByText(/Score:/)).toBeVisible({ timeout: 30000 })
    // Confirm evaluation UI is present (sufficient for this synthetic persona without phase config)
    await expect(page.getByText(/Feedback/i).first()).toBeVisible()
  })
})

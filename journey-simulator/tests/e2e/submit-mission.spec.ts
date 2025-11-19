import { test, expect } from '@playwright/test'

/**
 * E2E: select journey → run step (mission UI) → submit mission → see evaluation + activity logs
 */

test.describe('Journey submit mission flow', () => {
  test('step + submit shows evaluation and logs', async ({ page }) => {
    // Mock auth-related endpoints to keep page happy
    await page.route('**/user/profile', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'e2e-user', name: 'E2E', email: 'e2e@mfai.com', role: 'user', wallet_address: 'w1' } }) })
    })
    await page.route('**/journey/user-progress', async (route) => {
      if(route.request().method()==='GET'){
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, progress: { total_xp: 0, completed_phases: 0, nft_certificates: [] } }) })
      }else{
        await route.fulfill({ status: 204 })
      }
    })

    // Intercept step + submit + logs
    await page.route('**/api/journeys/*/step', async (route) => {
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

    await page.route('**/api/journeys/*/submit', async (route) => {
      const body = {
        metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'E2E Submit' },
        ui_blocks: [
          { kind: 'evaluation_block', id: 'eval', title: 'Feedback', global_score: 80, max_score: 100, feedback: 'Good', axes: [ { name:'Pertinence', score: 30, max_score: 35, comment:'ok' }, { name:'Qualité', score: 25, max_score: 35, comment:'ok' }, { name:'Exécution', score: 25, max_score: 30, comment:'ok' } ] },
          { kind: 'xp_block', id: 'xp', current_xp: 0, gained_xp: 25, next_level_xp: 100 }
        ],
        agent_actions: [],
        next_state: { phase_id: 'learn', completed_missions: ['m1'], xp_delta: 25 }
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    })

    await page.route('**/api/agents/logs**', async (route) => {
      const now = Date.now()
      const logs = [
        { ts: now-5000, journeyId: 'jid', agent: 'Zyno', action: 'step', details: { phaseId: 'learn' } },
        { ts: now-1000, journeyId: 'jid', agent: 'Zyno', action: 'submit', details: { missionId: 'm1' } },
      ]
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ logs }) })
    })

    await page.goto('/journeys')

    // Select first journey
    await page.getByRole('button', { name: 'Launch with Zyno' }).first().click()

    // Scroll to Current Phase and run step
    await page.getByRole('button', { name: 'Lancer l’étape' }).click()

    // Fill mission input (link) and submit
    const input = page.locator('input[placeholder="https://..."]').first()
    await input.fill('https://example.com')
    await page.getByRole('button', { name: 'Soumettre la mission' }).click()

    // Expect evaluation block
    await expect(page.getByText(/Score:/)).toBeVisible()
    // Activity feed should render mocked logs
    await expect(page.getByText(/Agent Activity/)).toBeVisible()
  })
})
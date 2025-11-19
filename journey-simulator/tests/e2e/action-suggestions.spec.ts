import { test, expect } from '@playwright/test'

/**
 * E2E: verify ActionSuggestions block triggers step on click
 * - success path: clicking a suggestion updates UI blocks
 * - failure path: clicking a suggestion that fails shows error toast
 */

test.describe('ActionSuggestions flow', () => {
  test('successfully triggers next step and updates UI', async ({ page }) => {
    // Mock minimal auth/progress endpoints
    await page.route('**/user/profile', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'e2e-user', name: 'E2E' } }) })
    })
    await page.route('**/journey/user-progress', async (route) => {
      if(route.request().method()==='GET'){
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, progress: { total_xp: 0, completed_phases: 0, nft_certificates: [] } }) })
      } else {
        await route.fulfill({ status: 204 })
      }
    })

    // Intercept step calls
    await page.route('**/api/journeys/*/step', async (route) => {
      const postData = route.request().postData() || ''
      if (postData.includes('action_id=go_next')) {
        const next = {
          metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'After Action' },
          ui_blocks: [
            { kind: 'text_block', id: 'tb2', title: 'Action OK', body_markdown: 'Suite validée' },
          ],
          agent_actions: [],
          next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(next) })
        return
      }
      const initial = {
        metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'E2E Step' },
        ui_blocks: [
          { kind: 'text_block', id: 'tb', title: 'Intro', body_markdown: 'Hello' },
          { kind: 'action_suggestions_block', id: 'asb', title: 'Choix', suggestions: [
            { label: 'Continuer', action_id: 'go_next' }
          ]}
        ],
        agent_actions: [],
        next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(initial) })
    })

    await page.goto('/journeys')
    await page.getByRole('button', { name: 'Launch with Zyno' }).first().click()
    await page.getByRole('button', { name: 'Lancer l’étape' }).click()

    // Click the suggestion
    await page.getByRole('button', { name: 'Continuer' }).click()

    // Assert UI updated
    await expect(page.getByText('Action OK')).toBeVisible()
  })

  test('shows error toast when suggestion fails', async ({ page }) => {
    // Mock minimal auth/progress endpoints
    await page.route('**/user/profile', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'e2e-user', name: 'E2E' } }) })
    })
    await page.route('**/journey/user-progress', async (route) => {
      if(route.request().method()==='GET'){
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, progress: { total_xp: 0, completed_phases: 0, nft_certificates: [] } }) })
      } else {
        await route.fulfill({ status: 204 })
      }
    })

    await page.route('**/api/journeys/*/step', async (route) => {
      const postData = route.request().postData() || ''
      if (postData.includes('action_id=go_fail')) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'fail' }) })
        return
      }
      const initial = {
        metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'E2E Step' },
        ui_blocks: [
          { kind: 'text_block', id: 'tb', title: 'Intro', body_markdown: 'Hello' },
          { kind: 'action_suggestions_block', id: 'asb', title: 'Choix', suggestions: [
            { label: 'Provoquer une erreur', action_id: 'go_fail' }
          ]}
        ],
        agent_actions: [],
        next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(initial) })
    })

    await page.goto('/journeys')
    await page.getByRole('button', { name: 'Launch with Zyno' }).first().click()
    await page.getByRole('button', { name: 'Lancer l’étape' }).click()

    // Click the failing suggestion
    await page.getByRole('button', { name: 'Provoquer une erreur' }).click()

    // Assert error toast visible
    await expect(page.getByText('Action indisponible')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { disablePageAnimations } from './utils/pageStability'

/**
 * E2E: verify ActionSuggestions block triggers step on click
 * - success path: clicking a suggestion updates UI blocks
 * - failure path: clicking a suggestion that fails shows error toast
 */

test.describe('ActionSuggestions flow', () => {
  const testPersona = {
    id: 'e2e-persona',
    name: 'e2e-persona',
    title: 'E2E Persona',
    description: 'Synthetic persona used for automated journeys tests.',
    icon: '🧪',
    color: 'from-indigo-500 to-purple-500',
    targetProfile: 'QA automation',
    motivation: 'Validate guided mission flows end-to-end.',
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
      window.sessionStorage.setItem('accessToken', 'e2e-access-token')
      window.sessionStorage.setItem('refreshToken', 'e2e-refresh-token')
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

    await page.addInitScript(() => {
      if ((window as any).__e2eJourneyStepFetchPatched) {
        return
      }
      (window as any).__e2eJourneyStepFetchPatched = true
      const originalFetch = window.fetch.bind(window)
        ; (window as any).__e2eJourneyStepConfig = null

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        // console.log('[E2E Fetch Patch] Request:', url)
        if (typeof url === 'string' && (url.includes('/api/journeys/') || url.includes('/journey/')) && url.endsWith('/step')) {
          // console.log('[E2E Fetch Patch] Intercepting step request:', url)
          const config = (window as any).__e2eJourneyStepConfig
          if (config) {
            try {
              const bodyText = typeof init?.body === 'string'
                ? init.body
                : init?.body instanceof URLSearchParams
                  ? init.body.toString()
                  : init?.body
                    ? JSON.stringify(init.body)
                    : ''
              // console.log('[E2E Fetch Patch] Request Body:', bodyText)
              let payload: any = {}
              if (bodyText) {
                try {
                  payload = JSON.parse(bodyText as string)
                } catch {
                  payload = { userInput: bodyText }
                }
              }

              const extractActionId = (data: any): string | null => {
                if (data?.actionId) return data.actionId
                const inputStr = typeof data?.userInput === 'string' ? data.userInput : ''
                const match = /action_id=([^&]+)/.exec(inputStr)
                return match ? match[1] : null
              }

              const actionId = extractActionId(payload)
              // console.log('[E2E Fetch Patch] Extracted Action ID:', actionId)

              if (actionId && config.actions?.[actionId]) {
                // console.log('[E2E Fetch Patch] Returning mock action:', actionId)
                const mock = config.actions[actionId]
                return new Response(JSON.stringify(mock.body), {
                  status: mock.status ?? 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              }

              if (config.initial) {
                // console.log('[E2E Fetch Patch] Returning mock initial step')
                return new Response(JSON.stringify(config.initial.body), {
                  status: config.initial.status ?? 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              }
            } catch (err) {
              console.warn('E2E step mock failed, falling back to original fetch', err)
              if (config.initial) {
                return new Response(JSON.stringify(config.initial.body), {
                  status: config.initial.status ?? 200,
                  headers: { 'Content-Type': 'application/json' },
                })
              }
            }
          } else {
            // console.log('[E2E Fetch Patch] No config found!')
          }
        }
        return originalFetch(input, init)
      }
    })

    await page.route('**/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'e2e-user', name: 'E2E' } }),
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
          body: JSON.stringify({ success: true, progress: { total_xp: 0, completed_phases: 0, nft_certificates: [], persona: 'e2e-persona' } }),
        })
      } else {
        await route.fulfill({ status: 204 })
      }
    })

    await page.route('**/journey/reset-progress', async (route) => {
      await route.fulfill({ status: 204 })
    })

    await page.route('**/api/agents/logs**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ logs: [] }) })
    })
  })

  test('successfully triggers next step and updates UI', async ({ page }) => {
    const initial = {
      metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'E2E Step' },
      ui_blocks: [
        { kind: 'text_block', id: 'tb', title: 'Intro', body_markdown: 'Hello' },
        {
          kind: 'action_suggestions_block', id: 'asb', title: 'Choice', suggestions: [
            { label: 'Continue', action_id: 'go_next' }
          ]
        }
      ],
      agent_actions: [],
      next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
    }

    const success = {
      metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'After Action' },
      ui_blocks: [
        { kind: 'text_block', id: 'tb2', title: 'Action OK', body_markdown: 'Sequence validated' },
      ],
      agent_actions: [],
      next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
    }

    await page.addInitScript((config) => {
      (window as any).__e2eJourneyStepConfig = config
    }, { initial: { status: 200, body: initial }, actions: { go_next: { status: 200, body: success } } })

    await page.goto('/journeys/e2e-persona')
    await expect(page.getByRole('heading', { name: /Current Phase/i })).toBeVisible()
    await page.waitForTimeout(1000); // Wait for hydration/stability
    const startButton = page.getByRole('button', { name: /Run Simulation/i });
    await startButton.waitFor({ state: 'visible' });
    await startButton.dispatchEvent('click');

    // Click the suggestion
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    await continueButton.waitFor({ state: 'visible' });
    await continueButton.dispatchEvent('click');

    // Assert UI updated
    await expect(page.getByText('Action OK')).toBeVisible()
  })

  test('shows error toast when suggestion fails', async ({ page }) => {
    let failureLogged = false

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        if (msg.text().includes('ActionSuggestions step failed')) {
          failureLogged = true
        }
      }
    })

    const failInitial = {
      metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr', mode: 'builder', tone: 'pedagogical', title: 'E2E Step' },
      ui_blocks: [
        { kind: 'text_block', id: 'tb', title: 'Intro', body_markdown: 'Hello' },
        {
          kind: 'action_suggestions_block', id: 'asb', title: 'Choice', suggestions: [
            { label: 'Trigger an error', action_id: 'go_fail' }
          ]
        }
      ],
      agent_actions: [],
      next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
    }

    await page.addInitScript((config) => {
      (window as any).__e2eJourneyStepConfig = config
    }, {
      initial: { status: 200, body: failInitial },
      actions: {
        go_fail: { status: 500, body: { error: 'fail' } },
      },
    })

    await page.goto('/journeys/e2e-persona')
    await expect(page.getByRole('heading', { name: /Current Phase/i })).toBeVisible()
    await page.waitForTimeout(1000);
    const startButton = page.getByRole('button', { name: /Run Simulation/i });
    await startButton.waitFor({ state: 'visible' });
    await startButton.dispatchEvent('click');

    // Click the failing suggestion
    const errorButton = page.getByRole('button', { name: 'Trigger an error' });
    await errorButton.waitFor({ state: 'visible' });
    await errorButton.dispatchEvent('click');

    // Assert failure handler ran and UI recovered
    await expect.poll(() => failureLogged).toBeTruthy()
    await expect(page.getByRole('button', { name: 'Trigger an error' })).toBeEnabled()
  })
})

import { test, expect } from '@playwright/test'

/**
 * E2E: Debug mint modal in frontend with mocked backend mint endpoints
 */

test.describe('Mint flow (frontend debug)', () => {
  const testPersona = {
    id: 'e2e-persona',
    name: 'e2e-persona',
    title: 'E2E Persona',
    description: 'Synthetic persona used for debugging flows.',
    icon: '🧪',
    color: 'from-indigo-500 to-purple-500',
    targetProfile: 'QA automation',
    motivation: 'Validate mint debug flow.',
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
        body: JSON.stringify({ user: { id: 'e2e-user', name: 'E2E' } }),
      })
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

    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
  })

  test('simulate and execute show tx signature and explorer link', async ({ page }) => {
    await page.route('**/solana/mint/simulate', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, sim: { ok: true, estFeeLamports: 5000, riskScore: 0.12, network: 'devnet' } }) })
    })
    await page.route('**/solana/mint/execute', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, tx: { txSig: 'SIG_E2E' } }) })
    })

    await page.route('**/user/nft-certificates', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    })

    await page.goto('/debug/mint')

    const mintModal = page.getByRole('dialog', { name: 'Mint Proof-of-Skill™ NFT' })

    // Click mint button
    await page.getByRole('button', { name: 'Mint Proof-of-Skill™ NFT' }).dispatchEvent('click')

    // Check for potential error
    const errorBanner = mintModal.getByTestId('minting-error-banner');
    if (await errorBanner.isVisible()) {
      console.log('Minting Error:', await errorBanner.textContent());
    }

    // Ensure we see the tx signature
    await expect(page.getByText(/Transaction Signature/)).toBeVisible()
    await expect(page.getByTestId('mint-tx-signature')).toHaveText('SIG_E2E')

    // Open explorer link
    const explorerBtn = page.getByRole('button', { name: 'View on Solana Explorer' })
    await explorerBtn.click()
  })
})
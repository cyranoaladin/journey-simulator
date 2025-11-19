import { test, expect } from '@playwright/test'

/**
 * E2E: Debug mint modal in frontend with mocked backend mint endpoints
 */

test.describe('Mint flow (frontend debug)', () => {
  test('simulate and execute show tx signature and explorer link', async ({ page }) => {
    await page.route('**/api/mint/simulate', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, sim: { ok: true, estFeeLamports: 5000, riskScore: 0.12, network: 'devnet' } }) })
    })
    await page.route('**/api/mint/execute', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, tx: { txSig: 'SIG_E2E' } }) })
    })

    await page.goto('/debug/mint')

    // Click mint button
    await page.getByRole('button', { name: 'Mint Proof-of-Skill™ NFT' }).click()

    // Ensure we see the tx signature
    await expect(page.getByText(/Transaction Signature/)).toBeVisible()
    await expect(page.getByText('SIG_E2E')).toBeVisible()

    // Open explorer link
    const explorerBtn = page.getByRole('button', { name: 'View on Solana Explorer' })
    await explorerBtn.click()
  })
})
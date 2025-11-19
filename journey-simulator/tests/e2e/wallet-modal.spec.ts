import { test, expect } from '@playwright/test'

test.describe('Wallet Modal', () => {
  test('exposes configured wallets and devnet endpoint', async ({ page }) => {
    await page.route('**/user/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accessToken: 'access-token-wallet',
          refreshToken: 'refresh-token-wallet',
          user: {
            id: 'user-wallet',
            name: 'Demo User',
            email: 'demo@mfai.com',
            role: 'user',
            wallet_address: 'wallet1234',
          },
        }),
      })
    })

    await page.route('**/journey/user-progress', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ total_xp: 0, completed_phases: [] }),
        })
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 204 })
      }
    })

    await page.route('**/journey/reset-progress', async (route) => {
      await route.fulfill({ status: 204 })
    })

    await page.route('**/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-wallet',
            name: 'Demo User',
            email: 'demo@mfai.com',
            role: 'user',
            wallet_address: 'wallet1234',
          },
        }),
      })
    })

    await page.goto('/login')

    const adapters = await page.evaluate(() => {
      return new Promise<string[]>((resolve) => {
        const globalWindow = window as typeof window & {
          __MFAI_WALLET_ADAPTERS__?: string[]
        }

        if (Array.isArray(globalWindow.__MFAI_WALLET_ADAPTERS__)) {
          resolve(globalWindow.__MFAI_WALLET_ADAPTERS__)
          return
        }

        const handler = (event: Event) => {
          resolve((event as CustomEvent<string[]>).detail)
        }

        window.addEventListener('walletAdaptersReady', handler, { once: true })
      })
    })

    expect(adapters).toEqual(expect.arrayContaining(['Phantom', 'Solflare', 'Torus']))

    await page.locator('input[name="email"]').fill('demo@mfai.com')
    await page.locator('input[name="password"]').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await page.waitForURL('**/journeys')
    await expect(page).toHaveURL(/\/journeys$/)

    const networkMeta = await page.evaluate(() => {
      const globalWindow = window as typeof window & {
        __MFAI_SOLANA_NETWORK__?: string
        __MFAI_SOLANA_ENDPOINT__?: string
      }

      return {
        network: globalWindow.__MFAI_SOLANA_NETWORK__,
        endpoint: globalWindow.__MFAI_SOLANA_ENDPOINT__,
      }
    })

    expect(networkMeta.network).toMatch(/devnet/i)
    expect(networkMeta.endpoint).toMatch(/devnet/i)

    const connectButton = page.getByRole('button', { name: /Connect Wallet/i })
    await connectButton.evaluate((button: HTMLButtonElement) => button.click())

    await expect(page.getByRole('button', { name: 'Phantom' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Solflare' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Torus' })).toBeVisible()
  })
})

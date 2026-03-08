import { test, expect } from '@playwright/test'

test.describe('Health Checks', () => {
  test('health endpoint responds', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/api/health')
    expect(response?.status()).toBe(200)
  })

  test('app loads', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await expect(page.locator('body')).toBeTruthy()
  })
})

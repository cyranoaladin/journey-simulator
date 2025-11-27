import { test, expect } from '@playwright/test';

/**
 * Verifies that a successful login response from the backend updates client state
 * and redirects the user to the journeys dashboard.
 */
test.describe('Login Flow', () => {
  test('redirects after successful authentication', async ({ page }) => {
    await page.route('**/user/login', async (route) => {
      const body = JSON.stringify({
        success: true,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 'user-123',
          name: 'Demo User',
          email: 'demo@mfai.com',
          role: 'user',
          wallet_address: 'wallet1234',
        },
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    });

    await page.route('**/journey/user-progress', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            total_xp: 0,
            current_level: 1,
            completed_phases: [],
            currentPersona: null
          }),
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 204 });
      }
    });

    await page.route('**/journey/reset-progress', async (route) => {
      await route.fulfill({ status: 204 });
    });

    await page.route('**/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-123',
            name: 'Demo User',
            email: 'demo@mfai.com',
            role: 'user',
            wallet_address: 'wallet1234',
          },
        }),
      });
    });

    await page.goto('/login');

    await page.locator('input[name="email"]').fill('demo@mfai.com');
    await page.locator('input[name="password"]').fill('demo123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/journeys', { timeout: 15000 });
    await expect(page).toHaveURL(/\/journeys$/);

    // Wait a bit longer for tokens to be stored
    await page.waitForFunction(
      () => localStorage.getItem('accessToken') === 'access-token-123',
      { timeout: 10000 }
    );
    await page.waitForFunction(
      () => localStorage.getItem('refreshToken') === 'refresh-token-456',
      { timeout: 10000 }
    );
  });
});

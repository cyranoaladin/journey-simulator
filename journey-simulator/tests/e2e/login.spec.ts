import { test, expect } from '@playwright/test';

/**
 * Basic smoke test ensuring the login page renders and input fields remain interactive.
 */
test.describe('Login Page', () => {
  test('allows typing into credentials fields', async ({ page }) => {
    await page.goto('/login');

    const heading = page.getByRole('heading', { name: /welcome back/i });
    await expect(heading).toBeVisible();

    const emailField = page.locator('input[name="email"]');
    await expect(emailField).toBeEditable();
    await emailField.fill('tester@example.com');
    await expect(emailField).toHaveValue('tester@example.com');

    const passwordField = page.locator('input[name="password"]');
    await expect(passwordField).toBeEditable();
    await passwordField.fill('password123');
    await expect(passwordField).toHaveValue('password123');
  });
});

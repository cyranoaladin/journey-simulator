import { test, expect } from '@playwright/test';

test.describe.skip('Deep Linking Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Mock user profile for auth check (called on app load)
        await page.route('**/user/profile', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    user: {
                        id: 'user-123',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'user'
                    }
                })
            });
        });

        // Mock user progress
        await page.route('**/journey/user-progress', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        // Keep persona null so invalid journey IDs don't get forced into a valid workspace
                        // via progress hydration (the journeyId param should drive selection).
                        progress: { total_xp: 0, completed_phases: 0, persona: null, token_transactions: { mfai_tokens: 0 }, nft_certificates: [] }
                    })
                });
            } else {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
            }
        });

        // Inject auth token before any navigation (TokenStore uses sessionStorage for accessToken)
        await page.addInitScript(() => {
            sessionStorage.setItem('accessToken', 'mock-access-token');
            localStorage.setItem('userId', 'user-123');
        });
    });

    test('should navigate directly to a specific journey via URL', async ({ page }) => {
        // Navigate directly to the deep link
        await page.goto('/journeys/capital-foundry');

        // Verify that the specific persona workspace is loaded
        // We look for the title "The Capital Foundry" which is specific to this persona
        await expect(page.getByRole('heading', { name: 'The Capital Foundry', level: 2 })).toBeVisible({ timeout: 15000 });

        // Verify we are in the workspace view
        await expect(page.getByTestId('back-to-journeys')).toBeVisible();
    });

    test('should handle invalid journey IDs gracefully', async ({ page }) => {
        await page.goto('/journeys/invalid-id');

        // Should show the list of personas (Journey Cards) because no persona matches
        await expect(page.getByText(/Choose Your Path/i)).toBeVisible({ timeout: 15000 });

        // "Back to all journeys" should NOT be visible
        await expect(page.getByTestId('back-to-journeys')).not.toBeVisible();
    });
});

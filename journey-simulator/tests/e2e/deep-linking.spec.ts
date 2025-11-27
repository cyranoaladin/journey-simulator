import { test, expect } from '@playwright/test';

test.describe('Deep Linking Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Mock user profile for auth check (called on app load)
        await page.route('**/user/profile', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
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
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    total_xp: 0,
                    completed_phases: [],
                    currentPersona: null
                })
            });
        });

        // Inject auth token into localStorage before any navigation
        await page.addInitScript(() => {
            localStorage.setItem('accessToken', 'mock-access-token');
            localStorage.setItem('userId', 'user-123');
        });
    });

    test('should navigate directly to a specific journey via URL', async ({ page }) => {
        // Navigate directly to the deep link
        await page.goto('/journeys/capital-foundry');

        // Verify that the specific persona workspace is loaded
        // We look for the title "The Capital Foundry" which is specific to this persona
        await expect(page.locator('text=The Capital Foundry')).toBeVisible({ timeout: 15000 });

        // Verify we are in the workspace view
        await expect(page.locator('button:has-text("Back to all journeys")')).toBeVisible();
    });

    test('should handle invalid journey IDs gracefully', async ({ page }) => {
        await page.goto('/journeys/invalid-id');

        // Should show the list of personas (Journey Cards) because no persona matches
        await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 15000 });

        // "Back to all journeys" should NOT be visible
        await expect(page.locator('button:has-text("Back to all journeys")')).not.toBeVisible();
    });
});

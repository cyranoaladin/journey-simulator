import { test, expect } from '@playwright/test';

test.describe('Journey Navigation Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication
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
                    total_xp: 150,
                    completed_phases: [0],
                    currentPersona: null
                })
            });
        });

        // Inject auth token
        await page.addInitScript(() => {
            localStorage.setItem('accessToken', 'mock-access-token');
            localStorage.setItem('userId', 'user-123');
        });
    });

    test('should navigate from persona selection to workspace', async ({ page }) => {
        // Start at journeys page
        await page.goto('/journeys');

        // Verify we see the persona selection screen
        await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 10000 });

        // Click on a persona card (Capital Foundry)
        const personaCard = page.locator('text=The Capital Foundry').first();
        await expect(personaCard).toBeVisible();

        // Find and click the "Start Journey" or similar button within the card
        const startButton = page.locator('button:has-text("Start Journey")').first();
        await startButton.click();

        // Verify we're now in the workspace
        await expect(page.locator('button:has-text("Back to all journeys")')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=The Capital Foundry')).toBeVisible();
    });

    test('should navigate back from workspace to persona selection', async ({ page }) => {
        // Navigate directly to a journey workspace
        await page.goto('/journeys/cognitive-activation-hub');

        // Verify we're in the workspace
        await expect(page.locator('button:has-text("Back to all journeys")')).toBeVisible({ timeout: 10000 });

        // Click the back button
        await page.click('button:has-text("Back to all journeys")');

        // Verify we're back at persona selection
        await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 10000 });

        // Verify the "Back to all journeys" button is no longer visible
        await expect(page.locator('button:has-text("Back to all journeys")')).not.toBeVisible();
    });

    test('should maintain journey state when navigating between routes', async ({ page }) => {
        // Navigate to a specific journey
        await page.goto('/journeys/capital-foundry');
        await expect(page.locator('text=The Capital Foundry')).toBeVisible({ timeout: 10000 });

        // Navigate to dashboard
        await page.goto('/dashboard');
        await expect(page.locator('text=Dashboard').or(page.locator('text=Welcome'))).toBeVisible({ timeout: 10000 });

        // Navigate back to journeys
        await page.goto('/journeys');

        // The persona should still be selected (workspace should be visible)
        await expect(page.locator('button:has-text("Back to all journeys")')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=The Capital Foundry')).toBeVisible();
    });

    test('should allow switching between different journeys', async ({ page }) => {
        // Start with one journey
        await page.goto('/journeys/capital-foundry');
        await expect(page.locator('text=The Capital Foundry')).toBeVisible({ timeout: 10000 });

        // Go back to selection
        await page.click('button:has-text("Back to all journeys")');
        await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 10000 });

        // Select a different journey via deep link
        await page.goto('/journeys/cognitive-activation-hub');
        await expect(page.locator('text=The Cognitive Activation Hub')).toBeVisible({ timeout: 10000 });

        // Verify we're in the new workspace
        await expect(page.locator('button:has-text("Back to all journeys")')).toBeVisible();
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
        // Navigate to persona selection
        await page.goto('/journeys');
        await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 10000 });

        // Navigate to a specific journey
        await page.goto('/journeys/capital-foundry');
        await expect(page.locator('text=The Capital Foundry')).toBeVisible({ timeout: 10000 });

        // Use browser back button
        await page.goBack();
        await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 10000 });

        // Use browser forward button
        await page.goForward();
        await expect(page.locator('text=The Capital Foundry')).toBeVisible({ timeout: 10000 });
    });
});

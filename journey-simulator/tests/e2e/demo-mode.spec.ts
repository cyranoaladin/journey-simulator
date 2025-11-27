import { test, expect } from '@playwright/test';

test.describe('Demo Mode Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Mock login response
        await page.route('**/user/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token',
                    user: {
                        id: 'user-123',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'user'
                    }
                })
            });
        });

        // Mock user profile
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

        // Mock user progress (required for journey page)
        await page.route('**/journey/user-progress', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    total_xp: 0,
                    current_level: 1,
                    completed_phases: [],
                    currentPersona: null
                })
            });
        });

        // Mock load demo endpoint
        await page.route('**/journey/load-demo', async (route) => {
            const request = route.request();
            const postData = request.postDataJSON();

            // Verify request payload
            expect(postData.personaId).toBeDefined();

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    message: 'Demo state loaded successfully',
                    journey: {
                        _id: 'journey-123',
                        journey_type: postData.personaId,
                        user_id: 'user-123',
                        current_phase: 3,
                        completion_percentage: 60,
                        phases_status: [
                            { phase_number: 0, status: 'completed' },
                            { phase_number: 1, status: 'completed' },
                            { phase_number: 2, status: 'completed' }
                        ]
                    },
                    demo_state: {
                        total_xp: 2500,
                        current_level: 3
                    },
                    progress: {
                        total_xp: 2500,
                        current_level: 3,
                        completed_phases: 3,
                        nft_certificates: [],
                        token_transactions: { mfai_tokens: 100 },
                        subscription: 'free',
                        persona: postData.personaId
                    }
                })
            });
        });

        // Mock user progress update (called after demo load)
        await page.route('**/journey/user-progress', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        total_xp: 2500,
                        current_level: 3,
                        completed_phases: [0, 1, 2],
                        currentPersona: 'cognitive-activation-hub' // Important for UI state
                    })
                });
            } else if (route.request().method() === 'PUT') {
                await route.fulfill({ status: 204 });
            }
        });

        // Login first
        await page.goto('/login');
        await page.locator('input[name="email"]').fill('test@example.com');
        await page.locator('input[name="password"]').fill('password');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Wait for navigation and load
        await page.waitForURL('**/journeys', { timeout: 15000 });
        await page.waitForLoadState('networkidle');
    });

    test('should display Load Demo button on persona cards', async ({ page }) => {
        // Check if button exists on Cognitive Activation Hub card
        // Use a more specific selector to avoid ambiguity
        const demoButton = page.locator('button:has-text("Load Demo State")').first();
        await expect(demoButton).toBeVisible({ timeout: 15000 });
        await expect(demoButton).toHaveClass(/bg-yellow-500/);
    });

    test('should load demo state when button is clicked', async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        // Click the button for the first persona
        const demoButton = page.locator('button[title="Load pre-populated demo state for investor presentations"]').first();
        await expect(demoButton).toBeVisible();
        await demoButton.evaluate((node: HTMLElement) => node.click());

        // Wait for the workspace to load (indicated by "Back to all journeys" button)
        // This confirms that selectedPersona was updated in the store and the view switched
        const backButton = page.locator('button:has-text("Back to all journeys")');
        await expect(backButton).toBeVisible({ timeout: 15000 });
    });
});

import { test, expect } from '@playwright/test';

test.describe('Growth Agent Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Mock login
        await page.route('**/user/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    accessToken: 'mock-token',
                    refreshToken: 'mock-refresh',
                    user: { id: 'user-123', name: 'Test User', email: 'test@example.com', role: 'user' }
                })
            });
        });

        // Mock profile
        await page.route('**/user/profile', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: { id: 'user-123', name: 'Test User', email: 'test@example.com', role: 'user' }
                })
            });
        });

        // Mock user progress
        await page.route('**/journey/user-progress', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    total_xp: 1000,
                    current_level: 2,
                    completed_phases: [0],
                    currentPersona: 'cognitive-activation-hub'
                })
            });
        });

        // Mock Journey Step (Zyno Response with Growth Agent Evaluation)
        await page.route('**/journey/next-step', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    metadata: {
                        persona_id: 'cognitive-activation-hub',
                        journey_track: 'default',
                        phase_id: 'build',
                        language: 'en'
                    },
                    ui_blocks: [
                        {
                            kind: 'text_block',
                            id: 'intro',
                            title: 'Growth Analysis',
                            body_markdown: 'Here is the analysis from the Growth Agent.'
                        },
                        {
                            kind: 'evaluation_block',
                            id: 'growth-eval-1',
                            title: 'Growth Strategy Assessment',
                            global_score: 85,
                            max_score: 100,
                            feedback: 'Strong acquisition strategy but retention needs work.',
                            axes: [
                                { name: 'Acquisition', score: 9, max_score: 10, comment: 'Excellent channels.' },
                                { name: 'Retention', score: 6, max_score: 10, comment: 'High churn risk.' }
                            ]
                        }
                    ],
                    agent_actions: [],
                    next_state: {
                        phase_id: 'build',
                        completed_missions: [],
                        xp_delta: 0
                    }
                })
            });
        });

        // Login and navigate to workspace
        await page.goto('/login');
        await page.locator('input[name="email"]').fill('test@example.com');
        await page.locator('input[name="password"]').fill('password');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.waitForURL('**/journeys', { timeout: 10000 });

        // Select persona to enter workspace
        await page.locator('button:has-text("Continue journey")').first().click();
        await page.waitForLoadState('networkidle');
    });

    test('should display Growth Agent evaluation', async ({ page }) => {
        // Wait for any initial page loader to disappear
        await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });

        // Ensure we are on the workspace view
        // The test setup clicks the persona card, which should trigger the view change.
        // We wait for the "Back to all journeys" button to confirm we are in the workspace.
        await expect(page.locator('button:has-text("Back to all journeys")')).toBeVisible({ timeout: 10000 });

        // Trigger the step (Start/Continue button)
        // In the workspace, the button is "Start / Continue"
        const startBtn = page.getByRole('button', { name: /Start|Continue/i }).first();
        await expect(startBtn).toBeVisible({ timeout: 10000 });
        await startBtn.click({ force: true });

        // Wait for evaluation block to appear
        await expect(page.getByText('Growth Strategy Assessment')).toBeVisible({ timeout: 15000 });

        // Check score
        await expect(page.getByText('85')).toBeVisible();

        // Check axes
        await expect(page.getByText('Acquisition')).toBeVisible();
        await expect(page.getByText('Retention')).toBeVisible();

        // Check feedback
        await expect(page.getByText('Strong acquisition strategy')).toBeVisible();
    });
});

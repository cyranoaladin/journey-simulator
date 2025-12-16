import { test, expect } from '@playwright/test';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Growth Agent Integration', () => {
    test.setTimeout(60000);

    test.beforeEach(async ({ page }) => {
        await disablePageAnimations(page);

        // Inject auth token into localStorage before any navigation
        await page.addInitScript(() => {
            localStorage.setItem('accessToken', 'e2e-token');
            localStorage.setItem('refreshToken', 'e2e-refresh-token');
            localStorage.setItem('userId', 'user-123');
        });

        // Mock profile
        await page.route('**/user/profile', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    user: { id: 'user-123', name: 'Test User', email: 'test@example.com', role: 'user' }
                })
            });
        });

        // Mock user progress (Start at Phase 0)
        await page.route('**/journey/user-progress', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        progress: {
                            total_xp: 0,
                            completed_phases: 0,
                            persona: 'cognitive-activation-hub',
                            token_transactions: { mfai_tokens: 0 },
                            nft_certificates: []
                        }
                    })
                });
            } else {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
            }
        });

        await page.route('**/user/update-profile', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    user: {
                        id: 'test-user-id',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'user',
                        wallet_address: '0x123',
                        persona: 'cognitive-activation-hub'
                    }
                })
            });
        });

        // Mock submit mission (required before completePhase is called in JourneyWorkspace)
        await page.route('**/journey/**/submit', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    evaluation: { global_score: 9, max_score: 10 }
                })
            })
        })

        // Mock Complete Phase (Zyno Response with Growth Agent Evaluation)
        await page.route('**/journey/complete-phase', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    metadata: {
                        persona_id: 'cognitive-activation-hub',
                        journey_track: 'default',
                        phase_id: 'cognitive-orientation',
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
                        phase_id: 'cognitive-orientation',
                        completed_missions: [],
                        xp_delta: 0
                    }
                })
            });
        });

        // Navigate directly to workspace
        await page.goto('/journeys/cognitive-activation-hub');
        await expect(page.getByRole('heading', { name: 'Current Phase' })).toBeVisible({ timeout: 20000 });
    });

    test('should display Growth Agent evaluation', async ({ page }) => {
        // Listen for console logs
        page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));

        // Wait for any initial page loader to disappear
        await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });

        // Ensure we are on the workspace view
        // The test setup clicks the persona card, which should trigger the view change.
        // We wait for the "Back to all journeys" button to confirm we are in the workspace.
        await expect(page.getByTestId('back-to-journeys')).toBeVisible({ timeout: 10000 });

        // Complete phase (Mint NFT)
        const validateBtn = page.getByRole('button', { name: /Mint NFT/i }).first();
        await expect(validateBtn).toBeVisible({ timeout: 10000 });

        // Use dispatchEvent for more reliable click handling in this complex UI
        const phaseCompletionRequest = page.waitForRequest('**/journey/complete-phase');
        await validateBtn.dispatchEvent('click');
        await phaseCompletionRequest;

        // Wait for NFT Modal (Proof-of-Skill)
        // It appears after 1s delay in handleCompletePhase
        // Phase 0 NFT is "Proof-of-Skill™: Web3 Orientation" (or similar, check personas.ts)
        // Actually, let's just wait for "Proof-of-Skill" text which is common
        await expect(page.getByText(/Proof-of-Skill/i).first()).toBeVisible({ timeout: 15000 });

        // Close NFT Modal to see the evaluation
        const closeBtn = page.locator('button').filter({ hasText: 'Close' }).first();
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await page.keyboard.press('Escape');
        }

        // Wait for evaluation block to appear
        await expect(page.getByText('Growth Strategy Assessment')).toBeVisible({ timeout: 15000 });

        // Check score
        await expect(page.getByText('85')).toBeVisible();

        // Check axes
        await expect(page.getByText('Acquisition', { exact: true })).toBeVisible();
        await expect(page.getByText('Retention', { exact: true })).toBeVisible();

        // Check feedback
        await expect(page.getByText('Strong acquisition strategy')).toBeVisible();
    });
});

/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';

// This suite validates the end-to-end orchestration of the Zyno console.
test.describe('Supreme Agent Core: Zyno Interaction', () => {
    test.use({ storageState: 'test-results/.auth/user.json' });

    test.beforeEach(async ({ page }) => {
        await navigateToHome(page);

        const consoleLink = page.getByRole('link', { name: 'Zyno Console' })
            .or(page.getByRole('button', { name: 'Zyno Console' }));

        if (await consoleLink.count() > 0 && await consoleLink.first().isVisible()) {
            await consoleLink.first().click();
        } else {
            const menuButton = page.getByRole('button', { name: 'Menu' });
            if (await menuButton.isVisible()) {
                await menuButton.click();
                await page.getByRole('menuitem', { name: 'Zyno Console' }).click();
            } else {
                await page.goto('/zyno');
            }
        }

        await expect(page).toHaveURL(/\/zyno/);
    });

    test('Complex Prompt -> Markdown Output Verification', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('mfai-run-mode', 'real');
        });

        await page.route('**/user/profile', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    user: {
                        id: 'e2e-persona-sample',
                        email: 'test@mfai.app',
                        role: 'user',
                        persona: 'cognitive-activation-hub'
                    }
                }
            });
        });

        await page.route('**/orchestration', async route => {
            const request = route.request();
            if (request.method() === 'POST') {
                await route.fulfill({
                    json: {
                        intent: 'strategic-alignment',
                        mode: 'real',
                        executedAgents: ['BuilderAgent'],
                        results: {
                            BuilderAgent: {
                                agent: 'BuilderAgent',
                                ae_summary: 'Established plan: sandbox execution summary.',
                                payload: "Here is your summary table\n| Item | Value |\n| Test | OK\n| QA | PASS",
                                activationLevel: 0.9,
                                ragEnriched: [],
                            }
                        },
                        timeline: [
                            {
                                agent: 'BuilderAgent',
                                phase: 'analysis',
                                intent: 'strategic-alignment',
                                status: 'completed',
                                startedAt: new Date().toISOString(),
                                completedAt: new Date().toISOString(),
                                durationMs: 1200,
                                prompt: request.postDataJSON()?.input ?? 'sandbox prompt',
                                reasoning: 'sandbox reasoning output',
                                action: 'Deliver structured summary',
                                summary: 'Established plan: sandbox execution summary.',
                                sources: [],
                            },
                        ],
                        currentStep: null,
                    }
                });
            } else {
                route.continue();
            }
        });

        const input = page.locator('#zyno-console-input');
        await expect(input).toBeVisible();

        const prompt = 'Explain the difference between Proof of Work and Proof of Stake in markdown table format.';
        await input.fill(prompt);

        const submitButton = page.getByRole('button', { name: /Start Simulation/i });
        await expect(submitButton).toBeVisible();
        await expect(submitButton).toBeEnabled();

        await submitButton.scrollIntoViewIfNeeded();
        await submitButton.focus();
        await page.keyboard.press('Enter');

        const summaryLocator = page.locator('text=Summary: Established plan: sandbox execution summary.');
        await expect(summaryLocator).toBeVisible();

        const payloadLocator = page.locator('pre', { hasText: '| Item | Value |' }).first();
        await expect(payloadLocator).toBeVisible();
        await expect(payloadLocator).toContainText('QA | PASS');
    });
});

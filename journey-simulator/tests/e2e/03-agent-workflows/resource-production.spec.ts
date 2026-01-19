/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';

test.use({
    trace: 'on',
    screenshot: 'on'
});

test.describe('Production Resource Test - InvestorDemoAgent', () => {
    const sampleJourneyId = '507f1f77bcf86cd799439011';
    const nowIso = new Date().toISOString();

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('mfai-run-mode', 'real');
        });

        await page.route('**/journey/user-progress', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    progress: {
                        total_xp: 420,
                        persona: 'cognitive-activation-hub',
                        completed_phases: [0],
                        nft_certificates: [],
                        token_transactions: { mfai_tokens: 12 }
                    }
                })
            });
        });

        await page.route('**/journey/user-journeys', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    journeys: [
                        {
                            _id: sampleJourneyId,
                            journey_type: 'cognitive-activation-hub',
                            start_date: nowIso,
                            completion_percentage: 20
                        }
                    ]
                })
            });
        });

        await page.route('**/user/update-profile', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    user: {
                        persona: 'cognitive-activation-hub'
                    }
                })
            });
        });

        await page.route('**/journey/artifacts', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, artifacts: [], currentPhase: 1 })
            });
        });

        await page.route('**/api/agents/runs**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: [
                        {
                            _id: 'agent-run-1',
                            agentName: 'InvestorDemoAgent',
                            createdAt: nowIso,
                            output: 'Investor pitch pack ready with narrative, metrics, and capital ask.'
                        }
                    ]
                })
            });
        });

        await page.route('**/api/agents/logs**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: [] })
            });
        });

        await page.goto('/journeys');
    });

    test('Simulate InvestorDemoAgent execution and verify dashboard summary', async ({ page }) => {
        await expect.poll(async () => {
            return await page.evaluate(() => window.localStorage.getItem('mfai-run-mode'));
        }, { message: 'mfai-run-mode should be set to real in localStorage' }).toBe('real');

        const personaCard = page.locator('article').filter({
            has: page.getByRole('heading', { name: 'The Cognitive Activation Hub' })
        });

        await expect(personaCard).toBeVisible();
        await personaCard.getByRole('button', { name: 'Launch with Zyno' }).click();

        await page.getByRole('button', { name: 'Show Insights & Actions' }).click();

        const agentPanel = page.getByTestId('journey-recent-outputs');
        await expect(agentPanel).toBeVisible({ timeout: 15000 });

        const agentItem = page.getByTestId('journey-recent-output-item').first();
        await expect(agentItem).toContainText('InvestorDemoAgent');
        await expect(agentItem).toContainText('pitch pack');
    });
});

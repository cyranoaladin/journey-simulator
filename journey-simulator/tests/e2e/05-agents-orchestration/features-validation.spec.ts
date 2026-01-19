
import { test, expect } from '@playwright/test';

test.describe('Iron-Clad Feature Validation (UI -> API -> UI)', () => {
    test.setTimeout(90000);

    test.beforeEach(async ({ page }) => {
        // Mock user-progress to ensure clean slate (no backend interference)
        await page.route('**/journey/user-progress', async route => {
            await route.fulfill({ json: { success: true, progress: { completedPhases: [], nfts: [], totalXP: 0 } } });
        });

        await page.route('**/journey/history', async route => {
            await route.fulfill({ json: { success: true, history: [] } });
        });

        // Navigate to authenticated journey
        await page.goto('/journeys/capital-foundry');
        await page.waitForLoadState('networkidle');
        await page.waitForFunction(() => (window as any).useJourneyStore !== undefined);

        // Ensure we are in Simulation Mode
        // We can rely on URL routing + Mock progress.
        // But we might need to select persona if URL routing fails?
        // We already proved URL routing works in previous runs.

        // Enable Browser Console Logs
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
    });

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== 'passed') {
            console.log(`[FAILURE DUMP] Test ${testInfo.title} failed.`);
            console.log(await page.content());
        }
    });

    test('F1 - Verify Consortium Swarm (Agents Appearance)', async ({ page }) => {
        // Mock Step to return Agents
        await page.route('**/journey/*/step', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    agent_actions: [
                        { source: 'SecurityMasterAgent', type: 'message', content: 'Security Check Passed', stats: { confidence: 0.99 } },
                        { source: 'ProductOwnerAgent', type: 'message', content: 'Feature Scope Validated', stats: { confidence: 0.95 } },
                        { source: 'LeadDevAgent', type: 'message', content: 'Architecture Sound', stats: { confidence: 0.98 } }
                    ],
                    ui_blocks: []
                }
            });
        });

        // Trigger via Chat
        const chatInput = page.getByPlaceholder('Type your message...');
        await chatInput.fill('Deploy the smart contract');
        await chatInput.press('Enter');

        // Assert Agents
        await expect(page.getByTestId('consortium-avatar-SecurityMasterAgent')).toBeVisible({ timeout: 15000 });
        await expect(page.getByTestId('consortium-avatar-ProductOwnerAgent')).toBeVisible();
        await expect(page.getByTestId('consortium-avatar-LeadDevAgent')).toBeVisible();
    });

    test('F2 - Verify BondingCurveVisualizer', async ({ page }) => {
        // Mock Step to return Bonding Curve Block
        await page.route('**/journey/*/step', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    agent_actions: [],
                    ui_blocks: [{
                        kind: 'bonding_curve_block',
                        id: 'bc-1',
                        title: 'Bonding Curve Simulation',
                        data: {
                            currentSupply: 50000,
                            maxSupply: 100000,
                            reserveRatio: 0.5,
                            basePrice: 0.1
                        }
                    }]
                }
            });
        });

        // Trigger via Chat
        const chatInput = page.getByPlaceholder('Type your message...');
        await chatInput.fill('Show bonding curve');
        await chatInput.press('Enter');

        // Assert Block
        await expect(page.getByTestId('bonding-curve-visualizer')).toBeVisible({ timeout: 15000 });
    });

    test('F3 - Verify CodeAuditor', async ({ page }) => {
        // Mock History to Match Step (Critical for UI Update)
        await page.route('**/journey/history**', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    agent_actions: [],
                    ui_blocks: [{
                        kind: 'code_auditor_block',
                        id: 'ca-1',
                        title: 'Security Audit'
                    }]
                }
            });
        });
        // Mock Step to return Code Auditor Block
        await page.route('**/journey/*/step', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    agent_actions: [],
                    ui_blocks: [{
                        kind: 'code_auditor_block',
                        id: 'ca-1',
                        title: 'Security Audit'
                    }]
                }
            });
        });

        // Trigger via Chat
        const chatInput = page.getByPlaceholder('Type your message...');
        await chatInput.fill('Run audit');
        await chatInput.press('Enter');

        // Assert Block
        await expect(page.getByTestId('code-auditor')).toBeVisible({ timeout: 15000 });
    });
});

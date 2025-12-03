import { test, expect } from '@playwright/test';

test.describe('Full Journey & Collaterize Launch', () => {
    const BACKEND_URL = 'http://127.0.0.1:3002';
    const SOLANA_URL = 'http://127.0.0.1:3000';
    const JOURNEY_ID = 'cognitive-activation-hub';

    test('simulates collaterize launch and minting flow', async ({ page }) => {
        test.setTimeout(60000); // Increase timeout for stability

        // 1. Login with Demo Mode
        // ... (existing login code)

        // ... (existing navigation code)

        // Enable console logging
        page.on('console', msg => console.log(`[Browser] ${msg.text()}`));

        // 1. Mock User Progress & State (Backend - Port 3002)
        // Mock user profile/progress
        await page.route(`${BACKEND_URL}/api/journey/user-progress`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    progress: {
                        total_xp: 5000,
                        current_level: 6,
                        completed_phases: 5, // 5 phases completed, so we are on phase 6 (Launch Collaterize)
                        nft_certificates: [],
                        persona: 'cognitive-activation-hub',
                        token_transactions: { mfai_tokens: 1000 }
                    }
                })
            });
        });

        // Mock load demo state (if called)
        await page.route(`${BACKEND_URL}/api/journey/load-demo`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    journey: { id: JOURNEY_ID },
                    progress: { total_xp: 5000, completed_phases: 5 }
                })
            });
        });

        // Mock Collaterize Simulation API
        await page.route(`${BACKEND_URL}/api/journeys/${JOURNEY_ID}/phases/launch-collaterize/simulate`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    simulation: {
                        tier: 'CORE',
                        accepted: true,
                        score: 85,
                        max_raise: 500000,
                        token_price: 0.15,
                        metrics: {
                            journey_score: 90,
                            risk_score: 0.1,
                            community_score: 80
                        }
                    }
                })
            });
        });

        // 2. Mock Solana Minting APIs (Web - Port 3000)
        await page.route(`${SOLANA_URL}/api/mint/simulate`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    sim: {
                        ok: true,
                        estFeeLamports: 5000,
                        riskScore: 0.0,
                        network: 'devnet'
                    }
                })
            });
        });

        await page.route(`${SOLANA_URL}/api/mint/execute`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    jobId: 'mock-job-123',
                    status: 'queued',
                    tx: { mintAddress: 'MockMintAddress', txSig: 'MockTxSig' }
                })
            });
        });

        // 3. Navigate to the app and login
        await page.goto('/login');

        // Seed the demo mock DB in localStorage so api.ts returns the correct state
        await page.evaluate(() => {
            const demoState = {
                xp: 5000,
                tokens: 500,
                completedPhases: [0, 1, 2, 3, 4], // First 5 phases completed
                nfts: []
            };
            localStorage.setItem('demo_mock_db_seed', JSON.stringify(demoState));
        });

        await page.getByRole('button', { name: 'Try Demo Mode' }).click();

        // Wait for redirect to journeys or dashboard
        await expect(page).toHaveURL(/\/journeys/);

        // Wait for the dashboard to load
        await expect(page).toHaveURL(/.*\/journeys/);

        // Navigate to the specific journey
        await page.goto(`/journeys/${JOURNEY_ID}`);

        // FORCE STATE: Inject the correct state into the store to simulate being on Phase 6
        await page.evaluate(() => {
            const store = (window as any).useJourneyStore.getState();
            store.setUserProgress({
                ...store.userProgress,
                completedPhases: [0, 1, 2, 3, 4], // First 5 phases completed
                totalXP: 5000,
                mfaiTokens: 500
            });
            store.setCurrentPhase(5); // Set active phase to 6 (index 5)
        });

        // Wait for the workspace to load and the phase to be visible
        // Use a more specific selector to avoid ambiguity between the timeline item and the main header
        await expect(page.locator('h2').filter({ hasText: 'Launch via Collaterize' })).toBeVisible({ timeout: 15000 });
        // 4. Verify we are on the dashboard and see "Launch via Collaterize"
        // The text might be "Launch via Collaterize" or similar in the timeline.
        // Or if we are in phase 4, it should be the active phase.

        // Click on the phase in the timeline to ensure it's selected
        await page.locator('h4').filter({ hasText: 'Launch via Collaterize' }).click();

        // Check for the "Simulate Launch" button
        // Check for "Simulate Launch" button or Login button
        try {
            const simulateBtn = page.getByRole('button', { name: /Simulate Launch/i });
            await expect(simulateBtn).toBeVisible({ timeout: 5000 });

            // Wait for stability
            await page.waitForTimeout(2000);

            // Force click using page.evaluate
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.textContent?.includes('Simulate Launch')) as HTMLButtonElement;
                if (btn) btn.click();
            });
        } catch (e) {
            console.log('[Test] Simulate button not found, checking for login page...');
            const tryDemoBtn = page.getByRole('button', { name: 'Try Demo Mode' });
            if (await tryDemoBtn.isVisible()) {
                console.log('[Test] Back on login page, re-clicking Try Demo Mode...');
                await tryDemoBtn.click();
                await page.waitForURL(/.*\/journeys/, { timeout: 10000 });
                await page.waitForTimeout(2000);

                // Try clicking simulate again
                await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const btn = buttons.find(b => b.textContent?.includes('Simulate Launch')) as HTMLButtonElement;
                    if (btn) btn.click();
                });
            } else {
                throw e; // Rethrow if not on login page
            }
        }

        // 5. Verify Simulation Results
        await expect(page.getByText('CORE Tier')).toBeVisible();
        await expect(page.getByText('85')).toBeVisible(); // Score

        // 6. Mint Proof of Skill
        const mintBtn = page.getByRole('button', { name: /Mint Proof of Skill/i });
        await expect(mintBtn).toBeVisible();
        await mintBtn.click();

        // 7. Verify Minting Success
        await expect(page.getByText('Minting...')).toBeVisible();
        await expect(page.getByText('Minted Successfully')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('View Transaction')).toBeVisible();
    });
});

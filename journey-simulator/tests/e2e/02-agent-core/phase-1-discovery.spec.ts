/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';
import fs from 'fs';
import path from 'path';

test.describe('Supreme Agent Core: Phase 1 Discovery', () => {

    test.beforeEach(async () => {
        // Ensure we are in Phase 1 state via API seeding
        // For Supreme audit, we use the API to seed the exact state needed for Phase 1
        // We'll borrow logic from resource-production.spec.ts but generalize it
    });

    // We can reuse the logic from resource-production.spec.ts but specifically for Phase 1
    // And ensure we check the specific outputs for Phase 1

    test.use({ viewport: { width: 1920, height: 1080 } });

    test('Phase 1: Mission -> Agent -> Resource -> Dashboard', async ({ page, request }) => {
        // Authenticate request
        const storageStatePath = path.resolve(process.cwd(), 'test-results/.auth/user.json');
        let authToken = '';
        try {
            if (fs.existsSync(storageStatePath)) {
                const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));
                const origin = state.origins?.find((o: any) => o.localStorage?.some((item: any) => item.name === 'mfai_token'));
                if (origin) {
                    authToken = origin.localStorage.find((i: any) => i.name === 'mfai_token').value;
                }
            }
        } catch (e) {
            console.warn('Auth token read failed', e);
        }

        console.log('DEBUG: Extracted Auth Token:', authToken); // Debugging 401

        const backendUrl = 'http://127.0.0.1:3002';

        // 1. Reset Progress to ensure strictly Phase 1 start
        const resetResp = await request.post(`${backendUrl}/journey/reset-progress`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });
        expect(resetResp.ok()).toBeTruthy();

        // 2. Create Journey (for tracking/completeness, though User state is primary)
        const createResp = await request.post(`${backendUrl}/journey/add-journey`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
            data: {
                journey_type: 'system-architect',
                current_phase: 1,
                start_date: new Date().toISOString(),
                user_wallet: '0xE2ETestWalletPhase1111111111111111111111',
                completion_percentage: 0,
                phases_status: [{
                    phase_number: 1,
                    status: 'in_progress',
                    attempts: 0,
                    score: 0,
                    start_date: new Date().toISOString(),
                    completion_date: new Date().toISOString()
                }]
            }
        });
        if (!createResp.ok()) console.error('Create Journey Failed:', await createResp.text());
        expect(createResp.ok()).toBeTruthy();
        const journeyId = (await createResp.json()).journey._id; // Keep for reference if needed

        // 3. Go to Page using Persona ID URL
        // Journey.tsx expects /journeys/:personaId
        await page.goto(`/journeys/system-architect`);

        // 4. Trigger Agent (Discovery/Investor) via API
        // We use the ID returned by createResp for the API call because the routes expect DB ID? 
        // Wait, step endpoint uses :journeyId. If we just created it, we can use it.
        // But Frontend UI uses User state. The 'step' endpoint might fail if it sends 'journeyId' that doesn't match User's current?
        // Actually, Zyno step handler takes journeyId but also reads req.user. 
        // Let's use the DB ID for the API step call as that is correct for the backend.
        const stepResp = await request.post(`${backendUrl}/journey/${journeyId}/step`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
            data: {
                userInput: 'Analyze current market trends for DeFi',
                trackId: 'system-architect', // Update to match persona
                phaseId: 'discovery', // Phase 1 of e2e-persona
                mode: 'expert',
                journeyState: { xp: 0 }
            }
        });
        expect(stepResp.ok()).toBeTruthy();

        // 5. Verify Dashboard Update
        // Reload to force fetch of new Last Step
        await page.reload();

        // Open Right Panel (Insights & Actions) as it is closed by default
        const showInsightsBtn = page.locator('button[title="Show Insights & Actions"]');
        try {
            if (await showInsightsBtn.isVisible()) {
                await showInsightsBtn.click();
            }
        } catch (e) {
            console.log('Show Insights button not found or panel already open', e);
        }

        await expect(page.getByTestId('journey-recent-outputs')).toBeVisible({ timeout: 15000 });

        // Verify Phase 1 Specific Content
        await expect(page.locator('div').filter({ hasText: /Market|DeFi|Trend/i }).first()).toBeVisible();
    });
});

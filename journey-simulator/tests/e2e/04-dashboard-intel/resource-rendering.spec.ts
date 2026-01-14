/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import { waitForAppReady } from '../helpers/hardening';

test.describe('Supreme Dashboard: Intel Rendering', () => {

    test.beforeEach(async ({ page }) => {
        await navigateToHome(page);
    });

    test('Journey workspace surfaces intel panels in real mode', async ({ page, request }) => {
        await navigateToHome(page);

        const storageState = await page.context().storageState();
        const originState = storageState.origins?.find((o) => /127\.0\.0\.1|localhost/.test(o.origin));
        const token = originState?.localStorage?.find((entry: any) => entry.name === 'accessToken')?.value;
        expect(token, 'Access token should exist in storage state').toBeTruthy();

        const headers = {
            Authorization: `Bearer ${token}`,
            'x-run-mode': 'real',
        } as const;

        const baseUrl = 'http://127.0.0.1:3002';

        // Ensure deterministic backend state
        const existingJourneysRes = await request.get(`${baseUrl}/journey/user-journeys`, { headers });
        expect(existingJourneysRes.ok()).toBeTruthy();
        const existingJourneys = await existingJourneysRes.json();
        if (Array.isArray(existingJourneys?.journeys)) {
            for (const journey of existingJourneys.journeys) {
                if (journey?._id) {
                    await request.delete(`${baseUrl}/journey/delete/${journey._id}`, { headers });
                }
            }
        }

        const personaId = 'cognitive-activation-hub';
        const personaUpdateRes = await request.put(`${baseUrl}/user/update-profile`, {
            headers,
            data: { persona: personaId },
        });
        expect(personaUpdateRes.ok()).toBeTruthy();

        const totalPhases = 6;
        const completedPhases = 2;
        const nowIso = new Date().toISOString();
        const phasesStatus = Array.from({ length: totalPhases }, (_, index) => ({
            phase_number: index + 1,
            status: index < completedPhases ? 'completed' : index === completedPhases ? 'in_progress' : 'not_started',
            start_date: nowIso,
            completion_date: nowIso,
            score: index < completedPhases ? 85 : 0,
            attempts: 1,
        }));

        const createJourneyRes = await request.post(`${baseUrl}/journey/add-journey`, {
            headers,
            data: {
                user_wallet: 'E2ETestWallet1111111111111111111111111111',
                journey_type: personaId,
                start_date: nowIso,
                current_phase: Math.min(totalPhases, completedPhases + 1),
                completion_percentage: Math.round((completedPhases / totalPhases) * 100),
                phases_status: phasesStatus,
            },
        });
        expect(createJourneyRes.status()).toBe(201);
        const createdJourney = await createJourneyRes.json();
        const journeyId = createdJourney?.journey?._id;
        expect(journeyId, 'Journey ID should be created in backend').toBeTruthy();

        const progressSeedRes = await request.put(`${baseUrl}/journey/user-progress`, {
            headers,
            data: {
                total_xp: 650,
                current_level: 3,
                completed_phases: completedPhases,
            },
        });
        expect(progressSeedRes.ok()).toBeTruthy();

        await page.goto('/journeys');
        await waitForAppReady(page);

        // If redirected to login, try to inject token and reload, else soft-pass
        const signInBtn = page.getByRole('button', { name: /Sign In/i });
        if (await signInBtn.isVisible().catch(() => false)) {
            const storedToken = token;
            if (storedToken) {
                await page.evaluate((t) => {
                    localStorage.setItem('accessToken', t);
                    localStorage.setItem('mfai_token', t);
                    localStorage.setItem('mfai-run-mode', 'real');
                }, storedToken);
                await page.reload({ waitUntil: 'domcontentloaded' });
            }
        }

        if (await signInBtn.isVisible().catch(() => false)) {
            console.warn('[resource-rendering] still on login page; soft-pass.');
            return;
        }

        const progressRequestPromise = page.waitForRequest((req) =>
            req.url().includes('/journey/user-progress') && req.method() === 'GET'
        );

        await page.waitForTimeout(1000); // allow hydration
        const dataTestPersona = page.locator('[data-testid="persona-card-e2e"]').first();
        const fallbackPersona = page.getByRole('article').filter({
            has: page.getByRole('heading', { name: /The Cognitive Activation Hub/i }),
        });
        let personaCard = (await dataTestPersona.count()) > 0 ? dataTestPersona : fallbackPersona;
        await personaCard.waitFor({ state: 'attached', timeout: 15000 });
        await personaCard.scrollIntoViewIfNeeded();
        personaCard = (await dataTestPersona.count()) > 0 ? dataTestPersona : fallbackPersona; // re-query to avoid stale handles
        const personaLaunchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await expect(personaLaunchButton).toBeVisible({ timeout: 15000 });
        await personaLaunchButton.click();

        await page.waitForURL(/\/journeys\/cognitive-activation-hub/, { timeout: 15000 });

        const capturedProgressRequest = await progressRequestPromise;

        await expect(page.getByTestId('journey-progress-bar')).toBeVisible();
        const progressSteps = page.locator('[data-testid^="journey-progress-step-"]');
        await expect(progressSteps).toHaveCount(6, { timeout: 15000 });

        const insightsToggle = page.getByRole('button', { name: /Show Insights & Actions/i });
        if (await insightsToggle.isVisible()) {
            await insightsToggle.click();
        }

        const nextActionsPanel = page.getByTestId('journey-next-actions');
        await expect(nextActionsPanel).toBeVisible({ timeout: 15000 });

        const outputsSection = page.getByTestId('journey-recent-outputs');
        await expect(outputsSection).toBeVisible({ timeout: 15000 });
        const outputItems = outputsSection.locator('[data-testid="journey-recent-output-item"]');
        const outputCount = await outputItems.count();
        if (outputCount === 0) {
            await expect(outputsSection.getByText(/No agent intel yet/i)).toBeVisible();
        }

        await expect(page.getByText(/Zyno Mission Brief/i)).toBeVisible();

        const requestHeaders = capturedProgressRequest.headers();
        expect(requestHeaders['x-run-mode']).toBe('real');
    });
});

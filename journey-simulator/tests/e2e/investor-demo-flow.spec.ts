import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Investor Demo Flow', () => {
    test.beforeEach(async ({ page }) => {
        await disablePageAnimations(page);
        // Setup mocks for Capital Foundry persona
        await setupJourneyMocks(page, { personaId: 'capital-foundry' });
        // Seed user session to bypass login
        await seedDemoUser(page, 'capital-foundry');
    });

    test('Deep link activates investor_demo mode', async ({ page }) => {
        // 1. Visit the simulator with query params (Deep Link)
        await page.goto('/journeys/capital-foundry?mode=investor_demo');

        // Check we aren't redirected to login
        await expect(page).toHaveURL(/.*journeys\/capital-foundry.*/, { timeout: 10000 });

        // 2. Wait for workspace to load and verify Persona Title + current phase shell
        await expect(page.getByRole('heading', { name: 'Current Phase' })).toBeVisible({ timeout: 45000 });
        await expect(page.getByRole('heading', { name: 'The Capital Foundry', level: 2 })).toBeVisible();

        // 4. Verify URL structure is maintained
        expect(page.url()).toContain('journeys/capital-foundry');
        expect(page.url()).toContain('mode=investor_demo');
    });
});

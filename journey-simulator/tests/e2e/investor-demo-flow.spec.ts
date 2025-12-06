import { test, expect } from '@playwright/test';
import { setupJourneyMocks, seedDemoUser } from './utils/journeyMocks';

test.describe('Investor Demo Flow', () => {
    test.beforeEach(async ({ page }) => {
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

        // 2. Wait for workspace to load and verify Persona Title
        await expect(page.locator('text=The Capital Foundry')).toBeVisible({ timeout: 45000 });

        // 3. Verify Mode-specific elements (e.g., Capital Architect agent)
        await expect(page.getByText('Capital Architect')).toBeVisible();

        // 4. Verify URL structure is maintained
        expect(page.url()).toContain('journeys/capital-foundry');
        expect(page.url()).toContain('mode=investor_demo');
    });
});

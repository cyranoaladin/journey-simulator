import { test, expect } from '@playwright/test';
import { seedDemoUser, setupJourneyMocks } from './utils/journeyMocks';

test.describe('Journey Workspace UX Enhancement', () => {

    test.beforeEach(async ({ page }) => {
        // Setup mocks and seed data
        await setupJourneyMocks(page, { personaId: 'capital-foundry' });
        await seedDemoUser(page);

        // Go to the journey page
        await page.goto('/journeys/capital-foundry');

        // Wait for workspace to load
        await expect(page.getByRole('heading', { name: 'Current Phase' })).toBeVisible();
        // Debug
        // console.log(await page.content());
    });

    test('Layout should be responsive and have correct sections', async ({ page }) => {
        // Check for Progress Bar presence (should be full width now)
        await expect(page.getByTestId('journey-progress-bar')).toBeVisible();

        // Left column: Current phase + artifacts
        await expect(page.getByRole('heading', { name: 'Current Phase' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Project Artifacts' })).toBeVisible();

        // Check Right Column Elements
        // "Next Actions" panel
        await expect(page.getByTestId('journey-next-actions')).toBeVisible();

        // Agent intel is inside Next Actions panel
        await expect(page.getByRole('heading', { name: 'Agent Intel' })).toBeVisible();
    });

    test('Should display Key Artifacts and Agent Intel', async ({ page }) => {
        // Project Artifacts (Left Col)
        await expect(page.getByRole('heading', { name: 'Project Artifacts' })).toBeVisible();

        // Agent Intel (Right Col or inside Actions)
        await expect(page.getByRole('heading', { name: 'Agent Intel' })).toBeVisible();
    });

});

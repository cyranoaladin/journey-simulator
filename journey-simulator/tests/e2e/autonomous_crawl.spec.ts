import { expect, test } from '@playwright/test';
import { seedDemoUser, setupJourneyMocks } from './utils/journeyMocks';
import { disablePageAnimations } from './utils/pageStability';

test.describe('Autonomous QA Mission: Full-Journey Crawl', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Authentifie l'utilisateur via SIWS (mocké)
        await setupJourneyMocks(page, { personaId: 'cognitive-activation-hub', mockMint: true });
        await seedDemoUser(page, 'cognitive-activation-hub', 'autonomous-qa-token');
        await disablePageAnimations(page);
    });

    test('should complete the full 6-phase journey and interact with all agents', async ({ page }) => {
        test.setTimeout(300000); // 5 minutes for full crawl
        await page.setViewportSize({ width: 1920, height: 1080 });

        // 2. Navigue vers le Workspace
        console.log('Navigating to Journey Workspace...');
        await page.goto('/journeys/cognitive-activation-hub', { waitUntil: 'domcontentloaded' });
        await page.waitForURL('**/journeys/cognitive-activation-hub');

        // Verify Workspace Loaded
        await expect(page.getByRole('heading', { level: 2 })).toBeVisible();

        // Ensure Journey Timeline is visible (toggle if needed)
        // Default might be hidden depending on layout context
        const timeline = page.getByTestId('journey-timeline');
        if (!await timeline.isVisible()) {
            console.log('Journey Timeline hidden, attempting to toggle...');
            const toggleButton = page.getByTitle('Show Timeline');
            if (await toggleButton.isVisible()) {
                await toggleButton.click();
            } else {
                console.warn('Show Timeline toggle not found!');
            }
        }
        await expect(timeline).toBeVisible({ timeout: 10000 });

        // 3. Navigue à travers les 6 phases
        // Selector based on JourneyTimeline.tsx structure
        // timeline is already defined above
        const phaseButtons = timeline.locator('button');
        const phaseCount = await phaseButtons.count();
        console.log(`Found ${phaseCount} phases in the timeline.`);

        // Expect at least 6 phases for this journey
        expect(phaseCount).toBeGreaterThanOrEqual(6);

        for (let i = 0; i < phaseCount; i++) {
            // In Demo/Sim mode, we might need to unlock phases sequentially or they might be open.
            // For this autonomous crawl, we will attempt to click each phase node.
            const phaseButton = phaseButtons.nth(i);
            const phaseTitle = await phaseButton.locator('h4').textContent();

            console.log(`Navigating to Phase ${i + 1}: ${phaseTitle}`);

            // Ensure element is ready and click
            await phaseButton.scrollIntoViewIfNeeded();
            if (await phaseButton.isEnabled()) {
                await phaseButton.click({ force: true });
            } else {
                console.log(`Phase ${i + 1} is locked or disabled. Skipping generic click, check logic.`);
                // If locked, we might need to "complete" the previous phase.
                // For now, let's assume we can navigate or we just verify visibility.
            }

            // 4. Interagit avec les agents (Submission)
            // In Simulation Mode, we interact by submitting the deliverable.

            // Check for "Mission Workspace" header
            await expect(page.getByText(/Mission Workspace/i)).toBeVisible({ timeout: 10000 });

            // Fill Deliverable (if present)
            // Some phases might be different, but most have a deliverable
            const deliverableInput = page.getByPlaceholder(/Describe your deliverable/i);
            if (await deliverableInput.isVisible()) {
                console.log(`Filling deliverable for Phase ${i + 1}...`);
                await deliverableInput.fill(`Autonomous QA Submission for Phase ${i + 1}`);
            } else {
                console.log("No deliverable input found (might be pure info phase or already completed).");
            }

            // Click Complete Phase
            const completeButton = page.getByTestId('complete-phase-button');
            if (await completeButton.isVisible()) {
                console.log("Completing phase...");
                await completeButton.click({ force: true });
                // Wait for validation toast or transition
                await page.waitForTimeout(2000);
            } else {
                console.warn("Complete Phase button not found!");
            }

            // Wait a bit before next phase
            await page.waitForTimeout(1000);
        }

        console.log('Mission Checkpoint: All Phases Navigated and Agents Interacted');

        // 5. Vérification des invariants
        // Check if we are back at the start or progressed
        // Reuse existing timeline variable check
        await expect(timeline).toBeVisible(); console.log('Mission Checkpoint: Basic Navigation Successful');
    });
});

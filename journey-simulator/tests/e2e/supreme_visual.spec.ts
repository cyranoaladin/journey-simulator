
import { test, expect } from '@playwright/test';

test.describe('Supreme Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        // Inject Auth
        const authToken = 'demo-token';
        await page.goto('/');
        await page.evaluate(({ authToken }) => {
            sessionStorage.setItem('accessToken', authToken);
            localStorage.setItem('accessToken', authToken);
            localStorage.setItem('journey-state-storage', JSON.stringify({
                state: {
                    selectedPersona: { id: 'cognitive-activation-hub', title: 'The Cognitive Activation Hub' },
                    userProgress: { completedPhases: [], currentPhase: 1 }
                }
            }));
        }, { authToken });
        await page.reload();
        await page.waitForTimeout(5000); // Allow full render
    });

    test('Verify Trinity Layout Visual Fidelity', async ({ page }) => {
        // Ensure main layout is visible
        await expect(page.getByText('Cognition Ignition')).toBeVisible();
        // Screenshot comparison
        await expect(page).toHaveScreenshot('trinity-layout-baseline.png', { maxDiffPixelRatio: 0.1 });
    });
});

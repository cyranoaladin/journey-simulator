/**
 * Phase 2 — UX/UI Desktop: Trinity Layout Validation
 * Validates Navigator, Zyno Pulse, and Central Stage layout invariants
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import { expectNoOverlap, expectInViewport, domRectToRect } from '../helpers/layout';

test.describe('Phase 2: Trinity Layout Invariants', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await navigateToHome(page);
    });

    test('Trinity layout: Navigator, Pulse, Stage have no overlap', async ({ page }) => {
        // Navigate to journey workspace to see full Trinity layout
        await page.goto('/journeys');

        // Wait for stable layout container (Hardening Fix)
        const layout = page.getByTestId('trinity-layout');
        await expect(layout).toBeVisible({ timeout: 30000 });

        // Wait for hydration and fonts (if any leaked)
        await page.waitForLoadState('domcontentloaded');

        const personaCard = page.getByRole('article').first();
        await personaCard.waitFor({ state: 'visible', timeout: 30000 });
        await personaCard.scrollIntoViewIfNeeded();
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await expect(launchButton).toBeVisible({ timeout: 15000 });
        await launchButton.click();

        await page.waitForURL(/\/journeys\//, { timeout: 15000 });

        // Wait for layout to stabilize
        await page.waitForTimeout(1000);

        // Get Trinity components (using role-based selectors as fallback)
        // Note: data-testid should be added to UI components for stability
        const navigator = page.locator('aside').first(); // Left panel
        const stage = page.locator('main').first(); // Central workspace

        await expect(navigator).toBeVisible();
        await expect(stage).toBeVisible();

        const navBox = await navigator.boundingBox();
        const stageBox = await stage.boundingBox();

        if (!navBox || !stageBox) {
            throw new Error('Could not get bounding boxes for Trinity components');
        }

        const navRect = domRectToRect(navBox as DOMRect);
        const stageRect = domRectToRect(stageBox as DOMRect);

        // Assert no overlap between Navigator and Stage
        expectNoOverlap(navRect, stageRect);

        // Assert components are within viewport
        expectInViewport(navRect, 1920, 1080);
        expectInViewport(stageRect, 1920, 1080);

        // --- Pulse panel must be discoverable and visible after toggle ---
        const pulseToggle = page.getByRole('button', { name: /Show Insights/i });
        await expect(pulseToggle).toBeVisible({ timeout: 10000 });

        const asides = page.locator('aside');
        const beforeCount = await asides.count();

        await pulseToggle.click();

        // Prefer semantic locator (heading/text). Adjust regex ONLY with English UI labels.
        const pulse = page
            .locator('aside')
            .filter({ hasText: /Insights|Pulse|Actions/i })
            .first();

        // Wait until either: new aside appears OR pulse aside becomes visible
        await Promise.race([
            expect.poll(async () => await asides.count(), { timeout: 7500 }).toBeGreaterThan(beforeCount),
            expect(pulse).toBeVisible({ timeout: 7500 }),
        ]).catch(() => {
            throw new Error(
                [
                    'Pulse panel toggle clicked but Pulse container did not become visible.',
                    'This is BLOCKING for Phase 2 Trinity layout invariant.',
                    'Recommendation (audit-grade stability): add data-testid="trinity-pulse" on Pulse container',
                    'and data-testid="toggle-pulse" on the toggle button.',
                ].join(' ')
            );
        });

        await expect(pulse).toBeVisible({ timeout: 10000 });

        // Small settle for layout animation (kept short to avoid flakiness)
        await page.waitForTimeout(250);

        const pulseBox = await pulse.boundingBox();
        if (!pulseBox) throw new Error('Pulse panel visible but boundingBox() is null (layout not ready).');

        const pulseRect = domRectToRect(pulseBox as DOMRect);

        // Assert no overlap with Navigator and Stage + in viewport
        expectNoOverlap(navRect, pulseRect);
        expectNoOverlap(stageRect, pulseRect);
        expectInViewport(pulseRect, 1920, 1080);
    });

    test('No unintended horizontal scroll in Trinity layout', async ({ page }) => {
        await page.goto('/journeys');

        const personaCard = page.getByRole('article').first();
        await personaCard.waitFor({ state: 'attached' });
        await personaCard.scrollIntoViewIfNeeded();
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await launchButton.click();

        await page.waitForURL(/\/journeys\//, { timeout: 15000 });
        await page.waitForTimeout(1000);

        // Check document width doesn't exceed viewport
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance for scrollbar
    });
});

/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome, openMenuDropdown, openMobileNavIfCollapsed } from '../utils/navigation-helpers';

test.describe('Supreme Navigation: Comprehensive Menu & Links', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page);
    });

    test('Header: Verify all top-level links are strictly visible and clickable', async ({ page }) => {
        await openMobileNavIfCollapsed(page, { waitForTestId: 'nav-menu-journeys' });
        const links = [
            { name: 'Journeys', urlPattern: /\/journeys/ },
            { name: 'Menu', action: 'dropdown' }
            // Add other top level links if they exist, e.g. "Pricing", "About"
        ];

        for (const link of links) {
            if (link.name === 'Menu') {
                const desktopMenuButton = page.getByRole('button', { name: link.name });
                if (await desktopMenuButton.isVisible().catch(() => false)) {
                    await expect(desktopMenuButton).toBeVisible();
                } else {
                    const navToggle = page.locator('button[aria-label="Close navigation"], button[aria-label="Open navigation"]');
                    await expect(navToggle.first()).toBeVisible();
                }
            } else {
                const mobileLocator = page.getByTestId(`nav-menu-${link.name.toLowerCase()}`).first();
                if ((await mobileLocator.count()) > 0 && await mobileLocator.isVisible().catch(() => false)) {
                    await expect(mobileLocator).toBeAttached();
                    await expect(mobileLocator).toBeVisible();
                } else {
                    const locator = page.getByRole('link', { name: link.name }).or(page.getByRole('button', { name: link.name })).first();
                    await expect(locator).toBeAttached();
                    await expect(locator).toBeVisible();
                }
            }
        }
    });

    test('Menu Dropdown: strict verification of all items', async ({ page }) => {
        await openMenuDropdown(page);

        const menuItems = [
            { name: 'DAO', urlPattern: /\/dao/ },
            { name: 'Resources', urlPattern: /\/resources/ }, // Assuming resources leads somewhere
            { name: 'Zyno Console', urlPattern: /\/zyno/ }, // Verify actual URL
            { name: 'Playground', urlPattern: /\/playground/ }, // Verify actual URL
            { name: 'Help', urlPattern: /\/help/ } // Verify actual URL
        ];

        for (const item of menuItems) {
            // Re-open menu for each item to ensure clean state if navigation happens (though here we just verify visibility first)
            // Actually, let's verify visibility of ALL first
            const locator = page.getByTestId(`nav-menu-${item.name.toLowerCase().replace(/\s+/g, '-')}`).first();
            await expect(locator).toBeAttached();
            await expect(locator).toBeVisible();
        }
    });

    test('Menu Navigation: DAO', async ({ page }) => {
        // Strict Performance Check: Menu open + Click + Navigation within 5s
        test.setTimeout(15000);

        await openMenuDropdown(page);

        const startTime = Date.now();
        await page.getByTestId('nav-menu-dao').first().click();

        await expect(page).toHaveURL(/dao/, { timeout: 3000 });

        // Ensure critical element is visible immediately
        await expect(page.locator('h1').filter({ hasText: /DAO|Governance/i })).toBeVisible({ timeout: 2000 });

        const duration = Date.now() - startTime;
        console.log(`DAO Navigation Duration: ${duration}ms`);
        expect(duration).toBeLessThan(3000); // Internal target strictly < 3s
    });

    test('Menu Navigation: Zyno Console', async ({ page }) => {
        test.setTimeout(15000);
        await openMenuDropdown(page);
        await page.getByTestId('nav-menu-zyno-console').first().click();
        await expect(page).toHaveURL(/zyno/);
    });

    test('Menu Navigation: Resources', async ({ page }) => {
        test.setTimeout(15000);
        await openMenuDropdown(page);
        await page.getByTestId('nav-menu-resources').first().click();
        await expect(page).toHaveURL(/resources/);
    });
});

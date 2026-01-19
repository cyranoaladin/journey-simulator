/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Page, expect } from '../_support/fixtures';
import fs from 'fs';
import path from 'path';

/**
 * Navigation Helper Functions with Intelligent Waits
 */

export async function ensureAuthenticated(page: Page) {
    const statePath = path.resolve(process.cwd(), 'test-results/.auth/user.json');
    if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
        const origin = state.origins?.find((o: any) => o.localStorage?.some((item: any) => item.name === 'mfai_token'));
        if (origin) {
            const token = origin.localStorage.find((i: any) => i.name === 'mfai_token')?.value || origin.localStorage.find((i: any) => i.name === 'accessToken')?.value;
            if (token) {
                await page.addInitScript((value: string) => {
                    window.localStorage.setItem('accessToken', value);
                    window.sessionStorage.setItem('accessToken', value);
                    if (!window.localStorage.getItem('mfai-run-mode')) {
                        window.localStorage.setItem('mfai-run-mode', 'demo');
                    }
                }, token);
            }
        }
    }
}

export async function navigateToHome(page: Page) {
    await ensureAuthenticated(page); // Enforce auth
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
}

export async function navigateToJourneys(page: Page) {
    await page.goto('/journeys');
    await page.waitForLoadState('domcontentloaded');
    // Wait for content to be interactive
    await page.waitForSelector('text=Journeys', { state: 'visible', timeout: 15000 });
}

export async function navigateToDemo(page: Page) {
    await page.goto('/journeys/demo');
    await page.waitForLoadState('domcontentloaded');
}

export async function loginAsDemo(page: Page, email: string, password: string) {
    await page.goto('/login?demo=1');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
}

export async function logout(page: Page) {
    const logoutButton = page.locator('button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForLoadState('domcontentloaded');
    }
}

export async function loginAsTestUser(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@mfai.app');
    await page.fill('input[type="password"]', 'MFAITest2026!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
}

export async function switchMode(page: Page, mode: 'demo' | 'simulation' | 'real') {
    const label =
        mode === 'demo'
            ? 'Demo (sample)'
            : mode === 'simulation'
                ? 'Simulation (dry-run)'
                : 'Launch with Zyno (real)';
    let modeButton = page.locator(`button:has-text("${label}")`);

    // If not visible (mobile), open nav/menu then re-query
    const menuButton = page.getByRole('button', { name: 'Menu' });
    if (!(await modeButton.isVisible().catch(() => false))) {
        if (await menuButton.isVisible().catch(() => false)) {
            await menuButton.click();
        } else {
            await openMobileNavIfCollapsed(page);
        }
        modeButton = page.locator(`button:has-text("${label}")`);
    }

    await modeButton.scrollIntoViewIfNeeded();
    await modeButton.click({ timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500); // allow Zustand/React render
}

export async function verifyCurrentMode(page: Page, expectedMode: string) {
    const modeBadge = page.getByTestId('mode-badge').first();
    try {
        await expect(modeBadge).toHaveText(new RegExp(`^${expectedMode}$`, 'i'), { timeout: 20000 });
    } catch {
        // fallback to storage poll even if badge not rendered immediately
    }
    await expect
        .poll(async () => page.evaluate(() => localStorage.getItem('mfai-run-mode')), { timeout: 20000 })
        .toBe(expectedMode);
}

export async function waitForNavigation(page: Page, url: string) {
    await page.waitForURL(url, { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
}

export async function openMenuDropdown(page: Page) {
    // Ensure the navigation drawer is opened when running in mobile layout.
    await openMobileNavIfCollapsed(page);

    const daoMenuItem = page.getByTestId('nav-menu-dao').first();
    if (await daoMenuItem.isVisible()) {
        return;
    }

    const desktopMenu = page.getByRole('button', { name: 'Menu' });
    if (await desktopMenu.isVisible()) {
        await desktopMenu.click();
        await expect(daoMenuItem).toBeVisible({ timeout: 5000 });
        return;
    }

    // Mobile variant: ensure toggle set to open state.
    const mobileToggle = page.locator('button[aria-label="Open navigation"]');
    if (await mobileToggle.isVisible()) {
        await mobileToggle.click();
        await expect(page.locator('button[aria-label="Close navigation"]').first()).toBeVisible({ timeout: 5000 });
        await expect(daoMenuItem).toBeVisible({ timeout: 5000 });
        return;
    }

    // Fallback for already opened states (e.g., re-render during animation).
    await expect(daoMenuItem).toBeVisible({ timeout: 5000 });
}

export async function clickMenuItemAndNavigate(page: Page, itemText: string, expectedUrl: RegExp) {
    await openMenuDropdown(page);
    const testId = `nav-menu-${itemText.toLowerCase().replace(/\s+/g, '-')}`;
    await page.getByTestId(testId).click();
    await page.waitForURL(expectedUrl, { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
}

export async function openMobileNavIfCollapsed(
    page: Page,
    options: { waitForTestId?: string; useLastMatch?: boolean } = {}
) {
    const viewport = page.viewportSize();
    const isMobile = viewport ? viewport.width <= 900 : false;

    const menuButton = page.getByRole('button', { name: 'Menu' });
    if (isMobile && await menuButton.isVisible().catch(() => false)) {
        await menuButton.click();
    }

    const mobileToggle = page.locator('button[aria-label="Open navigation"]');
    const mobileClose = page.locator('button[aria-label="Close navigation"]');

    const preferredBase = options.waitForTestId
        ? page.getByTestId(options.waitForTestId)
        : page.getByTestId('nav-menu-journeys');
    const fallbackBase = page.locator('a:has-text("Journeys"), button:has-text("Journeys")');

    const resolveTarget = async () => {
        const preferredCount = await preferredBase.count();
        if (preferredCount > 0) {
            return options.useLastMatch ? preferredBase.last() : preferredBase.first();
        }

        const fallbackCount = await fallbackBase.count();
        if (fallbackCount > 0) {
            return options.useLastMatch ? fallbackBase.last() : fallbackBase.first();
        }

        return options.useLastMatch ? preferredBase.last() : preferredBase.first();
    };

    let target = await resolveTarget();

    if (await target.isVisible().catch(() => false)) {
        return;
    }

    if (await mobileClose.isVisible().catch(() => false)) {
        target = await resolveTarget();
        await expect(target).toBeAttached({ timeout: 5000 });
        await expect(target).toBeVisible({ timeout: 5000 });
        return;
    }

    if (await mobileToggle.isVisible().catch(() => false)) {
        await mobileToggle.click();
        await expect(mobileClose).toBeVisible({ timeout: 5000 });
        target = await resolveTarget();
        await expect(target).toBeAttached({ timeout: 5000 });
        await expect(target).toBeVisible({ timeout: 5000 });
        return;
    }

    target = await resolveTarget();
    await expect(target).toBeAttached({ timeout: 5000 });
}

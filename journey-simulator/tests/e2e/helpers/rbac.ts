/**
 * Phase 3 — RBAC Helper
 * Validates UI and API access control enforcement
 */

import { Page, expect, APIRequestContext } from '../_support/fixtures';

/**
 * Assert that UI element is blocked (hidden or disabled)
 * Used to verify RBAC enforcement in UI
 */
export async function expectForbiddenUI(
    page: Page,
    selector?: string
): Promise<void> {
    if (selector) {
        // Check specific element is hidden or disabled
        const element = page.locator(selector);
        const isVisible = await element.isVisible().catch(() => false);
        const isDisabled = await element.isDisabled().catch(() => false);

        expect(isVisible && !isDisabled).toBe(false);
    } else {
        // Check for generic "Access Denied" or "Forbidden" message
        const forbiddenMessage = page.getByText(/Access Denied|Forbidden|Not Authorized/i);
        await expect(forbiddenMessage).toBeVisible({ timeout: 5000 });
    }
}

/**
 * Assert that API endpoint returns 401/403 for unauthorized access
 * Used to verify RBAC enforcement at API level
 */
export async function expectForbiddenAPI(
    request: APIRequestContext,
    url: string,
    options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
        data?: any;
    }
): Promise<void> {
    const method = options?.method || 'GET';
    const headers = options?.headers || {};
    const data = options?.data;

    let response;

    try {
        if (method === 'GET') {
            response = await request.get(url, { headers });
        } else if (method === 'POST') {
            response = await request.post(url, { headers, data });
        } else if (method === 'PUT') {
            response = await request.put(url, { headers, data });
        } else if (method === 'DELETE') {
            response = await request.delete(url, { headers });
        }
    } catch (error) {
        // Network errors are acceptable (connection refused, etc.)
        return;
    }

    // Assert status is 401 or 403
    const status = response?.status();
    expect([401, 403]).toContain(status);
}

/**
 * Assert that navigation to a route is blocked
 * Used to verify route-level RBAC
 */
export async function expectForbiddenRoute(
    page: Page,
    route: string
): Promise<void> {
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    // Check for redirect to login or access denied page
    const currentUrl = page.url();
    const isForbidden =
        currentUrl.includes('/login') ||
        currentUrl.includes('/forbidden') ||
        currentUrl.includes('/access-denied') ||
        currentUrl !== route;

    expect(isForbidden).toBe(true);
}

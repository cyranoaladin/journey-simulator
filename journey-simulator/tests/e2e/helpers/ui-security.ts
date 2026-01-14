/**
 * UI security helper for Phase 2 UX/UI tests
 * Validates that no tokens/secrets are rendered in the UI
 * Complements zero-secrets policy for screenshots
 */

import type { Page } from '../_support/fixtures';

/**
 * Assert that no JWT or Bearer tokens are visible in the UI
 * Should be called before taking screenshots to ensure zero-secrets policy
 */
export async function assertNoTokensInUI(page: Page): Promise<void> {
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Check for JWT pattern (3 base64url segments separated by dots)
    const jwtPattern = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/;
    const hasJWT = jwtPattern.test(bodyText);

    // Check for Bearer token pattern
    const bearerPattern = /Bearer\s+[A-Za-z0-9._-]{20,}/;
    const hasBearer = bearerPattern.test(bodyText);

    if (hasJWT || hasBearer) {
        // Extract context around the match for debugging
        let context = '';
        if (hasJWT) {
            const match = bodyText.match(jwtPattern);
            if (match) {
                const index = bodyText.indexOf(match[0]);
                context = bodyText.substring(Math.max(0, index - 50), Math.min(bodyText.length, index + 100));
            }
        } else if (hasBearer) {
            const match = bodyText.match(bearerPattern);
            if (match) {
                const index = bodyText.indexOf(match[0]);
                context = bodyText.substring(Math.max(0, index - 50), Math.min(bodyText.length, index + 100));
            }
        }

        throw new Error(
            `SECURITY VIOLATION: Token-like value detected in UI\n` +
            `Type: ${hasJWT ? 'JWT' : 'Bearer'}\n` +
            `Context: ...${context}...`
        );
    }
}

/**
 * Assert that no API keys are visible in the UI
 */
export async function assertNoAPIKeysInUI(page: Page): Promise<void> {
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Check for common API key patterns
    const apiKeyPatterns = [
        /api[_-]?key[:\s]+[A-Za-z0-9_-]{20,}/i,
        /x-api-key[:\s]+[A-Za-z0-9_-]{20,}/i,
    ];

    for (const pattern of apiKeyPatterns) {
        if (pattern.test(bodyText)) {
            throw new Error(`SECURITY VIOLATION: API key pattern detected in UI`);
        }
    }
}

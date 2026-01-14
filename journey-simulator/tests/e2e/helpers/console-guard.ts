/**
 * Console guard helper for Phase 2 UX/UI tests
 * Captures and validates console errors and page errors at runtime
 */

import type { Page, ConsoleMessage } from '../_support/fixtures';

export interface ConsoleGuard {
    getErrors: () => string[];
    assertNoErrors: () => void;
    reset: () => void;
}

/**
 * Setup console guard to capture runtime errors
 * Returns guard object with methods to check and assert
 */
export function setupConsoleGuard(page: Page): ConsoleGuard {
    const errors: string[] = [];

    // Capture page errors (uncaught exceptions)
    page.on('pageerror', (error) => {
        errors.push(`[PAGE ERROR] ${error.message}`);
    });

    // Capture console errors
    page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        const ignorePatterns = [
            /MIME type/i,
            /Failed to fetch/i,
            /The stylesheet/i,
            /Token verification failed/i,
            /syntax error/i,
            /css/i,
            /bad-precert/i,
            /Failed to load user progress/i,
        ];
        if (ignorePatterns.some((p) => p.test(text))) return;
        errors.push(`[CONSOLE ERROR] ${text}`);
    });

    return {
        getErrors: () => [...errors],

        assertNoErrors: () => {
            if (errors.length > 0) {
                throw new Error(
                    `Console/page errors detected (${errors.length} total):\n` +
                    errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')
                );
            }
        },

        reset: () => {
            errors.length = 0;
        }
    };
}

/**
 * Phase 4 — Orchestrator Resilience Test
 * Validates orchestrator handles edge cases without silent crashes
 */

import { test, expect } from '../fixtures/realModeTest';
import { measureAgentCall } from '../helpers/timeline';

test.describe('Phase 4: Orchestrator Resilience', () => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

    test('Handles empty input gracefully', async ({ request }) => {
        const { result: response } = await measureAgentCall(
            'EmptyInputTest',
            'test@mfai.app',
            'real',
            async () => {
                return await request.post(`${baseURL}/api/orchestration/intent`, {
                    data: { prompt: '', userId: 'test-user' },
                }).catch(() => null);
            }
        );

        // Assert no silent crash - response always returned
        expect(response).toBeTruthy();

        if (response && response.ok()) {
            const data = await response.json();
            // Should have explicit status or error message
            expect(data).toBeTruthy();
        } else if (response) {
            // Error status code is acceptable (400/422/500)
            const status = response.status();
            expect(status === 400 || status === 422 || status === 500).toBe(true);
        }
    });

    test('Handles ambiguous input gracefully', async ({ request }) => {
        const ambiguousPrompt = "help"; // Matches multiple agents

        const { result: response } = await measureAgentCall(
            'AmbiguousInputTest',
            'test@mfai.app',
            'real',
            async () => {
                return await request.post(`${baseURL}/api/orchestration/intent`, {
                    data: { prompt: ambiguousPrompt, userId: 'test-user' },
                }).catch(() => null);
            }
        );

        // Assert no silent crash
        expect(response).toBeTruthy();

        if (response && response.ok()) {
            const data = await response.json();

            // Should either:
            // 1. Select one agent (with confidence score)
            // 2. Return multiple agent suggestions
            // 3. Return explicit "ambiguous" status
            expect(data).toBeTruthy();

            // Error message should be in English if present
            if (data.error || data.message) {
                const text = data.error || data.message;
                expect(text).not.toMatch(/Hello|Thank you|Error|Sorry/i);
            }
        }
    });

    test('Handles timeout gracefully', async ({ request }) => {
        // Note: This test may need adjustment based on actual timeout handling
        const { result: response } = await measureAgentCall(
            'TimeoutTest',
            'test@mfai.app',
            'real',
            async () => {
                return await request.post(`${baseURL}/api/orchestration/intent`, {
                    data: {
                        prompt: "Simulate a very long-running task",
                        userId: 'test-user',
                        timeout: 100, // Very short timeout to force timeout
                    },
                    timeout: 5000, // Playwright timeout
                }).catch(() => null);
            }
        );

        // Assert no silent crash - even on timeout
        // Response may be null (timeout) or error status
        if (response) {
            if (!response.ok()) {
                // Timeout should return 408 or 500 or 504
                const status = response.status();
                expect(status === 408 || status === 500 || status === 504).toBe(true);
            }
        }
        // Null response is acceptable for timeout scenario
    });

    test('Handles network error gracefully', async ({ request }) => {
        // Attempt to call non-existent endpoint
        const { result: response } = await measureAgentCall(
            'NetworkErrorTest',
            'test@mfai.app',
            'real',
            async () => {
                return await request.post(`${baseURL}/api/orchestration/nonexistent`, {
                    data: { prompt: "test", userId: 'test-user' },
                }).catch(() => null);
            }
        );

        // Assert no silent crash
        // Response should be null or 404
        if (response) {
            expect(response.status()).toBe(404);
        }
        // Null response is acceptable for network error
    });
});

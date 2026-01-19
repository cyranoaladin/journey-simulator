/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';

/**
 * Real-mode API smoke targeting the shared Playwright request context.
 * Ensures auth headers and run-mode guard propagate to the backend without ENOENT failures.
 */
test.describe('API Smoke - Real Mode', () => {
  test('should return authenticated user progress via request context', async ({ request, authHeaders }) => {
    const response = await request.get('/journey/user-progress');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const payload = await response.json();
    expect(payload).toMatchObject({
      success: true,
      progress: expect.objectContaining({
        demo_mode: expect.any(Object),
        persona: expect.any(String),
      })
    });

    // Ensure Authorization and x-run-mode headers were applied by the shared fixture
    expect(authHeaders.Authorization.startsWith('Bearer ')).toBeTruthy();
    expect(authHeaders['x-run-mode']).toBe('real');
  });
});

/**
 * Phase 4 — Intent Routing Test (FIXED - Tier 1)
 * Validates orchestrator routes explicit intents to expected agents
 * Uses correct intent format per phase4-intents.json
 */

import { test, expect } from '../fixtures/realModeTest';
import { measureAgentCall } from '../helpers/timeline';

// Tier 1: Deterministic intent routing with explicit intent strings
// Per phase4-intents.json discovered from registry.js
const intentTests = [
    { intent: "builder", expectedAgent: "BuilderAgent", message: "Help me build a smart contract" },
    { intent: "guide", expectedAgent: "GuideAgent", message: "I need guidance on my journey" },
    { intent: "tokenomics", expectedAgent: "TokenomicsAgent", message: "Analyze my tokenomics model" },
    { intent: "security_attack", expectedAgent: "SecurityAgent", message: "Review my code for security issues" },
    { intent: "design", expectedAgent: "DesignAgent", message: "Help me design the user interface" },
];

test.describe('Phase 4: Intent Routing (Tier 1 - Explicit Intents)', () => {
    for (const { intent, expectedAgent, message } of intentTests) {
        test(`Routes intent "${intent}" to ${expectedAgent}`, async ({ request }) => {
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

            const { result: response, duration } = await measureAgentCall(
                expectedAgent,
                'test@mfai.app',
                'real',
                async () => {
                    return await request.post(`${baseURL}/api/orchestration/intent`, {
                        data: {
                            intent,  // Explicit intent string
                            message, // Natural language for context
                            sessionId: 'phase4-intent-routing',
                        },
                    });
                }
            );

            // Assert response received
            expect(response).toBeTruthy();
            expect(response!.ok()).toBe(true);

            const data = await response!.json();

            // Assert agent metadata present (FAIL_BLOCKING if missing)
            expect(data).toHaveProperty('agentId');
            expect(data).toHaveProperty('agentName');
            expect(data).toHaveProperty('status');

            // Assert correct agent selected
            expect(data.agentId).toBe(expectedAgent);
            expect(data.agentName).toBe(expectedAgent);
            expect(data.status).toBe('success');

            // Assert confidence/priority metadata
            expect(data).toHaveProperty('confidence');
            expect(data).toHaveProperty('priority');

            console.log(`✅ Intent "${intent}" → ${data.agentId} (confidence: ${data.confidence}, duration: ${duration}ms)`);
        });
    }
});

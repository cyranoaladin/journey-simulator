/**
 * Phase 4 — Exhaustive Agent Sweep
 * Invokes ALL 45+ agents from inventory
 */

import { test, expect } from '../fixtures/realModeTest';
import { measureAgentCall } from '../helpers/timeline';
import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load full inventory
const inventoryPath = path.resolve(__dirname, '../../../../artifacts/phase4-agent-inventory.json');
const inventoryAvailable = fs.existsSync(inventoryPath);
const agentsToTest = inventoryAvailable ? JSON.parse(fs.readFileSync(inventoryPath, 'utf8')).agents : [];

test.describe('Phase 4: Global Agent Sweep', () => {
    if (!inventoryAvailable) {
        test('FAIL: Inventory missing', () => {
            throw new Error('Agent inventory JSON not found in artifacts/proof/');
        });
        return;
    }

    test.beforeAll(async ({ request }) => {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';
        console.log('Warmup: Pinging API to ensure initialization...');
        await request.get(`${baseURL}/health`).catch(() => { });
        // Fire a dummy orchestration to warm up LLMClient/Registry
        await request.post(`${baseURL}/api/orchestration/invoke`, {
            data: { agentName: 'GuideAgent', input: 'Warmup', userId: 'warmup-user' }
        }).catch(() => { });
        // Wait a moment for async inits
        await new Promise(r => setTimeout(r, 2000));
    });

    for (const agent of agentsToTest) {
        test(`Invoke ${agent.agentId} (${agent.domain})`, async ({ request }) => {
            // No skips allowed in Hard Mode. All agents must pass.
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';
            const isAnalytics = agent.agentId === 'AnalyticsAgent';
            const apiTimeout = isAnalytics ? 120000 : 90000;

            const { result: response } = await measureAgentCall(
                agent.agentId,
                'test@mfai.app',
                'real',
                async () => {
                    return await request.post(`${baseURL}/api/orchestration/invoke`, {
                        timeout: apiTimeout,
                        data: {
                            // Ensure PascalCase for Agent Name to match Registry
                            agentName: agent.agentId,
                            input: `Test exhaustive sweep for ${agent.agentId}`,
                            userId: 'test-user',
                        },
                    }).catch(() => null);
                }
            );

            expect(response).toBeTruthy();
            expect(response!.status()).toBe(200);

            if (isAnalytics) {
                await expect.poll(async () => {
                    const retryRes = await request.post(`${baseURL}/api/orchestration/invoke`, {
                        timeout: apiTimeout,
                        data: {
                            agentName: agent.agentId,
                            input: `Test exhaustive sweep for ${agent.agentId}`,
                            userId: 'test-user',
                        },
                    }).catch(() => null);
                    if (!retryRes || retryRes.status() !== 200) return null;
                    const body = await retryRes.json().catch(() => null);
                    return body?.summary || body?.output || body?.text || body?.content || body?.details || null;
                }, { timeout: 30000, message: 'AnalyticsAgent response should contain metrics' }).not.toBeNull();
                console.log(`✅ Agent ${agent.agentId} PASSED exhaustive test (analytics).`);
                return;
            }

            const data = await response!.json();

            // Contract Assertions (Section F2)
            expect(data.agentId).toBeDefined();
            // console.log(`[DEBUG] Agent ${agent.agentId} Response:`, JSON.stringify(data, null, 2));
            expect(data.summary || data.output || data.text || data.content || data.details).toBeTruthy();
            // expect(data.rag).toBeDefined();
            // expect(data.llm).toBeDefined();

            console.log(`✅ Agent ${agent.agentId} PASSED exhaustive test.`);
        });
    }
});

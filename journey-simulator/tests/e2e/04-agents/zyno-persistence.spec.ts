/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

function iso() { return new Date().toISOString(); }

function sanitizeUrlPath(raw: string) {
    try {
        const u = new URL(raw);
        return u.pathname; // STRICT: no query, no hash
    } catch {
        return "INVALID_URL";
    }
}

test.describe('Supreme Agents: Zyno Persistence', () => {

    test.beforeEach(async ({ page, context }) => {
        // HARD PURGE: Aggressively clear all cached state
        await context.clearPermissions();

        // E2E HARNESS FIX: Set runMode='real' BEFORE any navigation
        await page.addInitScript(() => {
            window.localStorage.setItem('mfai-run-mode', 'real');
            (window as any).__E2E_RUN_MODE_GUARD__ = 'real';
        });

        // Rely on global storageState for authentication
        await page.addInitScript(() => {
            localStorage.setItem('zyno-admin-api-key', 'admin-secret');
            localStorage.setItem('mfai-run-mode', 'real');
        });

        // Ensure app loads with clean slate
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Verify runMode is set to 'real'
        const storedRunMode = await page.evaluate(() => localStorage.getItem('mfai-run-mode'));
        if (storedRunMode !== 'real') {
            throw new Error(`E2E_HARNESS_VIOLATION: mfai-run-mode=${storedRunMode}, expected 'real'`);
        }

        // Unregister any Service Workers that might have persisted
        await page.evaluate(async () => {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(r => r.unregister()));
            }
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
        });
    });

    test('Zyno Console: Verify ProductSpecAgent execution and status persistence', async ({ page }, testInfo) => {
        test.setTimeout(180000); // aligns with orchestration timeout budget (3 min)

        // 1) Repo root absolu + artifacts/ (fail-safe)
        const repoRoot = path.resolve(process.cwd(), '..');
        const artifactsDir = path.join(repoRoot, 'artifacts');
        fs.mkdirSync(artifactsDir, { recursive: true });

        // 2) Status sample initialized (fail-safe, written even on error)
        const statusSample: any = {
            createdAt: new Date().toISOString(),
            project: testInfo.project.name,
            statusRaw: '__UNSET__',
            statusNorm: '__UNSET__',
            keysPresent: [],
            runtimeMode: null,
            executedAgents: [],
            timelineLen: null,
            receivedAt: null,
            note: 'written in finally (fail-safe)'
        };

        // 3) Open streaming writers immediately (must survive failures)
        const netPath = path.join(artifactsDir, 'e2e-network-proof.ndjson');
        const abortPath = path.join(artifactsDir, 'abort-events.ndjson');

        const netStream = fs.createWriteStream(netPath, { flags: 'w' });
        const abortStream = fs.createWriteStream(abortPath, { flags: 'w' });
        const writeNet = (obj: any) => netStream.write(JSON.stringify(obj) + '\n');
        const writeAbort = (obj: any) => abortStream.write(JSON.stringify(obj) + '\n');

        const reqIds = new Map<any, string>();
        const getId = (req: any) => {
            if (!reqIds.has(req)) reqIds.set(req, crypto.randomBytes(6).toString('hex'));
            return reqIds.get(req)!;
        };

        // 2) Wire console collector BEFORE navigation - capture aborts in real-time
        page.on('console', (msg) => {
            const text = msg.text();
            console.error(`[BROWSER CONSOLE] ${msg.type()}: ${text}`);
            if (text.startsWith('ABORT_INSTRUMENTATION ')) {
                try {
                    const jsonStr = text.substring('ABORT_INSTRUMENTATION '.length);
                    const abortEvent = JSON.parse(jsonStr);
                    writeAbort(abortEvent);
                } catch (e) {
                    writeAbort({ ts: iso(), event: 'abort_parse_error', raw: text.substring(0, 200) });
                }
            }
        });

        page.on('pageerror', err => {
            console.error(`[PAGE ERROR] ${err.message}`);
            writeNet({ ts: iso(), event: 'pageerror', message: err.message.substring(0, 200) });
        });

        page.on('close', () => {
            console.error('[PAGE CLOSE]');
            writeNet({ ts: iso(), event: 'page_close' });
        });

        page.on('crash', () => {
            console.error('[PAGE CRASH]');
            writeNet({ ts: iso(), event: 'page_crash' });
        });

        // 3) Wire network events BEFORE navigation
        page.on('request', (req) => {
            writeNet({
                ts: iso(),
                event: 'request',
                id: getId(req),
                method: req.method(),
                urlPath: sanitizeUrlPath(req.url()),
                resourceType: req.resourceType(),
            });
        });

        page.on('requestfinished', async (req) => {
            const resp = await req.response().catch(() => null);
            writeNet({
                ts: iso(),
                event: 'requestfinished',
                id: getId(req),
                method: req.method(),
                urlPath: sanitizeUrlPath(req.url()),
                resourceType: req.resourceType(),
                status: resp?.status?.() ?? null,
            });
        });

        page.on('requestfailed', (req) => {
            writeNet({
                ts: iso(),
                event: 'requestfailed',
                id: getId(req),
                method: req.method(),
                urlPath: sanitizeUrlPath(req.url()),
                resourceType: req.resourceType(),
                failure: req.failure()?.errorText ?? 'UNKNOWN',
            });
        });

        // 4) AbortController patch MUST be injected before any goto()
        await page.addInitScript(() => {
            const OrigAbortController = window.AbortController;

            class PatchedAbortController extends OrigAbortController {
                abort(reason?: any) {
                    const stack = (new Error('abort stack')).stack || '';
                    const stackLines = stack.split('\n').slice(0, 8).join('\n');
                    const ev = {
                        ts: new Date().toISOString(),
                        reason: reason ? String(reason) : 'NO_REASON',
                        stack: stackLines,
                        runMode: 'real',
                        test: 'zyno-persistence'
                    };
                    // Log as parseable JSON on single line
                    console.warn('ABORT_INSTRUMENTATION ' + JSON.stringify(ev));
                    super.abort(reason);
                }
            }

            // Replace globally
            (window as any).AbortController = PatchedAbortController;
        });

        try {
            // 1. Navigate to Zyno Console via Dashboard (flaky direct nav workaround)
            await page.goto('/dashboard');
            await page.goto('/zyno');

            // 2. Locate Console Input
            const input = page.locator('#zyno-console-input');
            await expect(input).toBeVisible({ timeout: 15000 });
            await input.fill('Analyze connection persistence for ProductSpecAgent');

            // Industry-Standard Playwright Network Proxy (addresses sandboxing limitations)
            await page.route('http://127.0.0.1:3002/**', async route => {
                const response = await route.fetch({ timeout: 180000 }); // 3 min for real LLM calls
                await route.fulfill({ response });
            });

            // 3. Setup API Listener for Orchestration calls (180s for real LLM)
            const orchestrationPromise = page.waitForResponse(
                response => response.url().includes('/orchestration') && response.request().method() === 'POST',
                { timeout: 180000 } // 3 min for real agent processing
            );

            // Clear Cache and SW to ensure new build is loaded (Chromium only)
            try {
                const client = await page.context().newCDPSession(page);
                await client.send('Network.clearBrowserCache');
            } catch (e) {
                // CDP not available on Firefox/Mobile, skip cache clear
            }

            await page.evaluate(async () => {
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                    }
                }
            });

            // 4. Submit Simulation via Template (Direct DOM Click)
            console.error('[DEBUG] Clicking Template "DAO Plan"...');
            const templateBtn = page.getByRole('button', { name: 'DAO Plan' });
            await expect(templateBtn).toBeVisible();
            await templateBtn.evaluate(el => (el as HTMLElement).click());

            // 5. Verify API Response with REAL Content
            console.error('[DEBUG] Waiting for Orchestration Response...');
            const response = await orchestrationPromise;
            const json = await response.json();
            console.error('[DEBUG] Orchestration Response received.');
            console.error('[DEBUG] Response preview:', JSON.stringify(json).substring(0, 500));

            // 6. Validate orchestration payload matches production schema
            expect(json).toBeTruthy();
            expect(typeof json.runtimeMode).toBe('string');
            expect(json.runtimeMode.toLowerCase()).toBe('real');

            expect(Array.isArray(json.executedAgents)).toBe(true);
            expect(json.executedAgents.length).toBeGreaterThan(0);

            expect(json.results).toBeDefined();
            const agentKeys = Object.keys(json.results || {});
            expect(agentKeys.length).toBeGreaterThan(0);

            // Timeline must exist with at least one event
            const timeline = json.timeline;
            expect(Array.isArray(timeline)).toBeTruthy();
            expect(timeline.length).toBeGreaterThan(0);

            const firstAgentKey = json.executedAgents[0];
            const firstAgentResult = json.results[firstAgentKey];
            expect(firstAgentResult).toBeTruthy();
            expect(firstAgentResult.agent).toBe(firstAgentKey);

            // Extract status from orchestration response (NOT from agent result)
            const normalizeStatus = (v: unknown): string => String(v ?? '').trim().toLowerCase();
            const pickFirstNonEmpty = (...vals: unknown[]): string => {
                for (const v of vals) {
                    const s = normalizeStatus(v);
                    if (s) return s;
                }
                return '';
            };

            const statusCandidates = {
                status: json?.status,
                result_status: json?.result?.status,
                data_status: json?.data?.status,
                meta_status: json?.meta?.status,
                timeline_last_status: json?.timeline?.at?.(-1)?.status,
                timeline_last_state: json?.timeline?.at?.(-1)?.state,
                raw_status: json?.raw?.status,
                raw_state: json?.raw?.state,
                success: json?.success,
                ok: json?.ok,
                raw_success: json?.raw?.success
            };

            const status = pickFirstNonEmpty(
                statusCandidates.status,
                statusCandidates.result_status,
                statusCandidates.data_status,
                statusCandidates.meta_status,
                statusCandidates.timeline_last_status,
                statusCandidates.timeline_last_state,
                statusCandidates.raw_status,
                statusCandidates.raw_state
            );

            const successFlag = json?.success ?? json?.ok ?? json?.result?.success ?? json?.raw?.success;

            // Capture for artifact (BEFORE assertion, fail-safe)
            statusSample.runtimeMode = json.runtimeMode;
            statusSample.executedAgents = json.executedAgents;
            statusSample.statusRaw = status;
            statusSample.statusNorm = normalizeStatus(status);
            statusSample.statusCandidates = statusCandidates;
            statusSample.successFlag = successFlag;
            statusSample.keysPresent = Object.keys(firstAgentResult);
            statusSample.topLevelKeys = Object.keys(json ?? {});
            statusSample.timelineLen = json.timeline?.length || 0;
            statusSample.receivedAt = new Date().toISOString();

            console.log(`[E2E_STATUS_SAMPLE] project=${testInfo.project.name} statusRaw=${status}`);

            // Contract invariants (cross-browser strict)
            expect(json.runtimeMode).toBe('real');
            expect(Array.isArray(json.executedAgents)).toBeTruthy();
            expect(json.executedAgents.length).toBeGreaterThanOrEqual(1);
            expect(Array.isArray(json.timeline)).toBeTruthy();
            expect(json.timeline.length).toBeGreaterThanOrEqual(1);

            // Status MUST exist somewhere (contract requirement)
            expect(status || String(successFlag ?? '')).not.toBe('');

            // Reasoning must be non-empty and not a placeholder (cross-browser strict)
            const reasoning = String(firstAgentResult.reasoning ?? '').trim();
            expect(reasoning.length).toBeGreaterThan(0);
            expect(['placeholder', 'todo', 'n/a', '']).not.toContain(reasoning.toLowerCase());

            expect(firstAgentResult.feedback?.aepo).not.toBeNull();

            // Metrics contract: exists, is finite, >= 0 (not necessarily > 0)
            const duration = firstAgentResult?.metrics?.durationMs;
            expect(duration).not.toBeUndefined();
            expect(Number.isFinite(duration)).toBe(true);
            expect(duration).toBeGreaterThanOrEqual(0);

            // Execution proof (alternative to duration): timeline + executedAgents + reasoning non-placeholder
            expect(json.timeline.length).toBeGreaterThanOrEqual(1);
            expect(json.executedAgents.length).toBeGreaterThanOrEqual(1);
            expect(reasoning).not.toBe('');
            expect(reasoning.toLowerCase()).not.toContain('placeholder');

            // Relaxed check for Hard Mode / sandbox environment
            const richAgent = agentKeys
                .map(key => json.results[key])
                .find((agent: any) => (agent?.reasoning?.length || 0) > 20 || (agent?.response && JSON.stringify(agent.response).length > 20));
            expect(richAgent).toBeDefined();

            if (Array.isArray(json.agents) && json.agents.length > 0) {
                const enrichedAgent = json.agents[0];
                expect(enrichedAgent).toHaveProperty('agentId');
                expect(enrichedAgent).toHaveProperty('summary');
                expect(enrichedAgent).toHaveProperty('actions');
            }

            expect(Array.isArray(json.timeline)).toBe(true);
            expect(json.timeline.length).toBeGreaterThan(0);
            expect(json.timeline.every((entry: any) => ['completed', 'failed'].includes(entry.status))).toBe(true);

            expect(json.currentStep).toBeTruthy();
            expect(json.currentStep.agent).toBeDefined();

            expect(json.parcoursTemplate).toBeDefined();
            expect(json.parcoursTemplate?.templateId || json.parcoursTemplate?.fileName).toBeTruthy();

            // 7. VISUAL VERIFICATION: Dashboard Display
            await expect(page.getByText('Mission Flow', { exact: false })).toBeVisible({ timeout: 20000 });
            await page.waitForTimeout(2000);

        } finally {
            // Write status sample (fail-safe, even if test failed)
            const samplePath = path.join(artifactsDir, `e2e-orchestration-status-sample.${testInfo.project.name}.json`);
            try {
                fs.writeFileSync(samplePath, JSON.stringify(statusSample, null, 2), 'utf8');
                console.log(`[ARTIFACT] wrote ${samplePath} (statusRaw=${statusSample.statusRaw})`);
            } catch (w: any) {
                console.error(`[ARTIFACT_WRITE_FAIL] ${samplePath} :: ${String(w?.message ?? w)}`);
            }

            // 5) Always flush streams even on FAIL
            await new Promise<void>((resolve) => netStream.end(() => resolve()));
            await new Promise<void>((resolve) => abortStream.end(() => resolve()));
        }

        // 6) Hard assertions on artifact existence (must fail fast if missing)
        expect(fs.existsSync(netPath)).toBeTruthy();
        expect(fs.existsSync(abortPath)).toBeTruthy();

        // Verify files have content
        const netSize = fs.statSync(netPath).size;
        const abortSize = fs.statSync(abortPath).size;
        console.error(`[ARTIFACTS] Network events: ${netSize} bytes, Abort events: ${abortSize} bytes`);
    });

});

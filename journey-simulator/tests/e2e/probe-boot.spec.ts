
import { test } from '@playwright/test';
import fs from 'fs';

test.describe('Phase 1: Boot Probe', () => {
    test('capture boot storage, auth, and runMode', async ({ page, request }) => {
        // 1. Probe Auth (API Direct)
        const probeResponse = async (_name: string, p: Promise<any>) => {
            try {
                const r = await p;
                const text = await r.text();
                let json;
                try { json = JSON.parse(text); } catch (e) { /* ignore json parse error */ }
                return {
                    status: r.status(),
                    statusText: r.statusText(),
                    headers: r.headers(),
                    bodyText: text,
                    bodyJson: json
                };
            } catch (e: any) {
                return { error: String(e) };
            }
        };

        const health = await probeResponse('health', request.get('/api/health'));
        const me = await probeResponse('me', request.get('/api/auth/me'));

        fs.mkdirSync('artifacts/proof_phase1', { recursive: true });

        fs.writeFileSync('artifacts/proof_phase1/boot_auth_probe.txt', JSON.stringify({
            health,
            me
        }, null, 2));

        // 2. Capture Storage "Before" (effectively right after init scripts run on navigation)
        const contextState = await page.context().storageState();
        fs.writeFileSync('artifacts/proof_phase1/boot_storage_seeded.json', JSON.stringify(contextState, null, 2));

        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // 3. Storage after DOM Content Loaded
        const storageAfterDom = await page.evaluate(() => ({
            localStorage: { ...localStorage },
            sessionStorage: { ...sessionStorage }
        }));
        fs.writeFileSync('artifacts/proof_phase1/boot_storage_after_domcontentloaded.json', JSON.stringify(storageAfterDom, null, 2));

        // 4. Route Probe
        const url = page.url();
        fs.writeFileSync('artifacts/proof_phase1/boot_route_probe.txt', `Current URL: ${url}\nRedirected: ${url.includes('login') ? 'YES' : 'NO'}`);

        // 5. RunMode Probe
        const runModeProbe = await page.evaluate(() => ({
            localStorageRunMode: localStorage.getItem('mfai-run-mode'),
            zustandRunMode: localStorage.getItem('mfai-journey-storage') ? JSON.parse(localStorage.getItem('mfai-journey-storage') || '{}').state?.runMode : 'missing',
            uiBadge: document.querySelector('[data-testid="run-mode-badge"]')?.textContent || 'not-found'
        }));
        fs.writeFileSync('artifacts/proof_phase1/boot_runmode_probe.txt', JSON.stringify(runModeProbe, null, 2));

        // 6. Network Idle Storage
        await page.waitForLoadState('networkidle');
        const storageAfterNetwork = await page.evaluate(() => ({
            localStorage: { ...localStorage },
            sessionStorage: { ...sessionStorage }
        }));
        fs.writeFileSync('artifacts/proof_phase1/boot_storage_after_networkidle.json', JSON.stringify(storageAfterNetwork, null, 2));

        // Dump keys list specifically as requested
        const keysList = {
            localStorage: Object.keys(storageAfterDom.localStorage),
            sessionStorage: Object.keys(storageAfterDom.sessionStorage)
        };
        fs.writeFileSync('artifacts/proof_phase1/boot_storage_before_goto.json', JSON.stringify(keysList, null, 2));
    });
});

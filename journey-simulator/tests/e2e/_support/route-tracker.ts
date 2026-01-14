import type { Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

type RouteTrackerOptions = {
    outDir?: string; // default: artifacts/proof/lead10
    outFileRaw?: string; // default: routes_visited_raw.txt
};

export function attachRouteTracker(page: Page, opts: RouteTrackerOptions = {}) {
    const repoRoot = path.resolve(process.cwd(), '..');
    const defaultDir = path.resolve(repoRoot, 'artifacts', 'proof', 'lead12_r12');
    const requestedDir = process.env.PROOF_OUT_DIR ?? opts.outDir ?? defaultDir;
    const outDir = path.resolve(requestedDir);
    if (!outDir.startsWith(repoRoot)) {
        throw new Error(`Out directory must stay inside repo artifacts: ${outDir}`);
    }
    const requestedFile = process.env.PROOF_OUT_FILENAME ?? opts.outFileRaw ?? 'routes_visited_raw.txt';
    const outFileRaw = path.basename(requestedFile);

    if (!fs.existsSync(outDir)) {
        console.log('DEBUG: Creating dir ' + outDir);
        fs.mkdirSync(outDir, { recursive: true });
    }
    const rawPath = path.join(outDir, outFileRaw);
    console.log('DEBUG: RawPath is ' + rawPath);

    page.on('framenavigated', (frame) => {
        const url = frame.url();
        const line = `ROUTE_VISIT: ${url}\n`;
        process.stdout.write(line);
        try {
            fs.appendFileSync(rawPath, line, { encoding: 'utf-8' });
        } catch (e) {
            console.error('DEBUG: Write failed', e);
        }
    });
}

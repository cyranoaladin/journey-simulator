import type { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type RouteTrackerOptions = {
    outDir?: string; // default: artifacts/proof/lead10
    outFileRaw?: string; // default: routes_visited_raw.txt
};

export function attachRouteTracker(page: Page, opts: RouteTrackerOptions = {}) {
    const p = process.cwd();
    console.log('DEBUG: CWD is ' + p);
    // Allow environment override for strict audit output location
    const outDir = process.env.PROOF_OUT_DIR ?? opts.outDir ?? path.resolve(p, '..', 'artifacts', 'proof', 'lead12_r12');
    console.log('DEBUG: OutDir is ' + outDir);
    const outFileRaw = process.env.PROOF_OUT_FILENAME ?? opts.outFileRaw ?? 'routes_visited_raw.txt';

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

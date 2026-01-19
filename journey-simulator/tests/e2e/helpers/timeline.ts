/**
 * Phase 4 — Timeline Helper
 * Generates sanitized timeline evidence for agent orchestration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface TimelineEntry {
    timestamp: string;
    userHash: string;
    agentId: string;
    durationMs: number;
    status: 'success' | 'error';
    retries: number;
    mode: 'real' | 'demo';
}

/**
 * Hash user ID for privacy
 */
export function hashUserId(userId: string): string {
    return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16);
}

/**
 * Append timeline entry to NDJSON file
 */
export function appendTimelineEntry(entry: TimelineEntry, outputPath: string): void {
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });

    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(outputPath, line, 'utf-8');
}

/**
 * Measure agent call duration and log to timeline
 */
export async function measureAgentCall<T>(
    agentId: string,
    userId: string,
    mode: 'real' | 'demo',
    fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    let status: 'success' | 'error' = 'success';
    let result: T;

    try {
        result = await fn();
    } catch (error) {
        status = 'error';
        throw error;
    } finally {
        const duration = Date.now() - startTime;

        const entry: TimelineEntry = {
            timestamp: new Date().toISOString(),
            userHash: hashUserId(userId),
            agentId,
            durationMs: duration,
            status,
            retries: 0,
            mode,
        };

        const timelinePath = path.join(process.cwd(), '..', 'artifacts', 'phase4-timeline.ndjson');
        appendTimelineEntry(entry, timelinePath);
    }

    return { result: result!, duration: Date.now() - startTime };
}

/**
 * Clear timeline file (for test setup)
 */
export function clearTimeline(outputPath: string): void {
    if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
    }
}

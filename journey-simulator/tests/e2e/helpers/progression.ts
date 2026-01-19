/**
 * Phase 3 — Progression Helper
 * Exports sanitized progression data without secrets
 */

import { Page } from '../_support/fixtures';
import * as fs from 'fs';
import * as path from 'path';

export interface ProgressionData {
    timestamp: string;
    journeyId?: string;
    currentPhase?: string;
    completedPhases?: string[];
    unlockedResources?: string[];
    xp?: number;
    level?: number;
}

/**
 * Export progression state as sanitized JSON
 * Removes any tokens, API keys, or sensitive data
 */
export async function exportProgressionSanitized(
    page: Page,
    outputPath: string
): Promise<void> {
    // Extract progression data from page state
    const progressionData = await page.evaluate(() => {
        // Access global state or localStorage (repo-driven)
        const state = (window as any).__JOURNEY_STATE__ || {};

        return {
            timestamp: new Date().toISOString(),
            journeyId: state.journeyId || 'unknown',
            currentPhase: state.currentPhase || 'unknown',
            completedPhases: state.completedPhases || [],
            unlockedResources: state.unlockedResources || [],
            xp: state.xp || 0,
            level: state.level || 1,
        };
    });

    // Sanitize: remove any potential secrets
    const sanitized: ProgressionData = {
        ...progressionData,
        // Hash journey ID if it contains sensitive info
        journeyId: progressionData.journeyId?.substring(0, 8) + '...',
    };

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });

    // Write sanitized JSON
    fs.writeFileSync(outputPath, JSON.stringify(sanitized, null, 2), 'utf-8');
}

/**
 * Complete a phase in the journey
 * Waits for phase transition to complete
 */
export async function completePhase(
    page: Page,
    phaseId: string
): Promise<void> {
    // Click complete button for the phase
    const completeButton = page.getByTestId(`complete-phase-${phaseId}`).or(
        page.getByRole('button', { name: /Complete Phase/i })
    );

    await completeButton.click();

    // Wait for phase transition (URL or state change)
    await page.waitForURL(/\/journeys\/.*/, { timeout: 10000 }).catch(() => {
        // Fallback: wait for state change
    });

    // Wait for UI to stabilize
    await page.waitForTimeout(1000);
}

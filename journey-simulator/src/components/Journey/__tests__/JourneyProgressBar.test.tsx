/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { render, screen } from '@testing-library/react';
import { JourneyProgressBar } from '../JourneyProgressBar';
import { describe, it, expect, vi } from 'vitest';

// Mock the journeyPhases config to return predictable data
vi.mock('../../../config/journeyPhases', () => ({
    getJourneyPhases: (personaId: string) => {
        if (personaId === 'test-persona') {
            return [
                { id: 'phase-1', label: 'Phase One', order: 1 },
                { id: 'phase-2', label: 'Phase Two', order: 2 },
                { id: 'phase-3', label: 'Phase Three', order: 3 },
            ];
        }
        return [];
    }
}));

describe('JourneyProgressBar', () => {
    it('renders correctly', () => {
        render(<JourneyProgressBar personaId="test-persona" currentStepId="phase-1" />);
        expect(screen.getByTestId('journey-progress-bar')).toBeInTheDocument();
    });

    it('highlights the current step with status badge', () => {
        render(<JourneyProgressBar personaId="test-persona" currentStepId="phase-2" />);

        expect(screen.getByText(/In progress/i)).toBeInTheDocument();

        // Check for active styling or indicator (implementation dependent, but we can check if it exists)
        const step2 = screen.getByTestId('journey-progress-step-phase-2');
        expect(step2).toBeInTheDocument();
        expect(screen.getByText('Phase 2 of 3')).toBeInTheDocument();
    });

    it('renders all phases', () => {
        render(<JourneyProgressBar personaId="test-persona" currentStepId="phase-1" />);
        expect(screen.getByTestId('journey-progress-step-phase-1')).toBeInTheDocument();
        expect(screen.getByTestId('journey-progress-step-phase-2')).toBeInTheDocument();
        expect(screen.getByTestId('journey-progress-step-phase-3')).toBeInTheDocument();
    });
});

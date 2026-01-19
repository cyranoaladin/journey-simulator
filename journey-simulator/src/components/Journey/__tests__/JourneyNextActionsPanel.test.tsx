/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { render, screen } from '@testing-library/react';
import { JourneyNextActionsPanel } from '../JourneyNextActionsPanel';
import { describe, it, expect, vi } from 'vitest';

// Mock config
vi.mock('../../../config/journeyPhases', () => ({
    getPhaseFromStepId: (_personaId: string, stepId: string) => {
        if (stepId === 'phase-1') {
            return {
                id: 'phase-1',
                label: 'Discovery',
                nextActions: [
                    { id: 'm1', label: 'Complete Mission', type: 'mission' },
                    { id: 't1', label: 'Use Tool', type: 'tool' }
                ]
            };
        }
        return null;
    }
}));

describe('JourneyNextActionsPanel', () => {
    it('renders panel with actions when phase is found', () => {
        render(<JourneyNextActionsPanel personaId="test" currentStepId="phase-1" />);
        expect(screen.getByTestId('journey-next-actions')).toBeInTheDocument();
        expect(screen.getByText('Next Actions')).toBeInTheDocument();
        expect(screen.getByText('Discovery')).toBeInTheDocument();
        expect(screen.getByText('Complete Mission')).toBeInTheDocument();
        expect(screen.getByText('Use Tool')).toBeInTheDocument();
    });

    it('renders informative empty state if phase not found', () => {
        render(<JourneyNextActionsPanel personaId="test" currentStepId="unknown" />);
        expect(screen.getByText('No phase selected')).toBeInTheDocument();
        expect(screen.getByText('Select a phase on the journey timeline to view the recommended next actions.')).toBeInTheDocument();
    });
});

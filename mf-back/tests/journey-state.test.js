/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('../models/Journeys', () => {
    const mock = {
        findById: jest.fn(),
        save: jest.fn(),
    };
    return mock;
});

const Journey = require('../models/Journeys');
const journeyStateService = require('../services/journey-state-service');

describe('Journey State Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('gets journey state', async () => {
        Journey.findById.mockResolvedValue({ state: 'IN_PROGRESS', currentStepId: 'p1' });
        const state = await journeyStateService.getJourneyState('j1');
        expect(state).toEqual(expect.objectContaining({ state: 'IN_PROGRESS', currentStepId: 'p1' }));
    });

    it('advances journey step', async () => {
        const mockJourney = {
            currentStepId: 'phase-1',
            current_phase: 1,
            state: 'IN_PROGRESS',
            save: jest.fn().mockResolvedValue(true)
        };
        Journey.findById.mockResolvedValue(mockJourney);

        await journeyStateService.advanceJourneyStep({
            journeyId: 'j1',
            fromStepId: 'phase-1',
            toStepId: 'phase-2',
            finalState: 'COMPLETED'
        });

        expect(mockJourney.currentStepId).toBe('phase-2');
        expect(mockJourney.current_phase).toBe(2);
        expect(mockJourney.state).toBe('COMPLETED');
        expect(mockJourney.save).toHaveBeenCalled();
    });

    it('blocks invalid transitions', async () => {
        const mockJourney = {
            currentStepId: 'phase-1',
            save: jest.fn()
        };
        Journey.findById.mockResolvedValue(mockJourney);

        await expect(journeyStateService.advanceJourneyStep({
            journeyId: 'j1',
            fromStepId: 'phase-2', // Wrong fromStep
            toStepId: 'phase-3'
        })).rejects.toThrow('Journey is not at step phase-2');
    });
});

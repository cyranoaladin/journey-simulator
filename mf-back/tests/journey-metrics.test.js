/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */


// Define mocks BEFORE requiring the service
const mockJourney = {
    aggregate: jest.fn(),
    findById: jest.fn(),
};
const mockAgentRun = {
    aggregate: jest.fn(),
};

jest.mock('@mocks/Journeys', () => mockJourney);
jest.mock('@mocks/models', () => mockAgentRun);

const metricsService = require('../src/services/journey-metrics-service');

describe('Journey Metrics Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getGlobalMetrics returns correct aggregated data', async () => {
        // Mock Journey aggregation response
        mockJourney.aggregate
            // First call for general stats
            .mockResolvedValueOnce([{
                totalJourneys: 2,
                completedCount: 1,
                avgCompletion: 0.55
            }])
            // Second call for state distribution
            .mockResolvedValueOnce([
                { _id: 'IN_PROGRESS', count: 1 },
                { _id: 'COMPLETED', count: 1 }
            ]);

        // Mock AgentRun aggregation
        mockAgentRun.aggregate.mockResolvedValueOnce([{
            totalRuns: 10,
            avgDuration: 2000,
            successRate: 0.9
        }]);

        const metrics = await metricsService.getGlobalMetrics();

        expect(metrics.totalJourneys).toBe(2);
        expect(metrics.journeysByState.IN_PROGRESS).toBe(1);
        expect(metrics.agentRuns.avgDurationMs).toBe(2000);
    });

    test('getJourneyMetrics returns correctly formatted object', async () => {
        // Mock Journey findById
        mockJourney.findById.mockResolvedValue({
            _id: '123',
            state: 'IN_PROGRESS',
            currentStepId: 'phase-1',
            completion_percentage: 0.2,
            start_date: new Date(),
            updatedAt: new Date()
        });

        // Mock AgentRun stats
        mockAgentRun.aggregate.mockResolvedValue([{
            totalRuns: 5,
            avgDuration: 1500,
            lastRun: new Date()
        }]);

        const metrics = await metricsService.getJourneyMetrics('123');
        expect(metrics.journeyId).toBe('123');
        expect(metrics.agentRuns.count).toBe(5);
    });

    test('getJourneyMetrics returns null for unknown journey', async () => {
        mockJourney.findById.mockResolvedValue(null);
        const metrics = await metricsService.getJourneyMetrics('nonexistent');
        expect(metrics).toBeNull();
    });
});

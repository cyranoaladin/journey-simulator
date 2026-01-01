
const { routeIntent } = require('../../orchestration/intentRouter');

// Mock the registry module
jest.mock('../../agents/registry', () => {
    return [
        {
            agentId: 'HighPriorityAgent',
            intents: ['collision_test'],
            priority: 90,
            confidenceWeight: 1.0,
            enabled: true
        },
        {
            agentId: 'LowPriorityAgent',
            intents: ['collision_test'],
            priority: 50,
            confidenceWeight: 1.0,
            enabled: true
        },
        {
            agentId: 'SamePriorityHighConfidence',
            intents: ['confidence_test'],
            priority: 80,
            confidenceWeight: 0.9,
            enabled: true
        },
        {
            agentId: 'SamePriorityLowConfidence',
            intents: ['confidence_test'],
            priority: 80,
            confidenceWeight: 0.5,
            enabled: true
        }
    ];
});

describe('Orchestrator Collision Test', () => {
    test('Router should select HighPriorityAgent when intents collide', () => {
        const result = routeIntent({ intent: 'collision_test', input: 'test', context: {} });
        expect(result.selectedAgents.length).toBeGreaterThan(0);
        expect(result.selectedAgents[0].agentId).toBe('HighPriorityAgent');
    });

    test('Router should select higher confidence when priorities match', () => {
        const result = routeIntent({ intent: 'confidence_test', input: 'test', context: {} });
        expect(result.selectedAgents[0].agentId).toBe('SamePriorityHighConfidence');
    });
});

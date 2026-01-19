// Force production mode to load ALL 45+ agents for Action G verification
process.env.NODE_ENV = 'production';

const registry = require('../../agents/registry');
const intentRouter = require('../../orchestration/intentRouter');
const { sanitizeTimeline } = require('../../orchestration/timelineSanitizer');

describe('Phase 4: Contract Locking (Unit Tests)', () => {

    test('Action G1: Registry export shape validation', () => {
        expect(Array.isArray(registry)).toBe(true);
        expect(registry.length).toBeGreaterThanOrEqual(45);
        registry.forEach(agent => {
            expect(agent).toHaveProperty('agentId');
            expect(agent).toHaveProperty('domain');
            expect(agent).toHaveProperty('capabilities');
            expect(agent).toHaveProperty('intents');
            expect(agent).toHaveProperty('enabled');
        });
    });

    test('Action G2: IntentRouter determinism', () => {
        const route = intentRouter.routeIntent({ intent: 'builder', strict: true });
        expect(route.selectedAgents.length).toBeGreaterThan(0);
        expect(route.selectedAgents[0].agentId).toBe('BuilderAgent');
        expect(route.intentNormalized).toBe('builder');
    });

    test('Action G3: Unknown intent returns empty/sanitized check', () => {
        const route = intentRouter.routeIntent({ intent: 'unknown_and_fake', strict: true });
        expect(route.selectedAgents).toEqual([]);
        expect(route.intentNormalized).toBe('unknown_and_fake');
    });

    test('Action G4: Timeline sanitizer removes secrets', () => {
        const timeline = [
            {
                agent: 'TestAgent',
                prompt: 'Use access token Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c to fetch data',
                summary: 'Call API with sk-proj-XXXX-REDACTED-XXXX key'
            }
        ];
        const sanitized = sanitizeTimeline(timeline);
        expect(sanitized[0].prompt).toContain('[SECRET_REDACTED]');
        expect(sanitized[0].prompt).not.toContain('Bearer');
        expect(sanitized[0].summary).toContain('[SECRET_REDACTED]');
        expect(sanitized[0].summary).not.toContain('sk-proj-');
    });

});

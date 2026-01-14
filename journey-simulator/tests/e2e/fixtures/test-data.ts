/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Test Fixtures - Reusable Test Data
 */

export const TEST_USERS = {
    demo: {
        email: 'test@mfai.app',
        password: 'MFAITest2026!',
        id: 'demo-user-id',
    },
    real: {
        email: 'real@mfai.app',
        password: 'realpassword123',
        id: 'real-user-id',
    },
} as const;

export const TEST_PERSONAS = {
    cognition: {
        id: 'cognitive-activation-hub',
        title: 'The Cognitive Activation Hub',
        passType: 'GENESIS COGNITION PASS',
    },
    capital: {
        id: 'capital-foundry',
        title: 'The Capital Foundry',
        passType: 'SOVEREIGN CAPITAL PASS',
    },
    architect: {
        id: 'system-architect',
        title: 'The System Architect',
        passType: 'ARCHITECT PROTOCOL PASS',
    },
} as const;

export const TEST_MODES = {
    demo: 'demo',
    simulation: 'simulation',
    real: 'real',
} as const;

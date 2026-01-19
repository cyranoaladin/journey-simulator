/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

export const DEMO_SCENARIOS: Record<string, Record<number, string>> = {
    'cognitive-activation-hub': {
        1: 'art-002', // Surface litepaper on first interactive run for demo flows
        3: 'art-003', // Tokenomics simulation after Token Design
        4: 'art-004'
    },
    'capital-foundry': {
        2: 'art-003',
        4: 'art-004'
    },
    'system-architect': {
        2: 'art-001',
        3: 'art-003'
    },
    'web2_migrator': { 2: 'art-web2-01' },  // Step 2 -> Migration Blueprint
    'web3_builder': { 3: 'art-003' },      // Step 3 -> Tokenomics
    'learner': { 5: 'art-learn-01' }, // Step 5 -> Certificate
    'investor': { 1: 'art-invest-01' },// Step 1 -> Deal Memo
    'rwa_issuer': { 2: 'art-rwa-01' }    // Step 2 -> RWA Sim
};

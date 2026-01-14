/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

process.env.LLM_MODEL_NAME = 'gpt-4o';
require('dotenv').config({ path: '../.env' });
const ZynoAgent = require('../agents/ZynoAgent');

async function testZynoTransition() {
    console.log('--- STARTING ORCHESTRATOR TRANSITION TEST ---');

    const zyno = new ZynoAgent();

    // Simulation Context
    const context = {
        // User Profile
        userProfile: {
            persona: 'system_architect',
            mode: 'builder',
            tone: 'investor_pitch'
        },
        trackId: 'depin_track',
        phaseId: 'build', // Just starting build phase
        language: 'en',

        // Journey State
        journeyState: {
            current_xp: 500,
            completed_phases: ['learn'],
            completed_missions: ['define_concept', 'market_analysis'],
            state_variables: {
                concept_name: 'HeliumKiller',
                concept_type: 'DePIN'
            }
        },

        // Last Input triggering the transition
        lastInput: "It is validated. My DePIN concept 'HeliumKiller' is ready. Moving on to architecture."
    };

    console.log(`Input: "${context.lastInput}"`);

    try {
        const response = await zyno.run(context);

        console.log('\n--- RAW OUTPUT START ---');
        console.log(JSON.stringify(response.payload, null, 2));
        console.log('--- RAW OUTPUT END ---\n');

        console.log('--- VERIFICATION ---');

        const uiBlocks = response.payload.ui_blocks || [];

        // Check for Roadmap/Blueprint indicators
        const hasRoadmap = uiBlocks.some(b =>
            (b.kind === 'checklist_block' || b.kind === 'text_block') &&
            (b.title?.toLowerCase().includes('roadmap') || b.content?.toLowerCase().includes('roadmap') || b.description?.toLowerCase().includes('roadmap'))
        );

        const hasArtifacts = JSON.stringify(uiBlocks).toLowerCase().includes('json') &&
            JSON.stringify(uiBlocks).toLowerCase().includes('mermaid');

        if (hasRoadmap) {
            console.log('✅ "Configuration Roadmap" Block Detected.');
        } else {
            console.error('❌ Missing specific Roadmap block.');
        }

        if (hasArtifacts) {
            console.log('✅ Technical Artifacts (JSON/Mermaid) listed in output.');
        } else {
            console.warn('⚠️ Specific artifacts (JSON/Mermaid) might not be explicitly listed. Check output manually.');
        }

    } catch (error) {
        console.error('❌ Execution Failed:', error);
    }
}

testZynoTransition();

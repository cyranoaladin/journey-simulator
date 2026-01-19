/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const AgentFactory = require('../agents/AgentFactory');
const BaseAgent = require('../agents/BaseAgent');

// Mock context helper
const ctx = (trackId, phaseId) => ({ trackId, phaseId });

async function verifyMapping() {
    console.log('Starting Phase Mapping Verification...');
    let passed = 0;
    let failed = 0;

    const testCases = [
        // Cognitive Activation Hub
        { track: 'cognitive-activation-hub', phase: 'cognitive-orientation', expected: 'GuideAgent' },
        { track: 'cognitive-activation-hub', phase: 'solana-fluency', expected: 'EducationAgent' },
        { track: 'cognitive-activation-hub', phase: 'token-design-lab', expected: 'TokenomicsAgent' },
        { track: 'cognitive-activation-hub', phase: 'identity-proofing', expected: 'SecurityAgent' },
        { track: 'cognitive-activation-hub', phase: 'ecosystem-engagement', expected: 'CommunityAgent' },

        // Capital Foundry
        { track: 'capital-foundry', phase: 'capital-discovery', expected: 'ProtocolAgent' },
        { track: 'capital-foundry', phase: 'program-forge', expected: 'BuilderAgent' },
        { track: 'capital-foundry', phase: 'oracle-integration', expected: 'ProtocolAgent' },
        { track: 'capital-foundry', phase: 'risk-command', expected: 'TokenomicsAgent' },
        { track: 'capital-foundry', phase: 'capital-launchpad', expected: 'InvestorAgent' },

        // System Architect
        { track: 'system-architect', phase: 'architecture-scan', expected: 'ProtocolAgent' },
        { track: 'system-architect', phase: 'depin-studio', expected: 'BuilderAgent' },
        { track: 'system-architect', phase: 'onchain-ai', expected: 'DevAgent' },
        { track: 'system-architect', phase: 'systems-hardening', expected: 'SecurityAgent' },
        { track: 'system-architect', phase: 'synaptic-rollout', expected: 'LaunchpadAgent' },

        // Experience Studio
        { track: 'experience-studio', phase: 'experience-discovery', expected: 'DesignAgent' },
        { track: 'experience-studio', phase: 'nft-systems-lab', expected: 'NFTAgent' },
        { track: 'experience-studio', phase: 'gameplay-lab', expected: 'ProductAgent' },
        { track: 'experience-studio', phase: 'ux-elevation', expected: 'DesignAgent' },
        { track: 'experience-studio', phase: 'experience-launch', expected: 'LaunchpadAgent' },

        // Impact Engine
        { track: 'impact-engine', phase: 'impact-charter', expected: 'GuideAgent' },
        { track: 'impact-engine', phase: 'dao-design', expected: 'DAOAgent' },
        { track: 'impact-engine', phase: 'philanthropy-protocols', expected: 'ProtocolAgent' },
        { track: 'impact-engine', phase: 'identity-reputation', expected: 'CommunityAgent' },
        { track: 'impact-engine', phase: 'synaptic-impact', expected: 'GovernanceAgent' },

        // Resilience Master
        { track: 'resilience-master', phase: 'security-baseline', expected: 'EducationAgent' },
        { track: 'resilience-master', phase: 'exploit-hunt', expected: 'AuditAgent' },
        { track: 'resilience-master', phase: 'defense-systems', expected: 'SecurityAgent' },
        { track: 'resilience-master', phase: 'incident-response', expected: 'SecurityAgent' },
        { track: 'resilience-master', phase: 'redblue-evolution', expected: 'CoachAgent' },
    ];

    for (const test of testCases) {
        try {
            const agent = AgentFactory.getAgentForContext(ctx(test.track, test.phase));
            if (agent.name === test.expected) {
                console.log(`✅ ${test.track} -> ${test.phase}: Got ${agent.name}`);
                passed++;
            } else {
                console.error(`❌ ${test.track} -> ${test.phase}: Expected ${test.expected}, Got ${agent.name}`);
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${test.track} -> ${test.phase}: Error - ${error.message}`);
            failed++;
        }
    }

    console.log(`\nVerification Complete: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

verifyMapping();

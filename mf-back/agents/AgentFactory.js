const TokenomicsAgent = require('./TokenomicsAgent');
const GrowthAgent = require('./GrowthAgent');
const SecurityAgent = require('./SecurityAgent');
const GovernanceAgent = require('./GovernanceAgent');
const DesignAgent = require('./DesignAgent');
const ProtocolAgent = require('./ProtocolAgent');
const EducationAgent = require('./EducationAgent');
const ZynoAgent = require('./ZynoAgent');

class AgentFactory {
    static getAgentForContext(context) {
        const { trackId, phaseId, missionId } = context;

        // 1. Specific Mission Overrides (if any mission requires a specific agent regardless of track)
        if (missionId && missionId.includes('security')) return new SecurityAgent();
        if (missionId && missionId.includes('governance')) return new GovernanceAgent();

        // 2. Track-based Default Agents
        switch (trackId) {
            case 'cognitive-activation-hub':
                return new EducationAgent();

            case 'capital-foundry':
                // Sub-routing based on phase for Capital Foundry
                if (phaseId === 'token-design-lab') return new TokenomicsAgent();
                if (phaseId === 'risk-command') return new TokenomicsAgent();
                return new ProtocolAgent(); // Default for Capital Foundry (DeFi protocols)

            case 'system-architect':
                return new ProtocolAgent();

            case 'experience-studio':
                return new DesignAgent();

            case 'impact-engine':
                return new GovernanceAgent();

            case 'resilience-master':
                return new SecurityAgent();

            default:
                // Fallback to Zyno or a generic agent if track is unknown
                console.warn(`Unknown trackId: ${trackId}, defaulting to ZynoAgent.`);
                return new ZynoAgent();
        }
    }

    static getOrchestrator() {
        return new ZynoAgent();
    }
}

module.exports = AgentFactory;

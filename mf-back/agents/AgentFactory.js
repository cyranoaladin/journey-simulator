const TokenomicsAgent = require('./TokenomicsAgent');
const GrowthAgent = require('./GrowthAgent');
const SecurityAgent = require('./SecurityAgent');
const GovernanceAgent = require('./GovernanceAgent');
const DesignAgent = require('./DesignAgent');
const ProtocolAgent = require('./ProtocolAgent');
const EducationAgent = require('./EducationAgent');
const ZynoAgent = require('./ZynoAgent');
const GuideAgent = require('./GuideAgent');
const OnboardingAgent = require('./OnboardingAgent');
const BuilderAgent = require('./BuilderAgent');
const DevAgent = require('./DevAgent');
const ProductAgent = require('./ProductAgent');
const NFTAgent = require('./NFTAgent');
const TokenAgent = require('./TokenAgent');
const DAOAgent = require('./DAOAgent');
const CommunityAgent = require('./CommunityAgent');
const PitchAgent = require('./PitchAgent');
const InvestorAgent = require('./InvestorAgent');
const Web3LegalAgent = require('./Web3LegalAgent');
const AuditAgent = require('./AuditAgent');
const CoachAgent = require('./CoachAgent');
const ReflectionAgent = require('./ReflectionAgent');
const LaunchpadAgent = require('./LaunchpadAgent');

class AgentFactory {
    static getAgentForContext(context) {
        const { trackId, phaseId, missionId } = context;

        // 1. Specific Phase/Mission Overrides (High Priority)

        // Guide & Onboarding
        if (phaseId === 'guide' || phaseId === 'orientation' || (missionId && missionId.includes('welcome'))) return new GuideAgent();
        if (phaseId === 'onboarding' || phaseId === 'setup' || (missionId && missionId.includes('wallet'))) return new OnboardingAgent();

        // Legal & Compliance
        if (phaseId === 'legal' || phaseId === 'compliance' || (missionId && missionId.includes('legal'))) return new Web3LegalAgent();
        if (missionId && missionId.includes('audit')) return new AuditAgent();

        // Pitch & Investment
        if (phaseId === 'pitch' || phaseId === 'investor_pitch' || (missionId && missionId.includes('pitch'))) return new PitchAgent();
        if (phaseId === 'investor' || phaseId === 'fundraising' || (missionId && missionId.includes('investor'))) return new InvestorAgent();
        if (phaseId === 'launchpad' || phaseId === 'demo_day') return new LaunchpadAgent();

        // Reflection & Coaching
        if (phaseId === 'reflection' || phaseId === 'post_mortem' || (missionId && missionId.includes('retrospective'))) return new ReflectionAgent();
        if (phaseId === 'coach' || (missionId && missionId.includes('feedback'))) return new CoachAgent();

        // Specific Domains
        if (missionId && missionId.includes('security')) return new SecurityAgent();
        if (missionId && missionId.includes('governance')) return new GovernanceAgent();
        if (missionId && missionId.includes('community') || phaseId === 'community') return new CommunityAgent();
        if (missionId && missionId.includes('growth') || phaseId === 'growth') return new GrowthAgent();
        if (missionId && missionId.includes('product') || phaseId === 'product') return new ProductAgent();


        // 2. Track-based Default Agents & Phase Mapping
        switch (trackId) {
            case 'cognitive-activation-hub':
                if (phaseId === 'cognitive-orientation') return new GuideAgent();
                if (phaseId === 'solana-fluency') return new EducationAgent();
                if (phaseId === 'token-design-lab') return new TokenomicsAgent();
                if (phaseId === 'identity-proofing') return new SecurityAgent();
                if (phaseId === 'ecosystem-engagement') return new CommunityAgent();
                return new EducationAgent();

            case 'capital-foundry':
                if (phaseId === 'capital-discovery') return new ProtocolAgent();
                if (phaseId === 'program-forge') return new BuilderAgent();
                if (phaseId === 'oracle-integration') return new ProtocolAgent();
                if (phaseId === 'risk-command') return new TokenomicsAgent(); // Or RiskAgent
                if (phaseId === 'capital-launchpad') return new InvestorAgent();
                return new ProtocolAgent();

            case 'system-architect':
                if (phaseId === 'architecture-scan') return new ProtocolAgent();
                if (phaseId === 'depin-studio') return new BuilderAgent();
                if (phaseId === 'onchain-ai') return new DevAgent();
                if (phaseId === 'systems-hardening') return new SecurityAgent();
                if (phaseId === 'synaptic-rollout') return new LaunchpadAgent();
                return new ProtocolAgent();

            case 'experience-studio':
                if (phaseId === 'experience-discovery') return new DesignAgent();
                if (phaseId === 'nft-systems-lab') return new NFTAgent();
                if (phaseId === 'gameplay-lab') return new ProductAgent();
                if (phaseId === 'ux-elevation') return new DesignAgent();
                if (phaseId === 'experience-launch') return new LaunchpadAgent();
                return new DesignAgent();

            case 'impact-engine':
                if (phaseId === 'impact-charter') return new GuideAgent();
                if (phaseId === 'dao-design') return new DAOAgent();
                if (phaseId === 'philanthropy-protocols') return new ProtocolAgent();
                if (phaseId === 'identity-reputation') return new CommunityAgent();
                if (phaseId === 'synaptic-impact') return new GovernanceAgent();
                return new GovernanceAgent();

            case 'resilience-master':
                if (phaseId === 'security-baseline') return new EducationAgent();
                if (phaseId === 'exploit-hunt') return new AuditAgent();
                if (phaseId === 'defense-systems') return new SecurityAgent();
                if (phaseId === 'incident-response') return new SecurityAgent();
                if (phaseId === 'redblue-evolution') return new CoachAgent();
                return new SecurityAgent();

            default:
                // Fallback based on phase keywords if track is generic or unknown
                if (phaseId && phaseId.includes('dev')) return new DevAgent();
                if (phaseId && phaseId.includes('token')) return new TokenAgent();
                if (phaseId && phaseId.includes('guide')) return new GuideAgent();
                if (phaseId && phaseId.includes('onboarding')) return new OnboardingAgent();
                if (phaseId && phaseId.includes('pitch')) return new PitchAgent();
                if (phaseId && phaseId.includes('legal')) return new Web3LegalAgent();
                if (phaseId && phaseId.includes('reflection')) return new ReflectionAgent();

                // Final Fallback
                console.warn(`Unknown trackId: ${trackId} or phaseId: ${phaseId}, defaulting to ZynoAgent.`);
                return new ZynoAgent();
        }
    }

    static getOrchestrator() {
        return new ZynoAgent();
    }
}

module.exports = AgentFactory;

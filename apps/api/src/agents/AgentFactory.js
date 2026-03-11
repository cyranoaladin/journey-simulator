/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

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

// Registry: Phase/Mission mappings to agents (high priority)
const PHASE_MISSION_MAPPINGS = {
  phases: {
    guide: GuideAgent,
    orientation: GuideAgent,
    onboarding: OnboardingAgent,
    setup: OnboardingAgent,
    legal: Web3LegalAgent,
    compliance: Web3LegalAgent,
    pitch: PitchAgent,
    investor_pitch: PitchAgent,
    investor: InvestorAgent,
    fundraising: InvestorAgent,
    launchpad: LaunchpadAgent,
    demo_day: LaunchpadAgent,
    reflection: ReflectionAgent,
    post_mortem: ReflectionAgent,
    coach: CoachAgent,
    community: CommunityAgent,
    growth: GrowthAgent,
    product: ProductAgent,
  },
  missionKeywords: {
    welcome: GuideAgent,
    wallet: OnboardingAgent,
    legal: Web3LegalAgent,
    audit: AuditAgent,
    pitch: PitchAgent,
    investor: InvestorAgent,
    retrospective: ReflectionAgent,
    feedback: CoachAgent,
    security: SecurityAgent,
    governance: GovernanceAgent,
    community: CommunityAgent,
    growth: GrowthAgent,
    product: ProductAgent,
  },
};

// Registry: Track and phase combinations
const TRACK_PHASE_MAPPINGS = {
  'cognitive-activation-hub': {
    'cognitive-orientation': GuideAgent,
    'solana-fluency': EducationAgent,
    'token-design-lab': TokenomicsAgent,
    'identity-proofing': SecurityAgent,
    'ecosystem-engagement': CommunityAgent,
    default: EducationAgent,
  },
  'capital-foundry': {
    'capital-discovery': ProtocolAgent,
    'program-forge': BuilderAgent,
    'oracle-integration': ProtocolAgent,
    'risk-command': TokenomicsAgent,
    'capital-launchpad': InvestorAgent,
    default: ProtocolAgent,
  },
  'system-architect': {
    'architecture-scan': ProtocolAgent,
    'depin-studio': BuilderAgent,
    'onchain-ai': DevAgent,
    'systems-hardening': SecurityAgent,
    'synaptic-rollout': LaunchpadAgent,
    default: ProtocolAgent,
  },
  'experience-studio': {
    'experience-discovery': DesignAgent,
    'nft-systems-lab': NFTAgent,
    'gameplay-lab': ProductAgent,
    'ux-elevation': DesignAgent,
    'experience-launch': LaunchpadAgent,
    default: DesignAgent,
  },
  'impact-engine': {
    'impact-charter': GuideAgent,
    'dao-design': DAOAgent,
    'philanthropy-protocols': ProtocolAgent,
    'identity-reputation': CommunityAgent,
    'synaptic-impact': GovernanceAgent,
    default: GovernanceAgent,
  },
  'resilience-master': {
    'security-baseline': EducationAgent,
    'exploit-hunt': AuditAgent,
    'defense-systems': SecurityAgent,
    'incident-response': SecurityAgent,
    'redblue-evolution': CoachAgent,
    default: SecurityAgent,
  },
};

// Fallback: Phase keyword matching
const PHASE_KEYWORD_MAPPINGS = {
  dev: DevAgent,
  token: TokenAgent,
  guide: GuideAgent,
  onboarding: OnboardingAgent,
  pitch: PitchAgent,
  legal: Web3LegalAgent,
  reflection: ReflectionAgent,
};

// Helper: Check if missionId contains a keyword
const missionContainsKeyword = (missionId, keyword) => {
  return missionId && typeof missionId === 'string' && missionId.includes(keyword);
};

// Helper: Match phase/mission to agent (high priority)
const matchPhaseMission = (phaseId, missionId) => {
  // Check phase mappings
  if (phaseId && PHASE_MISSION_MAPPINGS.phases[phaseId]) {
    return PHASE_MISSION_MAPPINGS.phases[phaseId];
  }

  // Check mission keyword mappings
  if (missionId) {
    for (const [keyword, AgentClass] of Object.entries(PHASE_MISSION_MAPPINGS.missionKeywords)) {
      if (missionContainsKeyword(missionId, keyword)) {
        return AgentClass;
      }
    }
  }

  return null;
};

// Helper: Match track and phase combination
const matchTrackPhase = (trackId, phaseId) => {
  const trackMapping = TRACK_PHASE_MAPPINGS[trackId];
  if (!trackMapping) {
    return null;
  }

  if (phaseId && trackMapping[phaseId]) {
    return trackMapping[phaseId];
  }

  return trackMapping.default || null;
};

// Helper: Match phase keywords (fallback)
const matchPhaseKeywords = (phaseId) => {
  if (!phaseId) {
    return null;
  }

  for (const [keyword, AgentClass] of Object.entries(PHASE_KEYWORD_MAPPINGS)) {
    if (phaseId.includes(keyword)) {
      return AgentClass;
    }
  }

  return null;
};

class AgentFactory {
  static getAgentForContext(context) {
    const { trackId, phaseId, missionId } = context;

    // 1. High priority: Phase/Mission specific mappings
    const phaseMissionMatch = matchPhaseMission(phaseId, missionId);
    if (phaseMissionMatch) {
      return new phaseMissionMatch();
    }

    // 2. Track-based mappings with phase
    const trackPhaseMatch = matchTrackPhase(trackId, phaseId);
    if (trackPhaseMatch) {
      return new trackPhaseMatch();
    }

    // 3. Fallback: Phase keyword matching
    const phaseKeywordMatch = matchPhaseKeywords(phaseId);
    if (phaseKeywordMatch) {
      return new phaseKeywordMatch();
    }

    // 4. Final fallback
    console.warn(`Unknown trackId: ${trackId} or phaseId: ${phaseId}, defaulting to ZynoAgent.`);
    return new ZynoAgent();
  }

  static getOrchestrator() {
    return new ZynoAgent();
  }
}

module.exports = AgentFactory;

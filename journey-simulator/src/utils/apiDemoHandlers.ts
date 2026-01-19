/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Demo mode request handlers - extracted from api.ts to reduce cognitive complexity
 */

interface DemoPersonaState {
  xp: number;
  tokens: number;
  completedPhases: number[];
  nfts: string[];
}

interface DemoDatabase {
  version: number;
  personas: Record<string, DemoPersonaState>;
}

const DEMO_DB_VERSION = 2;
const DEMO_DB_KEY = 'demo_mock_db';
const DEMO_DB_SEED_KEY = 'demo_mock_db_seed';
const DEMO_ACTIVE_PERSONA_KEY = 'demo_active_persona';

export const getActiveDemoPersonaId = (): string => {
  try {
    return localStorage.getItem(DEMO_ACTIVE_PERSONA_KEY) || 'cognitive-activation-hub';
  } catch {
    return 'cognitive-activation-hub';
  }
};

export const normalizeLegacyDemoState = (candidate?: Partial<DemoPersonaState>): DemoPersonaState => {
  const candidateCompleted = candidate?.completedPhases;
  const candidateNfts = candidate?.nfts;
  return {
    xp: typeof candidate?.xp === 'number' ? candidate.xp : 0,
    tokens: typeof candidate?.tokens === 'number' ? candidate.tokens : 0,
    completedPhases: Array.isArray(candidateCompleted) ? candidateCompleted : [],
    nfts: Array.isArray(candidateNfts) ? candidateNfts : [],
  };
};

export const readDemoDatabase = (personaId: string): DemoDatabase => {
  try {
    let raw = localStorage.getItem(DEMO_DB_KEY);
    if (!raw) {
      const seed = localStorage.getItem(DEMO_DB_SEED_KEY);
      if (seed) {
        localStorage.setItem(DEMO_DB_KEY, seed);
        raw = seed;
      }
    }

    if (raw) {
      const parsed: any = JSON.parse(raw);
      if (parsed?.version === DEMO_DB_VERSION && parsed.personas) {
        return parsed as DemoDatabase;
      }

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
          version: DEMO_DB_VERSION,
          personas: {
            [personaId]: normalizeLegacyDemoState(parsed as Partial<DemoPersonaState>)
          }
        };
      }
    }
  } catch (error) {
    console.warn('[Demo Mode] Failed to parse demo datastore:', error);
  }

  return { version: DEMO_DB_VERSION, personas: {} };
};

export const persistDemoDatabase = (db: DemoDatabase): void => {
  try {
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.warn('[Demo Mode] Failed to persist demo datastore:', error);
  }
};

export class DemoStateManager {
  private demoPersonaId: string;
  private demoDatabase: DemoDatabase;

  constructor() {
    this.demoPersonaId = getActiveDemoPersonaId();
    this.demoDatabase = readDemoDatabase(this.demoPersonaId);
    if (!this.demoDatabase.personas[this.demoPersonaId]) {
      this.demoDatabase.personas[this.demoPersonaId] = normalizeLegacyDemoState();
      persistDemoDatabase(this.demoDatabase);
    }
  }

  getState(): DemoPersonaState {
    return this.demoDatabase.personas[this.demoPersonaId];
  }

  setState(state: DemoPersonaState): void {
    this.demoDatabase.personas[this.demoPersonaId] = state;
    persistDemoDatabase(this.demoDatabase);
  }

  updateState(updates: Partial<DemoPersonaState>): DemoPersonaState {
    const current = this.getState();
    const next: DemoPersonaState = {
      ...current,
      ...updates,
      completedPhases: updates.completedPhases ?? current.completedPhases,
      nfts: updates.nfts ?? current.nfts,
    };
    this.setState(next);
    return next;
  }

  getPersonaId(): string {
    return this.demoPersonaId;
  }
}

// Demo request handlers - each handles a specific path pattern
export const handleDemoUserProfile = <T>(personaId: string): T => {
  return {
    success: true,
    user: {
      id: "demo-user-id",
      name: "Demo User",
      email: "demo@moneyfactory.ai",
      role: "user",
      wallet_address: "DemoWalletAddress123",
      persona: personaId as any
    }
  } as unknown as T;
};

export const handleDemoUserRefresh = <T>(): T => {
  return {
    success: true,
    accessToken: "demo-token",
    refreshToken: "demo-refresh-token"
  } as unknown as T;
};

export const handleDemoResetProgress = <T>(): T => {
  localStorage.removeItem('demo_mock_db');
  return { success: true } as unknown as T;
};

export const handleDemoUserProgress = <T>(
  method: string | undefined,
  body: string | undefined,
  stateManager: DemoStateManager
): T | null => {
  if (method === 'GET') {
    const state = stateManager.getState();
    return {
      success: true,
      progress: {
        total_xp: state.xp,
        token_transactions: {
          mfai_tokens: state.tokens
        },
        completed_phases: state.completedPhases.length,
        persona: stateManager.getPersonaId(),
        nft_certificates: state.nfts.map((t: string) => ({ title: t })),
        subscription: 'gold'
      }
    } as unknown as T;
  }
  if (method === 'PUT' && body) {
    const parsedBody = JSON.parse(body);
    stateManager.updateState({
      xp: parsedBody.total_xp,
    });
    return { success: true } as unknown as T;
  }
  return null;
};

export const handleDemoUserTokens = <T>(
  method: string | undefined,
  body: string | undefined,
  stateManager: DemoStateManager
): T | null => {
  if (method === 'PUT' && body) {
    const parsedBody = JSON.parse(body);
    stateManager.updateState({ tokens: parsedBody.mfai_tokens });
    return { success: true } as unknown as T;
  }
  return null;
};

export const handleDemoCompletePhase = <T>(
  body: string | undefined,
  stateManager: DemoStateManager
): T => {
  if (!body) return { success: true } as unknown as T;
  
  const parsedBody = JSON.parse(body);
  const state = stateManager.getState();
  const phaseIndex = parsedBody.phase_number - 1;

  if (!state.completedPhases.includes(phaseIndex)) {
    let xpReward = parsedBody.xp_reward || 0;
    let tokenReward = parsedBody.mfai_reward || 0;
    let nftReward = parsedBody.nft_reward || null;

    if (!parsedBody.xp_reward && !parsedBody.mfai_reward) {
      if (phaseIndex === 0) {
        xpReward = 60;
        tokenReward = 6;
        nftReward = "Proof-of-Skill: Activation";
      } else if (phaseIndex === 1) {
        xpReward = 80;
        tokenReward = 8;
        nftReward = "Solana Fluency Patch";
      } else if (phaseIndex === 2) {
        xpReward = 90;
        tokenReward = 9;
        nftReward = "Tokenomics Architect Badge";
      } else {
        xpReward = 50;
        tokenReward = 5;
      }
    }

    const updates: any = {
      completedPhases: [...state.completedPhases, phaseIndex],
      xp: state.xp + xpReward,
      tokens: state.tokens + tokenReward
    };

    if (nftReward) {
      updates.nfts = [...state.nfts, nftReward];
    }

    stateManager.updateState(updates);
  }
  return { success: true } as unknown as T;
};

export const handleDemoNFTCertificates = <T>(
  body: string | undefined,
  stateManager: DemoStateManager
): T => {
  if (!body) return { success: true } as unknown as T;
  
  const parsedBody = JSON.parse(body);
  const state = stateManager.getState();
  const title = parsedBody.title || `Phase ${parsedBody.phase} NFT`;
  stateManager.updateState({ nfts: [...state.nfts, title] });
  return { success: true } as unknown as T;
};

export const handleDemoStep = async <T>(
  body: string | undefined,
  stateManager: DemoStateManager
): Promise<T> => {
  if (!body) {
    return { ui_blocks: [] } as unknown as T;
  }

  const parsedBody = JSON.parse(body);
  const phaseId = parsedBody.phaseId || 'unknown';
  const state = stateManager.getState();
  const phaseIndex = state.completedPhases.length;

  let blocks: any[] = [];

  if (phaseIndex === 0 || phaseId.includes('activation')) {
    blocks = [
      {
        id: "b1",
        kind: "text_block",
        title: "Phase 1: Activation",
        body_markdown: "## Welcome to Money Factory AI\n\nYour journey begins here. In this phase, you will activate your cognitive hub and prove your readiness.\n\n### Objectives\n- Connect your wallet\n- Understand the ecosystem\n- Mint your first Proof-of-Skill"
      },
      {
        id: "b2",
        kind: "mission_block",
        title: "Activation Mission",
        description: "Submit a brief statement about your goals for this journey.",
        expected_input_type: "text",
        xp_reward: 100,
        nft_reward_id: "Proof-of-Skill: Activation"
      }
    ];
  } else if (phaseIndex === 1 || phaseId.includes('staking')) {
    blocks = [
      {
        id: "b1",
        kind: "text_block",
        title: "Phase 2: Staking & Investment",
        body_markdown: "## Capital Foundry\n\nTo participate in the ecosystem, you must stake your $MFAI tokens. This demonstrates your commitment and unlocks governance rights."
      },
      {
        id: "b2",
        kind: "indicator_block",
        title: "Your Wallet",
        value: `${state.tokens} $MFAI`,
        trend: "+50",
        trend_direction: "up"
      },
      {
        id: "b3",
        kind: "action_suggestions_block",
        title: "Staking Actions",
        suggestions: [
          { action_id: "stake_50", label: "Stake 50 $MFAI" },
          { action_id: "stake_max", label: "Stake Max" }
        ]
      }
    ];
  } else if (phaseIndex === 2 || phaseId.includes('governance')) {
    blocks = [
      {
        id: "b1",
        kind: "text_block",
        title: "Phase 3: Governance",
        body_markdown: "## DAO Participation\n\nAs a stakeholder, you have the right to vote on ecosystem proposals. Your voting power is determined by your staked tokens and reputation."
      },
      {
        id: "b2",
        kind: "dao_dashboard_block",
        title: "Active Proposals",
        votingPower: 150,
        proposals: [
          { id: "p1", title: "CIP-12: Increase Staking Rewards", status: "active", votes: { yes: 65, no: 12 }, deadline: "24h" },
          { id: "p2", title: "CIP-13: New Persona Integration", status: "active", votes: { yes: 40, no: 5 }, deadline: "48h" }
        ]
      }
    ];
  } else {
    blocks = [
      {
        id: "b1",
        kind: "text_block",
        title: `Phase ${phaseIndex + 1}: Expansion`,
        body_markdown: "## Ecosystem Expansion\n\nSelect a project to fund or contribute to. Your choices will shape the future of the Money Factory ecosystem."
      },
      {
        id: "b2",
        kind: "project_selection_block",
        title: "Available Projects",
        projects: [
          { id: "proj1", name: "DeFi Aggregator", description: "A unified interface for all DeFi protocols.", currentFunding: 50000, fundingGoal: 100000, tags: ["DeFi", "Infrastructure"] },
          { id: "proj2", name: "NFT Marketplace", description: "Next-gen marketplace for dynamic NFTs.", currentFunding: 25000, fundingGoal: 50000, tags: ["NFT", "Consumer"] }
        ]
      }
    ];
  }

  return {
    ui_blocks: blocks
  } as unknown as T;
};

export const handleDemoAgentLogs = <T>(): T => {
  return {
    logs: [
      { id: '1', timestamp: new Date().toISOString(), agentId: 'zyno', message: 'System initialized', level: 'info' },
      { id: '2', timestamp: new Date().toISOString(), agentId: 'zyno', message: 'Monitoring active', level: 'info' }
    ]
  } as unknown as T;
};

export const handleDemoDAOConfig = <T>(): T => {
  return {
    quorumPercent: 66,
    totalVotingPower: 10000,
    voters: [
      { id: 'v1', name: 'Alice', weight: 100 },
      { id: 'v2', name: 'Bob', weight: 50 }
    ]
  } as unknown as T;
};

export const handleDemoDAOProposals = <T>(): T => {
  return {
    proposals: [
      {
        id: 'p1',
        title: 'Demo Proposal 1',
        description: 'This is a demo proposal',
        status: 'active',
        votes: { yes: 10, no: 2 },
        quorumMet: false,
        voterDetails: {}
      }
    ]
  } as unknown as T;
};

export const handleDemoOrchestration = <T>(): T => {
  return {
    status: 'active',
    activeAgents: ['analyst', 'trader', 'governance'],
    queuedTasks: 0
  } as unknown as T;
};

export const handleDemoCollaterizeSimulate = <T>(
  stateManager: DemoStateManager
): T => {
  const state = stateManager.getState();
  const baseScore = 60 + (state.xp / 100);
  const riskScore = Math.max(0.05, Math.min(0.95, 0.3 - (state.xp / 2000)));
  const communityScore = 60 + Math.min(40, state.xp / 200);
  const adjustedScore = Math.min(100, Math.max(0, baseScore + (Math.random() * 20 - 10)));

  let tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED';
  if (adjustedScore >= 80) {
    tier = 'CORE';
  } else if (adjustedScore >= 60) {
    tier = 'EXPERIMENTAL';
  } else {
    tier = 'REJECTED';
  }

  const noteMessage = tier === 'REJECTED'
    ? "Consider improving documentation and community presence before simulation"
    : tier === 'EXPERIMENTAL'
      ? "Your project shows promise but needs refinement in key areas"
      : "Strong fundamentals positioned for Core track success";

  return {
    ok: true,
    simulation: {
      accepted: tier !== 'REJECTED',
      eligibilityScore: Math.round(adjustedScore),
      tier,
      targetRaiseUSD: 1000000 + state.xp * 5,
      softCapUSD: 300000 + state.xp * 2,
      hardCapUSD: 2000000 + state.xp * 8,
      liquidityUSD: 400000 + state.xp * 3,
      initialPriceUSD: 0.05 + (state.xp / 10000),
      communityScore: Math.round(communityScore),
      riskScore: parseFloat(riskScore.toFixed(2)),
      notes: [
        `Your journey score (${Math.round(state.xp)} XP) contributes ${Math.round(baseScore)} to your eligibility score`,
        "Tokenomics model shows sustainable growth potential",
        "Community engagement metrics are positive" + (state.xp > 500 ? " and continue to improve" : ""),
        noteMessage
      ],
      simulatedLaunchUrl: 'https://launchpad.collaterize.com/'
    }
  } as unknown as T;
};

export const handleDemoArtifacts = async <T>(
  stateManager: DemoStateManager
): Promise<T> => {
  const state = stateManager.getState();
  const currentPhase = state.completedPhases ? state.completedPhases.length : 0;
  const staticArtifacts = await import('../data/artifacts.json');
  const artifacts = staticArtifacts.default.map((artifact: any) => ({
    ...artifact,
    status: 'unlocked'
  }));

  return {
    success: true,
    artifacts,
    currentPhase
  } as unknown as T;
};

// Main demo handler router - reduces cognitive complexity by delegating to specific handlers
export const handleDemoRequest = async <T>(
  path: string,
  options: RequestInit,
  stateManager: DemoStateManager
): Promise<T | null> => {
  const personaId = stateManager.getPersonaId();

  // User endpoints
  if (path === '/user/profile' || path === '/user/verify') {
    return handleDemoUserProfile<T>(personaId);
  }
  if (path === '/user/refresh') {
    return handleDemoUserRefresh<T>();
  }

  // Journey endpoints
  if (path === '/journey/reset-progress') {
    return handleDemoResetProgress<T>();
  }
  if (path === '/journey/user-progress') {
    return handleDemoUserProgress<T>(options.method, options.body as string | undefined, stateManager);
  }
  if (path === '/journey/complete-phase') {
    return handleDemoCompletePhase<T>(options.body as string | undefined, stateManager);
  }
  if (path === '/journey/artifacts') {
    return handleDemoArtifacts<T>(stateManager);
  }

  // User tokens
  if (path === '/user/tokens') {
    return handleDemoUserTokens<T>(options.method, options.body as string | undefined, stateManager);
  }
  if (path === '/user/nft-certificates') {
    return handleDemoNFTCertificates<T>(options.body as string | undefined, stateManager);
  }

  // Step endpoint
  if (path.includes('/step')) {
    return handleDemoStep<T>(options.body as string | undefined, stateManager);
  }

  // Agent logs
  if (path.includes('/admin/agent-logs') || path.includes('/api/agents/logs') || path.includes('/agents/logs')) {
    return handleDemoAgentLogs<T>();
  }

  // DAO endpoints
  if (path.includes('/dao/config')) {
    return handleDemoDAOConfig<T>();
  }
  if (path.includes('/dao/proposals')) {
    return handleDemoDAOProposals<T>();
  }

  // Orchestration
  if (path.includes('/orchestration')) {
    return handleDemoOrchestration<T>();
  }

  // Collaterize simulation
  if (path.includes('/phases/launch-collaterize/simulate')) {
    return handleDemoCollaterizeSimulate<T>(stateManager);
  }

  // Default success for other endpoints
  return { success: true } as unknown as T;
};

// API base URL - configurable via environment variable for different deployments.
// IMPORTANT: this is the ORIGIN/root (no trailing "/api"), because this frontend calls both:
// - /journey/*  (mf-back)
// - /user/*, /dao/*, /api/* (mf-back aliases)
import { logger } from './logger';
import { tokenStore } from './tokenStore';

function normalizeApiBaseUrl(input: string): string {
  // Strip trailing slashes
  let url = input.replace(/\/+$/, '')
  // If someone set ".../api" by habit, strip it to avoid "/api/journey" mismatches.
  url = url.replace(/\/api$/i, '')
  return url
}

function isLocalUiHost(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1'
}

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL
  const normalizedConfigured = configured ? normalizeApiBaseUrl(configured) : null

  // If UI runs locally, always prefer local mf-back unless the user explicitly configured a local URL.
  if (isLocalUiHost()) {
    if (normalizedConfigured && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedConfigured)) {
      return normalizedConfigured
    }
    return 'http://127.0.0.1:3002'
  }

  // Non-local UI: use configured URL or hosted default.
  return normalizedConfigured || 'https://journey.mfai.app'
}

export const API_BASE_URL = resolveApiBaseUrl()

// Storage hardening: migrate legacy accessToken from localStorage -> sessionStorage (once per load)
tokenStore.migrateLegacyAccessToken();

export const SOLANA_API_BASE_URL =
  import.meta.env.VITE_SOLANA_API_BASE_URL || 'http://127.0.0.1:3001';

// API response interfaces
export interface AgentScoreboardEntry {
  userId: string;
  aepo: number;
  aeco: number;
  historyCount: number;
  updatedAt: string | null;
  profile: Record<string, unknown>;
}

export interface AgentScoreboardResponse {
  users: AgentScoreboardEntry[];
}

export interface RagDocument {
  name: string;
  path: string;
}

export interface RagDocumentsResponse {
  documents: RagDocument[];
}

export interface RagUploadResponse {
  status: string;
  details?: Record<string, unknown>;
}

export interface MissionExportPayload {
  title?: string;
  userId: string;
  timestamp: string;
  aepo?: number;
  aecoPhase?: string;
  agents?: string[];
  generatedText?: string;
  actions?: string[];
}

export interface DaoVoter {
  id: string;
  weight: number;
  name?: string;
}

export interface DaoConfigResponse {
  quorumPercent: number;
  totalVotingPower: number;
  voters: DaoVoter[];
}

export interface DaoVoteBreakdown {
  yes: number;
  no: number;
}

export interface DaoProposal {
  id: string;
  title: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  closedAt?: string;
  status: 'active' | 'closed';
  votes: DaoVoteBreakdown;
  voterDetails: Record<string, { support: 'yes' | 'no'; weight: number }>;
  quorumMet?: boolean;
  outcome?: string;
}

export interface DaoProposalsResponse {
  proposals: DaoProposal[];
}

export interface DaoProposalResponse {
  proposal: DaoProposal;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    wallet_address: string;
    persona?: 'student' | 'entrepreneur' | 'developer' | 'creator' | 'cognitive-activation-hub';
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
    subscription?: 'gold' | 'platinum' | 'diamond' | false;
    is_active?: boolean;
  };
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    wallet_address: string;
    persona?: 'student' | 'entrepreneur' | 'developer' | 'creator' | 'cognitive-activation-hub';
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
    subscription?: 'gold' | 'platinum' | 'diamond' | false;
    is_active?: boolean;
  };
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = tokenStore.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

type PersistedJourneyState = {
  userProgress?: {
    totalXP?: number;
    completedPhases?: number[];
  };
  selectedPersona?: {
    id?: string;
  } | null;
};

const readPersistedJourneyState = (): PersistedJourneyState | null => {
  try {
    const raw = localStorage.getItem('mfai-journey-storage');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed?.state ?? parsed;
  } catch (error) {
    console.warn('[API] Failed to parse offline journey state:', error);
    return null;
  }
};

const getLocalProgressSnapshot = () => {
  const persisted = readPersistedJourneyState();
  const completedPhases = Array.isArray(persisted?.userProgress?.completedPhases)
    ? persisted?.userProgress?.completedPhases
    : [];
  const totalXP = typeof persisted?.userProgress?.totalXP === 'number'
    ? persisted.userProgress.totalXP
    : 0;

  return {
    completedPhases,
    totalXP,
    currentPhase: completedPhases.length,
    personaId: persisted?.selectedPersona?.id ?? 'offline-persona',
  };
};

const buildOfflineAgentLogs = (currentPhase: number, totalXP: number) => {
  const timestamp = new Date().toISOString();
  return [
    {
      userId: 'offline-user',
      agentName: 'Zyno Orchestrator',
      ae_summary: 'Offline fallback: synthesizing evaluation locally.',
      ae_outcome: 'success',
      payload: {
        phaseEvaluated: currentPhase,
        totalXP,
        source: 'offline-fallback',
      },
      timestamp,
    },
    {
      userId: 'offline-user',
      agentName: 'Proof Agent',
      ae_summary: 'Generated synthetic Proof-of-Skill™ insights.',
      ae_outcome: 'success',
      payload: {
        artifactsUnlocked: currentPhase,
        xpSignal: totalXP,
      },
      timestamp,
    },
  ];
};

const handleOfflineFallback = async <T>(path: string, error: unknown): Promise<T | undefined> => {
  const normalizedPath = path.split('?')[0];
  const { currentPhase, totalXP } = getLocalProgressSnapshot();
  console.warn(`[API] Offline fallback engaged for ${path}`, error);

  try {
    if (normalizedPath === '/journey/artifacts') {
      const artifactsModule = await import('../data/artifacts.json');
      const artifacts = artifactsModule.default.map((artifact: any) => ({
        ...artifact,
        status: artifact.unlockPhase <= currentPhase ? 'unlocked' : 'locked',
      }));

      return {
        success: true,
        artifacts,
        currentPhase,
      } as unknown as T;
    }

    if (normalizedPath.includes('/api/agents/logs') || normalizedPath.includes('/admin/agent-logs')) {
      return buildOfflineAgentLogs(currentPhase, totalXP) as unknown as T;
    }

    if (normalizedPath === '/solana/mint/simulate') {
      const riskScore = parseFloat(Math.max(0.02, 0.35 - totalXP / 5000).toFixed(2));
      const confidence = parseFloat(Math.min(0.98, 0.6 + totalXP / 2000).toFixed(2));

      return {
        ok: true,
        sim: {
          ok: true,
          estFeeLamports: 4000 + Math.round(totalXP / 2),
          riskScore,
          confidence,
          network: 'devnet',
        },
      } as unknown as T;
    }

    if (normalizedPath === '/solana/mint/execute') {
      const idSuffix = Date.now();
      return {
        ok: true,
        jobId: `offline-mint-${idSuffix}`,
        status: 'completed',
        tx: {
          mintAddress: `OfflineMint${idSuffix}`,
          txSig: `OfflineTx${Math.random().toString(36).slice(2)}`,
        },
      } as unknown as T;
    }
  } catch (fallbackError) {
    console.error(`[API] Offline fallback failed for ${path}`, fallbackError);
  }

  return undefined;
};

// Centralized authenticated request with auto-refresh on 401
const request = async <T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized: boolean = true
): Promise<T> => {
  // Mock response for demo mode
  const token = tokenStore.getAccessToken();
  logger.debug(`[API] Requesting: ${path} (Base: ${API_BASE_URL})`);

  // CRITICAL: Allow real backend calls for AI agents even in demo mode
  const isAIAgentCall = path.includes('/step') || path.includes('/submit');

  if (token === 'demo-token' && !isAIAgentCall) {
    logger.debug(`[Demo Mode] Mocking request to ${path}`);

    type DemoPersonaState = {
      xp: number;
      tokens: number;
      completedPhases: number[];
      nfts: string[];
    };

    type DemoDatabase = {
      version: number;
      personas: Record<string, DemoPersonaState>;
    };

    const DEMO_DB_VERSION = 2;
    const DEMO_DB_KEY = 'demo_mock_db';
    const DEMO_DB_SEED_KEY = 'demo_mock_db_seed';
    const DEMO_ACTIVE_PERSONA_KEY = 'demo_active_persona';

    const getActiveDemoPersonaId = () => {
      try {
        return localStorage.getItem(DEMO_ACTIVE_PERSONA_KEY) || 'cognitive-activation-hub';
      } catch {
        return 'cognitive-activation-hub';
      }
    };

    const normalizeLegacyDemoState = (candidate?: Partial<DemoPersonaState>): DemoPersonaState => {
      const candidateCompleted = candidate?.completedPhases;
      const candidateNfts = candidate?.nfts;
      return {
        xp: typeof candidate?.xp === 'number' ? candidate.xp : 0,
        tokens: typeof candidate?.tokens === 'number' ? candidate.tokens : 0,
        completedPhases: Array.isArray(candidateCompleted) ? candidateCompleted : [],
        nfts: Array.isArray(candidateNfts) ? candidateNfts : [],
      };
    };

    const readDemoDatabase = (personaId: string): DemoDatabase => {
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

    const persistDemoDatabase = (db: DemoDatabase) => {
      try {
        localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
      } catch (error) {
        console.warn('[Demo Mode] Failed to persist demo datastore:', error);
      }
    };

    const demoPersonaId = getActiveDemoPersonaId();
    const demoDatabase = readDemoDatabase(demoPersonaId);
    if (!demoDatabase.personas[demoPersonaId]) {
      demoDatabase.personas[demoPersonaId] = normalizeLegacyDemoState();
      persistDemoDatabase(demoDatabase);
    }

    const getDemoState = (): DemoPersonaState => demoDatabase.personas[demoPersonaId];
    const setDemoState = (state: DemoPersonaState) => {
      demoDatabase.personas[demoPersonaId] = state;
      persistDemoDatabase(demoDatabase);
    };
    const updateDemoState = (updates: Partial<DemoPersonaState>) => {
      const current = getDemoState();
      const next: DemoPersonaState = {
        ...current,
        ...updates,
        completedPhases: updates.completedPhases ?? current.completedPhases,
        nfts: updates.nfts ?? current.nfts,
      };
      setDemoState(next);
      return next;
    };

    if (path === '/user/profile' || path === '/user/verify') {
      return {
        success: true,
        user: {
          id: "demo-user-id",
          name: "Demo User",
          email: "demo@moneyfactory.ai",
          role: "user",
          wallet_address: "DemoWalletAddress123",
          persona: demoPersonaId as any
        }
      } as unknown as T;
    }

    if (path === '/user/refresh') {
      return {
        success: true,
        accessToken: "demo-token",
        refreshToken: "demo-refresh-token"
      } as unknown as T;
    }

    if (path === '/journey/reset-progress') {
      localStorage.removeItem('demo_mock_db');
      return { success: true } as unknown as T;
    }

    if (path === '/journey/user-progress') {
      if (options.method === 'GET') {
        const state = getDemoState();
        return {
          success: true,
          progress: {
            total_xp: state.xp,
            token_transactions: {
              mfai_tokens: state.tokens
            },
            completed_phases: state.completedPhases.length,
            persona: demoPersonaId,
            nft_certificates: state.nfts.map((t: string) => ({ title: t })),
            subscription: 'gold'
          }
        } as unknown as T;
      }
      if (options.method === 'PUT') {
        const body = JSON.parse(options.body as string);
        updateDemoState({
          xp: body.total_xp,
          // If completed_phases is sent as a count, we might need to adjust logic,
          // but usually completePhase handles the array.
          // Here we just trust the frontend sends total_xp.
        });
        return { success: true } as unknown as T;
      }
    }

    if (path === '/user/tokens') {
      if (options.method === 'PUT') {
        const body = JSON.parse(options.body as string);
        updateDemoState({ tokens: body.mfai_tokens });
        return { success: true } as unknown as T;
      }
    }

    if (path === '/journey/complete-phase') {
      const body = JSON.parse(options.body as string);
      const state = getDemoState();
      const phaseIndex = body.phase_number - 1;

      if (!state.completedPhases.includes(phaseIndex)) {
        // Calculate rewards based on phase
        let xpReward = body.xp_reward || 0;
        let tokenReward = body.mfai_reward || 0;
        let nftReward = body.nft_reward || null;

        // Fallback if not provided (legacy behavior)
        if (!body.xp_reward && !body.mfai_reward) {
          // Phase 1 (Activation)
          if (phaseIndex === 0) { xpReward = 60; tokenReward = 6; nftReward = "Proof-of-Skill™: Activation"; }
          // Phase 2 (Staking)
          else if (phaseIndex === 1) { xpReward = 80; tokenReward = 8; nftReward = "Solana Fluency Patch"; }
          // Phase 3 (Governance)
          else if (phaseIndex === 2) { xpReward = 90; tokenReward = 9; nftReward = "Tokenomics Architect Badge"; }
          // Default
          else { xpReward = 50; tokenReward = 5; }
        }

        const updates: any = {
          completedPhases: [...state.completedPhases, phaseIndex],
          xp: state.xp + xpReward,
          tokens: state.tokens + tokenReward
        };

        if (nftReward) {
          updates.nfts = [...state.nfts, nftReward];
        }

        updateDemoState(updates);
      }
      return { success: true } as unknown as T;
    }

    if (path === '/user/nft-certificates') {
      const body = JSON.parse(options.body as string);
      const state = getDemoState();
      // Extract title from body or generate one
      const title = body.title || `Phase ${body.phase} NFT`;
      updateDemoState({ nfts: [...state.nfts, title] });
      return { success: true } as unknown as T;
    }

    if (path.includes('/step')) {
      const body = JSON.parse(options.body as string);
      const phaseId = body.phaseId || 'unknown';
      const state = getDemoState();
      const phaseIndex = state.completedPhases.length;

      // Dynamic content based on phase
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
            nft_reward_id: "Proof-of-Skill™: Activation"
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
        // Default / Expansion phase
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
    }

    if (path.includes('/admin/agent-logs') || path.includes('/api/agents/logs')) {
      return {
        logs: [
          { id: '1', timestamp: new Date().toISOString(), agentId: 'zyno', message: 'System initialized', level: 'info' },
          { id: '2', timestamp: new Date().toISOString(), agentId: 'zyno', message: 'Monitoring active', level: 'info' }
        ]
      } as unknown as T;
    }

    if (path.includes('/dao/config')) {
      return {
        quorumPercent: 66,
        totalVotingPower: 10000,
        voters: [
          { id: 'v1', name: 'Alice', weight: 100 },
          { id: 'v2', name: 'Bob', weight: 50 }
        ]
      } as unknown as T;
    }

    if (path.includes('/dao/proposals')) {
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
    }

    // Mock agent logs endpoints
    if (path.includes('/agents/logs') || path.includes('/admin/agent-logs')) {
      return [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          agentId: 'analyst',
          message: 'Market analysis completed',
          level: 'info',
          journeyId: 'demo-journey'
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          agentId: 'trader',
          message: 'Portfolio optimization in progress',
          level: 'info',
          journeyId: 'demo-journey'
        }
      ] as unknown as T;
    }

    // Mock orchestration endpoint
    if (path.includes('/orchestration')) {
      return {
        status: 'active',
        activeAgents: ['analyst', 'trader', 'governance'],
        queuedTasks: 0
      } as unknown as T;
    }

    // Mock Collaterize simulation with enhanced data
    if (path.includes('/phases/launch-collaterize/simulate')) {
      // Generate more realistic simulation based on user progress
      const state = getDemoState();
      const baseScore = 60 + (state.xp / 100); // Higher XP = higher base score
      const riskScore = Math.max(0.05, Math.min(0.95, 0.3 - (state.xp / 2000))); // Lower risk with more XP
      const communityScore = 60 + Math.min(40, state.xp / 200); // Higher community score with more XP

      const adjustedScore = Math.min(100, Math.max(0, baseScore + (Math.random() * 20 - 10))); // Add some randomness

      let tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED';
      if (adjustedScore >= 80) tier = 'CORE';
      else if (adjustedScore >= 60) tier = 'EXPERIMENTAL';
      else tier = 'REJECTED';

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
            tier === 'REJECTED' ? "Consider improving documentation and community presence before simulation" :
              tier === 'EXPERIMENTAL' ? "Your project shows promise but needs refinement in key areas" :
                "Strong fundamentals positioned for Core track success"
          ],
          simulatedLaunchUrl: 'https://launchpad.collaterize.com/'
        }
      } as unknown as T;
    }

    // Mock artifacts endpoint - return unlocked artifacts based on user progress
    if (path === '/journey/artifacts') {
      const state = getDemoState();
      const currentPhase = state.completedPhases ? state.completedPhases.length : 0;

      // Import static artifacts data for demo mode
      const staticArtifacts = await import('../data/artifacts.json');
      const artifacts = staticArtifacts.default.map((artifact: any) => ({
        ...artifact,
        // Force unlocked status in demo mode so users can preview assets without gating
        status: 'unlocked'
      }));

      return {
        success: true,
        artifacts,
        currentPhase
      } as unknown as T;
    }

    // Default success for other endpoints in demo mode
    return { success: true } as unknown as T;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    const fallback = await handleOfflineFallback<T>(path, networkError);
    if (fallback !== undefined) {
      return fallback;
    }
    throw networkError;
  }

  logger.debug(`[API] Response for ${path}: ${response.status}`);

  if (response.status === 401 && retryOnUnauthorized) {
    // Attempt token refresh once
    const storedRefreshToken = tokenStore.getRefreshToken();
    if (!storedRefreshToken) {
      const errorData: ApiError = await response.json().catch(() => ({
        success: false,
        message: 'Unauthorized and no refresh token available',
      }));
      throw new Error(errorData.message || 'Unauthorized');
    }

    // Refresh token
    // Handle demo refresh token specifically
    if (storedRefreshToken === 'demo-refresh-token') {
      tokenStore.setAccessToken('demo-token');
      return request<T>(path, options, false);
    }

    const refreshResp = await fetch(`${API_BASE_URL}/user/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (refreshResp.ok) {
      const refreshData = await refreshResp.json();
      if (refreshData?.accessToken) {
        tokenStore.setAccessToken(refreshData.accessToken);
      }
      if (refreshData?.refreshToken) {
        tokenStore.setRefreshToken(refreshData.refreshToken);
      }

      // Retry original request once with updated Authorization header
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...getAuthHeaders(),
        },
      });
      return handleResponse<T>(retryResponse);
    }

    // Refresh failed
    tokenStore.clearTokens();
    const errorData: ApiError = await refreshResp.json().catch(() => ({
      success: false,
      message: 'Token refresh failed',
    }));
    throw new Error(errorData.message || 'Token refresh failed');
  }

  return handleResponse<T>(response);
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      success: false,
      message: 'Network error occurred'
    }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API functions
export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return request<LoginResponse>('/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }, false);
  },

  getWalletChallenge: async (wallet_address: string): Promise<{ success: boolean; message: string; nonce: string }> => {
    return request<{ success: boolean; message: string; nonce: string }>('/user/wallet-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address }),
    }, false);
  },

  loginWithWallet: async (wallet_address: string, signature?: string, message?: string): Promise<LoginResponse> => {
    return request<LoginResponse>('/user/login-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address, signature, message }),
    }, false);
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    wallet_address: string;
    persona: string;
  }): Promise<RegisterResponse> => {
    return request<RegisterResponse>('/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }, false);
  },

  logout: async (): Promise<void> => {
    const refreshToken = tokenStore.getRefreshToken();
    if (refreshToken) {
      try {
        await request<void>('/user/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }, false);
      } catch (error) {
        logger.error('Logout error:', error);
      }
    }
  },

  refreshToken: async (): Promise<{ accessToken: string; refreshToken?: string }> => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return request<{ accessToken: string; refreshToken?: string }>('/user/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }, false);
  },

  verifyToken: async (): Promise<{ user: LoginResponse['user'] }> => {
    return request<{ user: LoginResponse['user'] }>('/user/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // User profile
  getUserProfile: async (): Promise<LoginResponse['user']> => {
    return request<LoginResponse['user']>('/user/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  updateUserProfile: async (userData: Partial<LoginResponse['user']>): Promise<LoginResponse['user']> => {
    return request<LoginResponse['user']>('/user/update-profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  },

  // Journey progress
  updateProgress: async (progressData: {
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
  }): Promise<void> => {
    return request<void>('/journey/user-progress', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });
  },

  resetProgress: async (): Promise<void> => {
    return request<void>('/journey/reset-progress', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Get user progress
  getUserProgress: async (): Promise<any> => {
    return request<any>('/journey/user-progress', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getJourneyArtifacts: async (): Promise<{ success: boolean; artifacts: any[]; currentPhase?: number; message?: string }> => {
    return request<{ success: boolean; artifacts: any[]; currentPhase?: number; message?: string }>('/journey/artifacts', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Load demo state for a persona
  loadDemoState: async (personaId: string): Promise<any> => {
    return request<any>('/journey/load-demo', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ personaId }),
    });
  },

  // Complete phase
  completePhase: async (phaseData: {
    phase_number: number;
    score?: number;
    nft_address?: string;
    xp_reward?: number;
    mfai_reward?: number;
    nft_reward?: string;
    title?: string;
    description?: string;
    image_url?: string;
    rarity?: string;
  }): Promise<any> => {
    return request<any>('/journey/complete-phase', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(phaseData),
    });
  },

  // NFT certificates
  addNFTCertificate: async (certificateData: {
    phase: number;
    nft_address: string;
    score?: number;
  }): Promise<void> => {
    return request<void>('/user/nft-certificates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(certificateData),
    });
  },

  // Token transactions
  updateTokenBalance: async (tokenData: {
    mfai_tokens: number;
  }): Promise<void> => {
    return request<void>('/user/tokens', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tokenData),
    });
  },

  // Enhanced NFT certificate endpoint
  addNFTCertificateEnhanced: async (certificateData: {
    phase: number;
    title: string;
    description: string;
    image_url: string;
    mint_address: string;
    rarity: string;
    xp_earned: number;
  }): Promise<any> => {
    return request<any>('/user/nft-certificates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(certificateData),
    });
  },

  // Track certification downloads
  trackCertificationDownload: async (downloadData: {
    certification_id: string;
    phase: number;
    user_persona?: string;
    download_timestamp: string;
  }): Promise<any> => {
    return request<any>('/analytics/certification-download', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(downloadData),
    });
  },



  // Track certification shares
  trackCertificationShare: async (shareData: {
    certification_id: string;
    platform: string;
    phase: number;
    user_persona?: string;
    share_timestamp: string;
  }): Promise<any> => {
    return request<any>('/analytics/certification-share', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shareData),
    });
  },

  // Get access pass holders
  getAccessPassHolders: async (): Promise<any> => {
    return request<any>('/analytics/access-pass-holders', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Track holder interactions
  trackHolderInteraction: async (interactionData: {
    holder_id: string;
    interaction_type: string;
    timestamp: string;
  }): Promise<any> => {
    return request<any>('/analytics/holder-interaction', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(interactionData),
    });
  },

  // Get DAO proposals
  getDaoProposals: async (): Promise<DaoProposalsResponse> => {
    return request<DaoProposalsResponse>('/dao/proposals', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Cast DAO vote
  castDaoVote: async (proposalId: string, vote: 'yes' | 'no'): Promise<DaoProposalResponse> => {
    return request<DaoProposalResponse>('/dao/vote', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ proposalId, vote }),
    });
  },

  // Get DAO configuration
  getDaoConfig: async (): Promise<DaoConfigResponse> => {
    return request<DaoConfigResponse>('/dao/config', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Submit DAO proposal
  submitDaoProposal: async (proposalData: {
    title: string;
    description: string;
  }): Promise<DaoProposalResponse> => {
    return request<DaoProposalResponse>('/dao/proposal', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(proposalData),
    });
  },

  // Submit mission for evaluation
  submitMission: async (
    journeyId: string,
    missionData: {
      missionId: string;
      inputType: string;
      submission: string;
      language: string;
      mode: string;
      tone: string;
      trackId: string;
      phaseId: string;
      phaseNumber: number;
      journeyState: any;
    }
  ): Promise<any> => {
    return request<any>(`/journey/${journeyId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(missionData),
    });
  },

  // Get agent logs
  getAgentLogs: async (journeyId?: string): Promise<any> => {
    const query = journeyId ? `?journeyId=${journeyId}` : '';
    return request<any>(`/admin/agent-logs${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Orchestration endpoints
  getOrchestrationStatus: async (): Promise<any> => {
    return request<any>('/orchestration', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // RAG endpoints
  uploadDocument: async (docData: {
    title: string;
    content: string;
    tags: string;
  }): Promise<RagUploadResponse> => {
    return request<RagUploadResponse>('/rag/doc', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(docData),
    });
  },

  queryDocuments: async (queryData: {
    text: string;
  }): Promise<any> => {
    return request<any>('/rag/query', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(queryData),
    });
  },

  // Collaterize Simulation
  simulateCollaterizeLaunch: async (journeyId: string): Promise<any> => {
    return request<any>(`/journeys/${journeyId}/phases/launch-collaterize/simulate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Solana mint functions (simulated)
  solanaMintSimulate: async (mintData: any): Promise<any> => {
    // Simulated function for demo mode
    if (tokenStore.getAccessToken() === 'demo-token') {
      return {
        ok: true,
        sim: {
          ok: true,
          estFeeLamports: 5000,
          riskScore: 0.0,
          network: 'devnet'
        }
      };
    }
    return request<any>('/solana/mint/simulate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mintData),
    });
  },

  solanaMintExecute: async (mintData: any): Promise<any> => {
    // Simulated function for demo mode
    if (tokenStore.getAccessToken() === 'demo-token') {
      return {
        ok: true,
        jobId: 'demo-job-' + Date.now(),
        status: 'queued',
        tx: { mintAddress: 'DemoMintAddress' + Date.now(), txSig: 'DemoTxSig' + Date.now() }
      };
    }
    return request<any>('/solana/mint/execute', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mintData),
    });
  },

  // Agent scoreboard
  getAgentScoreboard: async (): Promise<any> => {
    // Simulated function for demo mode
    if (tokenStore.getAccessToken() === 'demo-token') {
      return {
        users: [
          { userId: 'demo-user-1', aepo: 95, aeco: 92, historyCount: 15, updatedAt: new Date().toISOString(), profile: {} },
          { userId: 'demo-user-2', aepo: 87, aeco: 89, historyCount: 12, updatedAt: new Date().toISOString(), profile: {} }
        ]
      };
    }
    return request<any>('/admin/agent-logs', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Mission export
  exportMissionSummary: async (missionData: any): Promise<any> => {
    // Simulated function
    return request<any>('/journey/export-mission', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(missionData),
    });
  },

  // RAG functions
  listRagDocuments: async (): Promise<any> => {
    // Simulated function for demo mode
    if (tokenStore.getAccessToken() === 'demo-token') {
      return {
        documents: [
          { name: 'Demo Doc 1', path: '/demo/doc1' },
          { name: 'Demo Doc 2', path: '/demo/doc2' }
        ]
      };
    }
    return request<any>('/rag/doc', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // DAO functions
  createDaoProposal: async (proposalData: any): Promise<any> => {
    // Simulated function for demo mode
    if (tokenStore.getAccessToken() === 'demo-token') {
      return {
        proposal: {
          id: 'demo-proposal-' + Date.now(),
          title: proposalData.title,
          description: proposalData.description,
          status: 'active',
          votes: { yes: 0, no: 0 }
        }
      };
    }
    return request<any>('/dao/proposal', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(proposalData),
    });
  },

  closeDaoProposal: async (proposalId: string): Promise<any> => {
    return request<any>(`/dao/proposal/${proposalId}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },
};

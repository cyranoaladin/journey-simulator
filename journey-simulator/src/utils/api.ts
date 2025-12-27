// API base URL - configurable via environment variable for different deployments.
// IMPORTANT: this is the ORIGIN/root (no trailing "/api"), because this frontend calls both:
// - /journey/*  (mf-back)
// - /user/*, /dao/*, /api/* (mf-back aliases)
import { logger } from './logger';
import { tokenStore } from './tokenStore';
import { DemoStateManager, handleDemoRequest } from './apiDemoHandlers';

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

// Avoid a "refresh stampede" when multiple requests hit 401 concurrently.
let refreshInFlight: Promise<Response> | null = null;

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
    const stateManager = new DemoStateManager();
    const demoResponse = await handleDemoRequest<T>(path, options, stateManager);
    if (demoResponse !== null) {
      return demoResponse;
    }
    // Fallback to default success if handler returns null
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

    if (!refreshInFlight) {
      refreshInFlight = fetch(`${API_BASE_URL}/user/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      }).finally(() => {
        refreshInFlight = null;
      });
    }

    const refreshResp = await refreshInFlight;

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
  castDaoVote: async (
    proposalId: string,
    voterId: string,
    support: 'yes' | 'no'
  ): Promise<DaoProposalResponse> => {
    // Demo mode: keep DAO interactions non-blocking even if backend responses are mocked.
    if (tokenStore.getAccessToken() === 'demo-token') {
      return {
        proposal: {
          id: proposalId,
          title: 'Demo Proposal',
          createdAt: new Date().toISOString(),
          status: 'active',
          votes: { yes: 0, no: 0 },
          voterDetails: {},
          quorumMet: false,
        },
      };
    }

    return request<DaoProposalResponse>(`/dao/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ voterId, support }),
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
  submitDaoProposal: async (
    proposalData: {
      title: string;
      description: string;
    },
    apiKey?: string
  ): Promise<DaoProposalResponse> => {
    if (!apiKey) {
      throw new Error('Missing admin API key');
    }

    return request<DaoProposalResponse>('/dao/proposals', {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'x-api-key': apiKey },
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
  createDaoProposal: async (proposalData: any, apiKey?: string): Promise<any> => {
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

    if (!apiKey) {
      throw new Error('Missing admin API key');
    }

    return request<any>('/dao/proposals', {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'x-api-key': apiKey },
      body: JSON.stringify(proposalData),
    });
  },

  closeDaoProposal: async (proposalId: string, apiKey?: string): Promise<any> => {
    // Demo mode: no-op
    if (tokenStore.getAccessToken() === 'demo-token') {
      return { proposal: { id: proposalId, status: 'closed' } };
    }

    if (!apiKey) {
      throw new Error('Missing admin API key');
    }

    return request<any>(`/dao/proposals/${proposalId}/close`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'x-api-key': apiKey },
    });
  },
};

// API base URL - configurable via environment variable for different deployments
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3002';

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
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Centralized authenticated request with auto-refresh on 401
const request = async <T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized: boolean = true
): Promise<T> => {
  // Mock response for demo mode
  const token = localStorage.getItem('accessToken');
  if (token === 'demo-token') {
    console.log(`[Demo Mode] Mocking request to ${path}`);

    // Helper to simulate backend state
    const getDemoState = () => {
      const stored = localStorage.getItem('demo_mock_db');
      return stored ? JSON.parse(stored) : {
        xp: 0,
        tokens: 0,
        completedPhases: [],
        nfts: []
      };
    };

    const updateDemoState = (updates: any) => {
      const current = getDemoState();
      const newState = { ...current, ...updates };
      localStorage.setItem('demo_mock_db', JSON.stringify(newState));
      return newState;
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
          persona: "cognitive-activation-hub"
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
            persona: "cognitive-activation-hub",
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

    // Default success for other endpoints in demo mode
    return { success: true } as unknown as T;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    // Attempt token refresh once
    const storedRefreshToken = localStorage.getItem('refreshToken');
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
      localStorage.setItem('accessToken', 'demo-token');
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
        localStorage.setItem('accessToken', refreshData.accessToken);
      }
      if (refreshData?.refreshToken) {
        localStorage.setItem('refreshToken', refreshData.refreshToken);
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    const errorData: ApiError = await refreshResp.json().catch(() => ({
      success: false,
      message: 'Token refresh failed',
    }));
    throw new Error(errorData.message || 'Token refresh failed');
  }

  return handleResponse<T>(response);
};

const solanaRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${SOLANA_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Solana API request failed (status ${response.status})`;
    try {
      const errorData: ApiError = await response.json();
      if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.error) {
        message = errorData.error;
      }
    } catch (parseError) {
      console.error('Failed to parse Solana API error response:', parseError);
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
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

  loginWithWallet: async (wallet_address: string): Promise<LoginResponse> => {
    return request<LoginResponse>('/user/login-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address }),
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
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await request<void>('/user/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }, false);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },

  refreshToken: async (): Promise<{ accessToken: string; refreshToken?: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
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

  // Get platform statistics
  getPlatformStats: async (): Promise<any> => {
    return request<any>('/analytics/platform-stats', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Solana minting (Next.js API)
  solanaMintSimulate: async (payload: { recipient: string; name: string; symbol: string; uri: string }): Promise<{ ok: boolean; sim: { ok: boolean; estFeeLamports: number; riskScore: number; network: string } }> => {
    return solanaRequest(`/api/mint/simulate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  solanaMintExecute: async (sim: { ok: boolean; estFeeLamports: number; riskScore: number; network: string }): Promise<{ ok: boolean; tx: { txSig: string } }> => {
    const userId = (typeof window !== 'undefined') ? window.localStorage.getItem('userId') : null
    return solanaRequest(`/api/mint/execute`, {
      method: 'POST',
      headers: {
        ...(userId ? { 'x-user-id': userId } : {}),
      },
      body: JSON.stringify({ sim }),
    });
  },

  getAgentScoreboard: async (adminApiKey: string): Promise<AgentScoreboardResponse> => {
    return request<AgentScoreboardResponse>('/admin/agent-scoreboard', {
      method: 'GET',
      headers: {
        'x-api-key': adminApiKey,
      },
    }, false);
  },

  listRagDocuments: async (adminApiKey: string): Promise<RagDocumentsResponse> => {
    return request<RagDocumentsResponse>('/admin/rag/documents', {
      method: 'GET',
      headers: {
        'x-api-key': adminApiKey,
      },
    }, false);
  },

  uploadRagDocument: async (file: File, adminApiKey: string): Promise<RagUploadResponse> => {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${API_BASE_URL}/admin/rag/upload`, {
      method: 'POST',
      headers: {
        'x-api-key': adminApiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      try {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || errorData.error || 'Upload failed');
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Upload failed');
      }
    }

    return response.json();
  },

  exportMissionSummary: async (
    summary: MissionExportPayload,
    format: 'pdf' | 'notion',
    adminApiKey: string
  ): Promise<Blob | string> => {
    const response = await fetch(`${API_BASE_URL}/admin/export/mission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': adminApiKey,
      },
      body: JSON.stringify({ summary, format }),
    });

    if (!response.ok) {
      let message = `Export failed (status ${response.status})`;
      try {
        const errorData: ApiError = await response.json();
        if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.error) {
          message = errorData.error;
        }
      } catch (parseError) {
        console.error('Failed to parse export error response:', parseError);
      }
      throw new Error(message);
    }

    if (format === 'pdf') {
      return response.blob();
    }

    const notionResponse = await response.json();
    if (!notionResponse?.content) {
      throw new Error('Invalid export format received');
    }
    return notionResponse.content as string;
  },

  getDaoConfig: async (): Promise<DaoConfigResponse> => {
    return request<DaoConfigResponse>('/dao/config', {
      method: 'GET',
    });
  },

  getDaoProposals: async (): Promise<DaoProposalsResponse> => {
    return request<DaoProposalsResponse>('/dao/proposals', {
      method: 'GET',
    });
  },

  createDaoProposal: async (
    payload: { title: string; description?: string; createdBy?: string },
    adminApiKey: string
  ): Promise<DaoProposalResponse> => {
    return request<DaoProposalResponse>(
      '/dao/proposals',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminApiKey,
        },
        body: JSON.stringify(payload),
      },
      false
    );
  },

  castDaoVote: async (
    proposalId: string,
    payload: { voterId: string; support: boolean | 'yes' | 'no' }
  ): Promise<DaoProposalResponse> => {
    return request<DaoProposalResponse>(`/dao/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  closeDaoProposal: async (
    proposalId: string,
    adminApiKey: string
  ): Promise<DaoProposalResponse> => {
    return request<DaoProposalResponse>(
      `/dao/proposals/${proposalId}/close`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminApiKey,
        },
      },
      false
    );
  },
};

export default api; 
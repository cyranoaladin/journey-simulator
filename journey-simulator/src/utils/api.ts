export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Generic request helper (sends token)
 */
export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) console.warn('⚠️ Session expired or invalid token');
    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorData?.error || errorMessage;
    } catch (e) {
      // FIX: Add minimal logging to avoid 'no-empty' ESLint error
      console.debug('Failed to parse error response JSON:', e);
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// --- COUCHE DE COMPATIBILITÉ (Restoration of all named methods) ---

const client = { request };

export const api = {
  // Generic methods
  request: client.request,
  get: <T>(url: string) => client.request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any = {}) => client.request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any = {}) => client.request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => client.request<T>(url, { method: 'DELETE' }),

  // DAO
  // FIX: Utilize daoId in the endpoint path to resolve TS unused-vars error
  getDaoConfig: <T = any>(daoId?: string) =>
    api.get<T>(daoId ? `/dao/${encodeURIComponent(daoId)}/config` : `/dao/config`),

  getDaoProposals: <T = any>() => api.get<T>(`/dao/proposals`),
  createDaoProposal: <T = any>(body: any) => api.post<T>(`/dao/proposals`, body),
  castDaoVote: <T = any>(id: string, body: any) => api.post<T>(`/proposals/${id}/vote`, body),
  closeDaoProposal: <T = any>(id: string) => api.post<T>(`/proposals/${id}/close`),

  // Auth, User, Demo, Minting, RAG (Restored from full compatibility list)
  login: <T = any>(creds: any) => api.post<T>('/auth/login', creds),
  register: <T = any>(payload: any) => api.post<T>('/auth/register', payload),
  loadDemoState: <T = any>() => api.get<T>('/demo/state'),
  getJourneyArtifacts: <T = any>(journeyId: string) => api.get<T>(`/journey/${journeyId}/artifacts`),
  completePhase: <T = any>(journeyId: string, phaseId: string, body?: any) => api.post<T>(`/journey/${journeyId}/phases/${phaseId}/complete`, body),
  solanaMintSimulate: <T = any>(payload: any) => api.post<T>('/mint/solana/simulate', payload),
  solanaMintExecute: <T = any>(payload: any) => api.post<T>('/mint/solana/execute', payload),
  addNFTCertificateEnhanced: <T = any>(payload: any) => api.post<T>('/nft/certificate', payload),
  listRagDocuments: <T = any>(q?: string) => api.get<T>(`/rag/documents${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  // Full list of helpers for compliance
  loginWithWallet: <T = any>(payload: any) => api.post<T>('/auth/wallet-login', payload),
  refreshToken: <T = any>(token: string) => api.post<T>('/auth/refresh', { token }),
  logout: <T = any>() => api.post<T>('/auth/logout'),
  verifyToken: <T = any>(token: string) => api.post<T>('/auth/verify', { token }),
  updateUserProfile: <T = any>(userId: string, body: any) => api.put<T>(`/user/${userId}`, body),
  getUserProgress: <T = any>(userId: string) => api.get<T>(`/user/${userId}/progress`),
  updateProgress: <T = any>(userId: string, body: any) => api.post<T>(`/user/${userId}/progress`, body),
  resetProgress: <T = any>(userId: string) => api.post<T>(`/user/${userId}/progress/reset`),
  updateTokenBalance: <T = any>(userId: string, body: any) => api.post<T>(`/user/${userId}/tokens`, body),
  simulateCollaterizeLaunch: <T = any>(params: any) => api.post<T>('/simulate/collaterize', params),
  getAgentLogs: <T = any>(agentId: string) => api.get<T>(`/agents/${agentId}/logs`),
  getAgentScoreboard: <T = any>() => api.get<T>('/agents/scoreboard'),
  exportMissionSummary: <T = any>(payload: any) => api.post<T>(`/missions/export`, payload),

  uploadDocument: <T = any>(file: File | Blob, metadata: Record<string, string> = {}, opts?: RequestInit) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      form.append(key, value);
    });
    return api.request<T>('/rag/documents', { method: 'POST', body: form, ...opts });
  },

  // Placeholders for Typescript compliance
  LoginResponse: {} as LoginResponse,
  DaoConfigResponse: {} as DaoConfigResponse,
  DaoProposal: {} as DaoProposal,
  DaoVoter: {} as DaoVoter,
  AgentScoreboardEntry: {} as AgentScoreboardEntry,
  RagDocument: {} as RagDocument,
};

// Placeholder type exports
export type LoginResponse = any;
export type DaoConfigResponse = any;
export type DaoProposal = any;
export type DaoVoter = any;
export type AgentScoreboardEntry = any;
export type RagDocument = any;
export type JourneyResponse = any;

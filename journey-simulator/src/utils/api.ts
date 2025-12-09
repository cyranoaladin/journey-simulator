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
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {}
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
  post: <T>(url: string, body: any) => client.request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => client.request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => client.request<T>(url, { method: 'DELETE' }),

  // DAO
  getDaoConfig: <T = any>(daoId?: string) => api.get<T>(`/dao/config`),
  getDaoProposals: <T = any>() => api.get<T>(`/dao/proposals`),
  createDaoProposal: <T = any>(body: any) => api.post<T>(`/dao/proposals`, body),
  castDaoVote: <T = any>(id: string, body: any) => api.post<T>(`/dao/proposals/${id}/vote`, body),
  closeDaoProposal: <T = any>(id: string) => api.post<T>(`/dao/proposals/${id}/close`),

  // Auth
  login: <T = any>(creds: any) => api.post<T>('/auth/login', creds),
  loginWithWallet: <T = any>(payload: any) => api.post<T>('/auth/wallet-login', payload),
  register: <T = any>(payload: any) => api.post<T>('/auth/register', payload),
  refreshToken: <T = any>(token: string) => api.post<T>('/auth/refresh', { token }),
  logout: <T = any>() => api.post<T>('/auth/logout'),
  verifyToken: <T = any>(token: string) => api.post<T>('/auth/verify', { token }),

  // User & Progress
  updateUserProfile: <T = any>(userId: string, body: any) => api.put<T>(`/user/${userId}`, body),
  getUserProgress: <T = any>(userId: string) => api.get<T>(`/user/${userId}/progress`),
  updateProgress: <T = any>(userId: string, body: any) => api.post<T>(`/user/${userId}/progress`, body),
  resetProgress: <T = any>(userId: string) => api.post<T>(`/user/${userId}/progress/reset`),
  updateTokenBalance: <T = any>(userId: string, body: any) => api.post<T>(`/user/${userId}/tokens`, body),

  // Demo & Journeys
  loadDemoState: <T = any>() => api.get<T>('/demo/state'),
  getJourneyArtifacts: <T = any>(journeyId: string) => api.get<T>(`/journey/${journeyId}/artifacts`),
  completePhase: <T = any>(journeyId: string, phaseId: string) => api.post<T>(`/journey/${journeyId}/phases/${phaseId}/complete`),

  // Minting / NFT
  solanaMintSimulate: <T = any>(payload: any) => api.post<T>('/mint/solana/simulate', payload),
  solanaMintExecute: <T = any>(payload: any) => api.post<T>('/mint/solana/execute', payload),
  addNFTCertificateEnhanced: <T = any>(payload: any) => api.post<T>('/nft/certificate', payload),

  // RAG documents
  listRagDocuments: <T = any>(q?: string) => api.get<T>(`/rag/documents${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  uploadDocument: <T = any>(file: File | Blob, opts?: RequestInit) => {
    const form = new FormData();
    form.append('file', file);
    return api.request<T>('/rag/documents', { method: 'POST', body: form, ...opts });
  },

  // Zyno / Agents
  getAgentLogs: <T = any>(agentId: string) => api.get<T>(`/agents/${agentId}/logs`),
  getAgentScoreboard: <T = any>() => api.get<T>('/agents/scoreboard'),
  exportMissionSummary: <T = any>(missionId: string) => api.get<T>(`/missions/${missionId}/summary`),

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

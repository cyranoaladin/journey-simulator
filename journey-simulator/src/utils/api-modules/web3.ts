/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Verified for Absolute Zero Protocol

import { executeRequest } from './base';

export interface DaoProposal {
    id: string;
    title: string;
    description?: string;
    createdBy?: string;
    createdAt: string;
    closedAt?: string;
    status: 'active' | 'closed';
    votes: { yes: number; no: number };
    voterDetails?: Record<string, { support: 'yes' | 'no'; weight: number }>;
    quorumMet?: boolean;
    outcome?: string;
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

export const web3Api = {
    // --- DAO ---
    getDaoConfig: async (): Promise<DaoConfigResponse> => {
        return executeRequest<DaoConfigResponse>('/dao/config', { method: 'GET' });
    },

    getDaoProposals: async (status: 'active' | 'closed' = 'active'): Promise<{ proposals: DaoProposal[] }> => {
        return executeRequest<{ proposals: DaoProposal[] }>(`/dao/proposals?status=${status}&t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
    },

    getDaoProposal: async (proposalId: string): Promise<{ proposal: DaoProposal }> => {
        return executeRequest<{ proposal: DaoProposal }>(`/dao/proposals/${proposalId}`, { method: 'GET' });
    },

    castDaoVote: async (proposalId: string, voterId: string, support: 'yes' | 'no'): Promise<any> => {
        return executeRequest<any>(`/dao/proposals/${proposalId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ voterId, support }),
        });
    },

    createDaoProposal: async (data: { title: string; description?: string }, apiKey?: string): Promise<any> => {
        return executeRequest<any>('/dao/proposals', {
            method: 'POST',
            body: JSON.stringify({ ...data, apiKey }),
        });
    },

    closeDaoProposal: async (proposalId: string, apiKey?: string): Promise<any> => {
        return executeRequest<any>(`/dao/proposals/${proposalId}/close`, {
            method: 'POST',
            body: JSON.stringify({ apiKey }),
        });
    },

    // --- Solana ---
    solanaMintSimulate: async (payload?: any): Promise<any> => {
        // Backend: POST /solana/mint/simulate
        return executeRequest<any>('/solana/mint/simulate', {
            method: 'POST',
            body: payload ? JSON.stringify(payload) : undefined
        });
    },

    solanaMintExecute: async (payload: { destinationWallet?: string, transactionSignature?: string } = {}): Promise<any> => {
        // Backend: POST /solana/mint/execute
        return executeRequest<any>('/solana/mint/execute', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    solanaMintStatus: async (jobId: string): Promise<any> => {
        // Backend: GET /solana/mint/status/:jobId
        return executeRequest<any>(`/solana/mint/status/${jobId}`, { method: 'GET' });
    }
};

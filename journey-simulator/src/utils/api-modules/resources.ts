/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { executeRequest } from './base';

export interface RagDocument {
    name: string;
    path: string;
}

export interface AgentScoreboardEntry {
    userId: string;
    aepo: number;
    aeco: number;
    historyCount: number;
    updatedAt: string | null;
    profile: Record<string, unknown>;
}

export const resourcesApi = {
    // --- RAG ---
    listRagDocuments: async (): Promise<{ documents: RagDocument[] }> => {
        return executeRequest<{ documents: RagDocument[] }>('/resources/rag', {
            method: 'GET'
        });
    },

    uploadDocument: async (data: { document?: File, content?: string, title?: string, tags?: string, apiKey?: string }): Promise<any> => {
        const formData = new FormData();

        if (data.document) {
            formData.append('document', data.document);
        } else if (data.content) {
            // Create a blob from content string
            const blob = new Blob([data.content], { type: 'text/plain' });
            formData.append('document', blob, data.title || 'uploaded-content.txt');
        }

        if (data.title) formData.append('title', data.title);
        if (data.tags) formData.append('tags', data.tags);

        const { API_BASE_URL, getAuthHeaders, handleResponse } = await import('./base');

        const headers = getAuthHeaders();
        delete (headers as any)['Content-Type']; // Let browser set boundary

        const response = await fetch(`${API_BASE_URL}/admin/rag/upload`, {
            method: 'POST',
            headers: {
                ...headers,
                ...(data.apiKey ? { 'x-api-key': data.apiKey } : {})
            },
            body: formData
        });
        return handleResponse(response);
    },

    // --- Export ---
    exportMissionSummary: async (payload: any): Promise<any> => {
        // Backend: POST /admin/export/mission
        const { API_BASE_URL, getAuthHeaders } = await import('./base');

        const response = await fetch(`${API_BASE_URL}/admin/export/mission`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'x-api-key': 'admin-secret'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Export failed');
        return response.blob();
    },

    // --- Scoreboard ---
    getAgentScoreboard: async (): Promise<{ users: AgentScoreboardEntry[] }> => {
        return executeRequest<{ users: AgentScoreboardEntry[] }>('/journey/metrics', { method: 'GET' })
            .catch(() => ({ users: [] }));
    }
};

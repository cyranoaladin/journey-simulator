/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Components } from './mf-back-client';
import { API_BASE_URL } from '../utils/api';
import { tokenStore } from '../utils/tokenStore';

type AgentRun = Components['schemas']['AgentRun'];

interface GetAgentRunsOptions {
    journeyId: string;
    limit?: number;
}

export async function getRecentAgentRuns({ journeyId, limit = 3 }: GetAgentRunsOptions): Promise<AgentRun[]> {
    try {
        const url = new URL(`${API_BASE_URL}/api/agents/runs`);
        url.searchParams.append('journeyId', journeyId);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('status', 'succeeded');

        // Note: Sort is usually handled by backend default or we might need to add sort param if supported
        // Assuming backend returns sorted or we accept default order for now.

        const token = tokenStore.getAccessToken();

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Use session-backed token storage to align with the rest of the app auth flow
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch agent runs:', response.statusText);
            return [];
        }

        const json = await response.json();
        // Assuming the response structure based on generated types (array of AgentRun)
        // If wrapped in success: true, data: [], adjust accordingly.
        // The spec usually defines the response shape.
        const runs = json.data || [];
        return runs.map((run: any) => ({
            ...run,
            output: run.output || run.ae_summary || run.summary || (run.payload ? JSON.stringify(run.payload) : '')
        }));
    } catch (error) {
        console.error('Error fetching agent runs:', error);
        return [];
    }
}

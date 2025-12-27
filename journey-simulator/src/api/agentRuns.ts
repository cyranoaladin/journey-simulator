import { Components } from './mf-back-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers if needed, usually stored in localStorage or cookie
                ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
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
        return json.data || []; // Adjust based on actual response wrapper if generic wrapper is used
    } catch (error) {
        console.error('Error fetching agent runs:', error);
        return [];
    }
}

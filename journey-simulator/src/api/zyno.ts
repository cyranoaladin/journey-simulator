/**
 * Zyno API Client - Connects to mf-back /api/agents/interact
 * Project: Money Factory AI (MFAI)
 */

import { tokenStore } from '../utils/tokenStore';

// Types matching backend expectations
export type AgentType = 
  | 'ZYNO_ORCHESTRATOR'
  | 'ARCHITECT_AGENT'
  | 'ENGINEER_AGENT'
  | 'CFO_AGENT'
  | 'LEGAL_AGENT'
  | 'MARKETING_AGENT'
  | 'AUDITOR_AGENT'
  | 'BUILDER_AGENT';

export interface ZynoInteractRequest {
  projectId: string;
  agentType: AgentType;
  message: string;
}

export interface ZynoInteractResponse {
  success: boolean;
  response: string;
  sessionId: string;
  agentType: string;
  latencyMs: number;
  // Parsed payload from JSON response
  payload?: {
    status?: string;
    reasoning?: string;
    summary?: string;
    recommendations?: string[];
    architecture?: Record<string, string>;
    actions?: string[];
  };
}

// Default project ID for testing (use real one from DB or journey context)
const DEFAULT_PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Call the Zyno agent interaction endpoint
 */
export async function interactWithZyno(
  message: string,
  agentType: AgentType = 'ZYNO_ORCHESTRATOR',
  projectId?: string
): Promise<ZynoInteractResponse> {
  const token = tokenStore.getAccessToken();
  
  const requestBody: ZynoInteractRequest = {
    projectId: projectId || DEFAULT_PROJECT_ID,
    agentType,
    message,
  };

  const response = await fetch('/api/agents/interact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zyno API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  // Try to parse the response content as JSON
  let payload: ZynoInteractResponse['payload'] = undefined;
  try {
    if (data.response && typeof data.response === 'string') {
      payload = JSON.parse(data.response);
    }
  } catch {
    // Response is not JSON, keep as raw text
  }

  return {
    ...data,
    payload,
  };
}

/**
 * Orchestrate a mission with Zyno (wrapper for backward compatibility)
 */
export async function orchestrateMission(
  intent: string,
  options?: {
    agentType?: AgentType;
    projectId?: string;
  }
): Promise<ZynoInteractResponse> {
  return interactWithZyno(
    intent,
    options?.agentType || 'ZYNO_ORCHESTRATOR',
    options?.projectId
  );
}

export const zynoApi = {
  interact: interactWithZyno,
  orchestrate: orchestrateMission,
};

/**
 * Orchestration Service
 * Centralizes agent interaction logic to avoid circular dependencies
 * between controllers.
 * 
 * Created: 2026-03-11
 * Fixes: Circular dependency between orchestration.controller.ts and agent.controller.ts
 */

import { AgentType } from '@prisma/client';
import { agentMemoryService } from './AgentMemoryService';
import { prisma } from '../config/database';
import { callLLM } from '../llm/OpenAIClient';
import { MetricsService } from './MetricsService';

// Valid agent types (matches Prisma AgentType enum)
const VALID_AGENT_TYPES: AgentType[] = [
  'ZYNO_ORCHESTRATOR',
  'ARCHITECT_AGENT',
  'ENGINEER_AGENT',
  'CFO_AGENT',
  'LEGAL_AGENT',
  'MARKETING_AGENT',
  'AUDITOR_AGENT',
  'TOKENOMICS_AGENT',
  'GROWTH_AGENT',
  'GOVERNANCE_AGENT',
  'SECURITY_AGENT',
  'RESEARCH_AGENT',
  'UX_AGENT',
  'PRODUCT_AGENT',
  'COMMUNITY_AGENT',
  'MINTING_AGENT',
  'RAG_OPS_AGENT',
];

// Basic Input Sanitization
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  let clean = input.trim();
  if (clean.length > 20000) {
    clean = clean.substring(0, 20000);
  }
  return clean;
};

export interface AgentInteractionPayload {
  agentType: AgentType | string;
  input: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface AgentInteractionResult {
  success: boolean;
  response?: string;
  error?: string;
  agentType: string;
  timestamp: string;
  metrics?: {
    latencyMs: number;
    tokenCount?: number;
  };
}

/**
 * Handle agent interaction - centralized orchestration logic
 */
export async function handleAgentInteraction(
  payload: AgentInteractionPayload
): Promise<AgentInteractionResult> {
  const startTime = Date.now();
  
  try {
    const { agentType, input, userId, sessionId, context } = payload;
    
    // Validate agent type
    const normalizedAgentType = agentType.toUpperCase() as AgentType;
    if (!VALID_AGENT_TYPES.includes(normalizedAgentType)) {
      return {
        success: false,
        error: `Invalid agent type: ${agentType}. Valid types: ${VALID_AGENT_TYPES.join(', ')}`,
        agentType: String(agentType),
        timestamp: new Date().toISOString(),
      };
    }

    // Sanitize input
    const sanitizedInput = sanitizeInput(input);
    if (!sanitizedInput) {
      return {
        success: false,
        error: 'Input is empty after sanitization',
        agentType: normalizedAgentType,
        timestamp: new Date().toISOString(),
      };
    }

    // Get or create session
    const effectiveSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Retrieve memory/context if userId provided
    let memoryContext: string | undefined;
    if (userId) {
      const memories = await agentMemoryService.getRecentMemories(userId, normalizedAgentType, 5);
      if (memories.length > 0) {
        memoryContext = memories.map(m => `[${m.role}]: ${m.content}`).join('\n');
      }
    }

    // Build messages for LLM
    const messages = [
      {
        role: 'system' as const,
        content: `You are the ${normalizedAgentType} for Money Factory AI. ${memoryContext ? '\nPrevious context:\n' + memoryContext : ''}`
      },
      {
        role: 'user' as const,
        content: sanitizedInput
      }
    ];

    // Call LLM
    const llmResponse = await callLLM(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const latencyMs = Date.now() - startTime;

    // Store interaction in memory
    if (userId) {
      await agentMemoryService.storeMemory(
        userId,
        normalizedAgentType,
        { role: 'user', content: sanitizedInput },
        { role: 'assistant', content: llmResponse }
      );
    }

    // Track metrics
    await MetricsService.trackAgentInvocation(normalizedAgentType, latencyMs, true);

    return {
      success: true,
      response: llmResponse,
      agentType: normalizedAgentType,
      timestamp: new Date().toISOString(),
      metrics: {
        latencyMs,
      },
    };

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Track failed metrics
    await MetricsService.trackAgentInvocation(
      payload.agentType as AgentType,
      latencyMs,
      false
    );

    return {
      success: false,
      error: errorMessage,
      agentType: payload.agentType,
      timestamp: new Date().toISOString(),
      metrics: {
        latencyMs,
      },
    };
  }
}

/**
 * Validate if an agent type is valid
 */
export function isValidAgentType(agentType: string): boolean {
  return VALID_AGENT_TYPES.includes(agentType.toUpperCase() as AgentType);
}

/**
 * Get list of valid agent types
 */
export function getValidAgentTypes(): readonly AgentType[] {
  return VALID_AGENT_TYPES;
}

/**
 * Batch process multiple agent interactions
 */
export async function batchAgentInteractions(
  payloads: AgentInteractionPayload[]
): Promise<AgentInteractionResult[]> {
  return Promise.all(payloads.map(payload => handleAgentInteraction(payload)));
}

export const OrchestrationService = {
  handleAgentInteraction,
  isValidAgentType,
  getValidAgentTypes,
  batchAgentInteractions,
};

export default OrchestrationService;

/**
 * Agent Controller - Express routes for agent interactions
 * Replaces Mongoose-based logic with Prisma/PostgreSQL
 */

import { Request, Response } from 'express';
import { AgentType } from '@prisma/client';
import { agentMemoryService, LLMMessage } from '../services/AgentMemoryService';
import { prisma } from '../config/database';
import { callLLM, LLMMessage as LLMMsg } from '../llm/OpenAIClient';

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

/**
 * Handle agent interaction - main entry point
 */
export const handleAgentInteraction = async (req: Request, res: Response): Promise<void> => {
  const { projectId, agentType, message } = req.body;

  // Validation
  if (!projectId || !agentType || !message) {
    res.status(400).json({
      error: 'Missing required fields: projectId, agentType, message',
    });
    return;
  }

  if (!VALID_AGENT_TYPES.includes(agentType as AgentType)) {
    res.status(400).json({
      error: `Invalid agentType. Must be one of: ${VALID_AGENT_TYPES.join(', ')}`,
    });
    return;
  }

  const startTime = Date.now();

  try {
    // 0. Validate projectId exists in database (Foreign Key integrity)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `No project exists with ID: ${projectId}`,
      });
      return;
    }

    // 1. Initialize / Retrieve session
    const session = await agentMemoryService.initSession(projectId, agentType as AgentType);

    // 2. Save user message
    await agentMemoryService.addMessage(session.id, 'user', message);

    // 3. Build context for LLM
    const messagesForLLM = await agentMemoryService.buildContextForLLM(session.id);

    // 4. Call LLM with fallback support
    const systemPrompt = `You are ${agentType} at Money Factory AI. 
Analyze the user's request and provide expert guidance.
Always respond with valid JSON containing: { "status": "OK", "reasoning": "...", "summary": "...", "actions": [...] }`;

    const llmMessages: LLMMsg[] = [
      { role: 'system', content: systemPrompt },
      ...messagesForLLM.map(m => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
    ];

    const llmResponse = await callLLM({ messages: llmMessages });
    
    const aiResponse = {
      content: llmResponse.content,
      tool_calls: null,
      fallback: llmResponse.fallback || false,
    };

    // 5. Save AI response
    await agentMemoryService.addMessage(session.id, 'assistant', aiResponse.content, aiResponse.tool_calls);

    // 6. Update state
    await agentMemoryService.updateAgentState(session.id, {
      status: 'WAITING_FOR_USER',
      lastAction: 'RESPONSE_SENT',
      lastUpdated: new Date().toISOString(),
    });

    // 7. Log action
    const latencyMs = Date.now() - startTime;
    await agentMemoryService.logAction({
      journeyId: projectId,
      agent: agentType,
      action: 'INTERACTION',
      details: { messageLength: message.length, responseLength: aiResponse.content.length },
      latencyMs,
      status: 'ok',
    });

    res.json({
      success: true,
      response: aiResponse.content,
      sessionId: session.id,
      agentType,
      latencyMs,
    });
  } catch (error: any) {
    console.error('[AgentController] Error:', error);

    await agentMemoryService.logAction({
      journeyId: projectId,
      agent: agentType,
      action: 'INTERACTION_ERROR',
      details: { error: error.message },
      status: 'error',
    }).catch(() => {});

    res.status(500).json({
      success: false,
      error: 'Internal Agent Error',
      message: error.message,
    });
  }
};

/**
 * Get session details
 */
export const getSession = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  try {
    const session = await agentMemoryService.getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all sessions for a project
 */
export const getProjectSessions = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;

  try {
    const sessions = await agentMemoryService.getProjectSessions(projectId);
    res.json({ success: true, sessions, count: sessions.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update agent state
 */
export const updateState = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const { state } = req.body;

  if (!state || typeof state !== 'object') {
    res.status(400).json({ error: 'Invalid state object' });
    return;
  }

  try {
    const session = await agentMemoryService.updateAgentState(sessionId, state);
    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Clear agent memory (hard reset)
 */
export const clearMemory = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  try {
    await agentMemoryService.clearMemory(sessionId);
    res.json({ success: true, message: 'Memory cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Build context preview (for debugging)
 */
export const previewContext = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const messageLimit = parseInt(req.query.messageLimit as string) || 20;

  try {
    const context = await agentMemoryService.buildContextForLLM(sessionId, messageLimit);
    res.json({
      success: true,
      context,
      messageCount: context.length,
      estimatedTokens: context.reduce((acc, m) => acc + (m.content?.length || 0) / 4, 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * List available agent types
 */
export const listAgentTypes = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    agentTypes: VALID_AGENT_TYPES,
    count: VALID_AGENT_TYPES.length,
  });
};

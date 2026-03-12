/**
 * AgentMemoryService - Central Brain for MFAI Agents
 * Manages conversation state and context via Prisma/PostgreSQL
 */

import { PrismaClient, AgentType, AgentSession, ChatMessage } from '@prisma/client';

const prisma = new PrismaClient();

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  tool_calls?: any;
}

export class AgentMemoryService {

  /**
   * Initialize or retrieve an existing session for a Project + Agent pair.
   */
  async initSession(projectId: string, agentType: AgentType): Promise<AgentSession> {
    // Ensure project exists first
    let project = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      // Auto-create project for standalone agent testing
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        throw new Error('No user exists. Create a user first.');
      }
      project = await prisma.project.create({
        data: {
          id: projectId,
          name: `Project ${projectId.slice(0, 8)}`,
          description: 'Auto-created project for agent session',
          status: 'DRAFT',
          phase: 'LEARN',
          ownerId: defaultUser.id,
          metadata: { autoCreated: true },
        },
      });
    }

    return await prisma.agentSession.upsert({
      where: {
        projectId_agentType: { projectId, agentType },
      },
      update: {},
      create: {
        projectId,
        agentType,
        contextSummary: `You are the ${agentType} for project ID ${projectId}.`,
        agentState: { status: 'IDLE', steps_completed: [] },
      },
    });
  }

  /**
   * Add a message to Short-Term Memory.
   */
  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    toolCalls?: any
  ): Promise<ChatMessage> {
    return await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        toolCalls: toolCalls ? (toolCalls as any) : undefined,
      },
    });
  }

  /**
   * Build the complete context for LLM consumption.
   * Strategy: Long-Term Summary + Current State + N recent messages.
   */
  async buildContextForLLM(sessionId: string, messageLimit = 20): Promise<LLMMessage[]> {
    const session = await prisma.agentSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    const recentMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
      take: messageLimit,
    });

    const chatHistory: LLMMessage[] = recentMessages.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      tool_calls: msg.toolCalls || undefined,
    }));

    const augmentedSystemPrompt: LLMMessage = {
      role: 'system',
      content: `[IDENTITY] You are the ${session.agentType} agent.
[CONTEXT] ${session.contextSummary || ''}
[STATE] ${JSON.stringify(session.agentState)}
Use history to continue.`,
    };

    return [augmentedSystemPrompt, ...chatHistory];
  }

  /**
   * Update the agent's internal state (JSON).
   */
  async updateAgentState(sessionId: string, newState: Record<string, any>): Promise<AgentSession> {
    const session = await prisma.agentSession.findUnique({ where: { id: sessionId } });
    const currentState = (session?.agentState as Record<string, any>) || {};

    return await prisma.agentSession.update({
      where: { id: sessionId },
      data: { agentState: { ...currentState, ...newState } },
    });
  }

  /**
   * Update Long-Term Memory summary.
   */
  async updateLongTermMemory(sessionId: string, newSummary: string): Promise<AgentSession> {
    return await prisma.agentSession.update({
      where: { id: sessionId },
      data: { contextSummary: newSummary },
    });
  }

  /**
   * Get session by ID with messages.
   */
  async getSession(sessionId: string): Promise<AgentSession | null> {
    return await prisma.agentSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });
  }

  /**
   * Get all sessions for a project.
   */
  async getProjectSessions(projectId: string): Promise<AgentSession[]> {
    return await prisma.agentSession.findMany({
      where: { projectId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });
  }

  /**
   * Reset memory (Hard Reset).
   */
  async clearMemory(sessionId: string): Promise<void> {
    await prisma.chatMessage.deleteMany({ where: { sessionId } });
    await prisma.agentSession.update({
      where: { id: sessionId },
      data: {
        agentState: { status: 'RESET' },
        contextSummary: 'Memory has been wiped. Starting fresh.',
      },
    });
  }

  /**
   * Log agent action for observability.
   */
  async logAction(params: {
    journeyId?: string;
    userId?: string;
    agent: string;
    action: string;
    details?: any;
    latencyMs?: number;
    status?: string;
  }) {
    return await prisma.agentLog.create({
      data: {
        journeyId: params.journeyId,
        userId: params.userId,
        agent: params.agent,
        action: params.action,
        details: params.details,
        latencyMs: params.latencyMs,
        status: params.status || 'ok',
      },
    });
  }

  /**
   * Get recent memories for a user and agent type.
   * Used by OrchestrationService for context retrieval.
   */
  async getRecentMemories(
    userId: string,
    agentType: string,
    limit: number = 5
  ): Promise<Array<{ role: string; content: string; timestamp?: Date }>> {
    const sessions = await prisma.agentSession.findMany({
      where: {
        agentType: agentType as any,
        project: {
          ownerId: userId,
        },
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: limit,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 1,
    });

    if (sessions.length === 0 || sessions[0].messages.length === 0) {
      return [];
    }

    return sessions[0].messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  }

  /**
   * Store a memory (user message and assistant response) for a user.
   * Used by OrchestrationService to persist interactions.
   */
  async storeMemory(
    userId: string,
    agentType: string,
    userMessage: { role: string; content: string },
    assistantMessage: { role: string; content: string }
  ): Promise<void> {
    // Find or create a project for this user
    let project = await prisma.project.findFirst({
      where: { ownerId: userId },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: `Project for ${userId.slice(0, 8)}`,
          description: 'Auto-created project for memory storage',
          status: 'DRAFT',
          phase: 'LEARN',
          ownerId: userId,
          metadata: {},
        },
      });
    }

    // Get or create session
    const session = await this.initSession(project.id, agentType as AgentType);

    // Add messages
    await this.addMessage(session.id, userMessage.role as any, userMessage.content);
    await this.addMessage(session.id, assistantMessage.role as any, assistantMessage.content);
  }
}

// Singleton export
export const agentMemoryService = new AgentMemoryService();

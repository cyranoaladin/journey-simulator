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
}

// Singleton export
export const agentMemoryService = new AgentMemoryService();

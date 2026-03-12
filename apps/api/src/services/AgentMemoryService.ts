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
   * Returns recent messages from all sessions for this user + agent combination.
   */
  async getRecentMemories(
    userId: string,
    agentType: AgentType,
    limit = 5
  ): Promise<Array<{ role: string; content: string; timestamp: Date }>> {
    const sessions = await prisma.agentSession.findMany({
      where: {
        agentType,
        project: {
          ownerId: userId,
        },
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    const sessionIds = sessions.map(s => s.id);

    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: { in: sessionIds },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }));
  }

  /**
   * Store a memory (user message + assistant response) in the appropriate session.
   */
  async storeMemory(
    userId: string,
    agentType: AgentType,
    userMessage: { role: string; content: string },
    assistantMessage: { role: string; content: string }
  ): Promise<void> {
    // Find or create a session for this user + agent
    let session = await prisma.agentSession.findFirst({
      where: {
        agentType,
        project: {
          ownerId: userId,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!session) {
      // Create a default project and session
      const defaultUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!defaultUser) {
        throw new Error(`User ${userId} not found`);
      }

      const project = await prisma.project.create({
        data: {
          name: `Auto Project ${Date.now()}`,
          description: 'Auto-created for memory storage',
          status: 'DRAFT',
          phase: 'LEARN',
          ownerId: userId,
        },
      });

      session = await prisma.agentSession.create({
        data: {
          projectId: project.id,
          agentType,
          contextSummary: `Session for ${agentType}`,
          agentState: { status: 'ACTIVE' },
        },
      });
    }

    // Store both messages
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: userMessage.role as 'user' | 'assistant' | 'system',
          content: userMessage.content,
        },
        {
          sessionId: session.id,
          role: assistantMessage.role as 'user' | 'assistant' | 'system',
          content: assistantMessage.content,
        },
      ],
    });
  }
}

// Singleton export
export const agentMemoryService = new AgentMemoryService();

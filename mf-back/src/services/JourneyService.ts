/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * JourneyService - Real Mode Progress Management
 */

import { prisma } from '../config/database';
import type { JourneyProgress, Artifact, AgentSession } from '@prisma/client';

export interface ProgressData {
  total_xp?: number;
  current_level?: number;
  completed_phases?: number[];
  nft_certificates?: Array<{ title: string; mintAddress?: string }>;
  mfai_tokens?: number;
  staked_mfai?: number;
  voting_power?: number;
  pass_level?: string;
}

export interface PhaseCompletionData {
  phase_number: number;
  score?: number;
  nft_address?: string;
  xp_reward?: number;
  mfai_reward?: number;
  nft_reward?: string;
  title?: string;
  description?: string;
  image_url?: string;
  rarity?: string;
}

export interface ArtifactData {
  title: string;
  content: string;
  phaseId: string;
  artifactType: string;
  metadata?: any;
}

export class JourneyService {
  static async getUserProgress(userId: string, personaId: string): Promise<JourneyProgress> {
    try {
      let progress = await prisma.journeyProgress.findUnique({
        where: { userId_personaId: { userId, personaId } },
      });

      if (!progress) {
        progress = await prisma.journeyProgress.create({
          data: {
            userId, personaId, currentPhase: 0, completedPhases: [],
            totalXP: 0, mfaiTokens: 0, stakedMfai: 0, votingPower: 0,
            nfts: [], passLevel: 'STARTER', progressData: {},
          },
        });
      }
      return progress;
    } catch (error) {
      console.error('[JourneyService] getUserProgress error:', error);
      throw error;
    }
  }

  static async updateProgress(userId: string, personaId: string, data: ProgressData): Promise<JourneyProgress> {
    try {
      const current = await this.getUserProgress(userId, personaId);
      const updateData: any = {};

      if (data.total_xp !== undefined) updateData.totalXP = data.total_xp;
      if (data.completed_phases !== undefined) {
        updateData.completedPhases = data.completed_phases;
        updateData.currentPhase = Math.max(...data.completed_phases, 0);
      }
      if (data.mfai_tokens !== undefined) updateData.mfaiTokens = data.mfai_tokens;
      if (data.staked_mfai !== undefined) updateData.stakedMfai = data.staked_mfai;
      if (data.voting_power !== undefined) updateData.votingPower = data.voting_power;
      if (data.pass_level !== undefined) updateData.passLevel = data.pass_level;
      if (data.nft_certificates !== undefined) {
        const nftAddresses = data.nft_certificates.map(cert => cert.mintAddress).filter(Boolean) as string[];
        updateData.nfts = [...new Set([...current.nfts, ...nftAddresses])];
      }

      return await prisma.journeyProgress.update({
        where: { userId_personaId: { userId, personaId } },
        data: updateData,
      });
    } catch (error) {
      console.error('[JourneyService] updateProgress error:', error);
      throw error;
    }
  }

  static async completePhase(userId: string, personaId: string, phaseData: PhaseCompletionData): Promise<JourneyProgress> {
    try {
      const current = await this.getUserProgress(userId, personaId);
      const completedPhases = [...current.completedPhases];
      if (!completedPhases.includes(phaseData.phase_number)) {
        completedPhases.push(phaseData.phase_number);
      }

      const newXP = current.totalXP + (phaseData.xp_reward || 0);
      const newMFAI = current.mfaiTokens + (phaseData.mfai_reward || 0);
      const nfts = [...current.nfts];
      if (phaseData.nft_address && !nfts.includes(phaseData.nft_address)) {
        nfts.push(phaseData.nft_address);
      }

      const passLevel = this.calculatePassLevel(newXP, completedPhases.length);

      return await prisma.journeyProgress.update({
        where: { userId_personaId: { userId, personaId } },
        data: {
          completedPhases,
          currentPhase: Math.max(...completedPhases),
          totalXP: newXP,
          mfaiTokens: newMFAI,
          nfts,
          passLevel,
        },
      });
    } catch (error) {
      console.error('[JourneyService] completePhase error:', error);
      throw error;
    }
  }

  static async createArtifact(userId: string, personaId: string, artifactData: ArtifactData): Promise<Artifact> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      let project = await prisma.project.findFirst({
        where: { ownerId: userId, metadata: { path: ['personaId'], equals: personaId } },
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            name: `${personaId} Journey`, description: `Journey artifacts for ${personaId}`,
            ownerId: userId, status: 'IN_PROGRESS', phase: 'BUILD', metadata: { personaId },
          },
        });
      }

      return await prisma.artifact.create({
        data: {
          title: artifactData.title,
          content: artifactData.content,
          type: 'TEMPLATE',
          metadata: {
            ...(artifactData.metadata || {}),
            phaseId: artifactData.phaseId,
            artifactType: artifactData.artifactType,
          },
          projectId: project.id,
        },
      });
    } catch (error) {
      console.error('[JourneyService] createArtifact error:', error);
      throw error;
    }
  }

  static async getHistory(userId: string, personaId: string, limit = 50): Promise<AgentSession[]> {
    try {
      const project = await prisma.project.findFirst({
        where: { ownerId: userId, metadata: { path: ['personaId'], equals: personaId } },
        include: {
          agentSessions: {
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { messages: { orderBy: { timestamp: 'asc' } } },
          },
        },
      });
      return project?.agentSessions || [];
    } catch (error) {
      console.error('[JourneyService] getHistory error:', error);
      throw error;
    }
  }

  static async getArtifacts(userId: string, personaId: string): Promise<Artifact[]> {
    try {
      const project = await prisma.project.findFirst({
        where: { ownerId: userId, metadata: { path: ['personaId'], equals: personaId } },
        include: { artifacts: { orderBy: { createdAt: 'desc' } } },
      });
      return project?.artifacts || [];
    } catch (error) {
      console.error('[JourneyService] getArtifacts error:', error);
      throw error;
    }
  }

  static async resetProgress(userId: string, personaId: string): Promise<void> {
    try {
      await prisma.journeyProgress.deleteMany({ where: { userId, personaId } });
      const project = await prisma.project.findFirst({
        where: { ownerId: userId, metadata: { path: ['personaId'], equals: personaId } },
      });
      if (project) {
        await prisma.artifact.deleteMany({ where: { projectId: project.id } });
        await prisma.agentSession.deleteMany({ where: { projectId: project.id } });
      }
    } catch (error) {
      console.error('[JourneyService] resetProgress error:', error);
      throw error;
    }
  }

  static async getUserJourneys(userId: string): Promise<JourneyProgress[]> {
    try {
      return await prisma.journeyProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      console.error('[JourneyService] getUserJourneys error:', error);
      throw error;
    }
  }

  private static calculatePassLevel(totalXP: number, completedPhases: number): string {
    if (totalXP >= 1000 || completedPhases >= 6) return 'ELITE';
    if (totalXP >= 500 || completedPhases >= 4) return 'ADVANCED';
    if (totalXP >= 200 || completedPhases >= 2) return 'INTERMEDIATE';
    return 'STARTER';
  }
}

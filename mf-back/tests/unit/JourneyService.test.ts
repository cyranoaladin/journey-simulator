/**
 * Unit Tests: JourneyService
 * Tests all CRUD operations for Real Mode journey progress
 */

import { JourneyService } from '../../src/services/JourneyService';
import { prisma } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  prisma: {
    journeyProgress: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    artifact: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    agentSession: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    project: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('JourneyService - Real Mode Progress Management', () => {
  const mockUserId = 'user-test-123';
  const mockPersonaId = 'cognitive-activation-hub';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProgress', () => {
    it('should return existing journey progress', async () => {
      const mockProgress = {
        userId: mockUserId,
        personaId: mockPersonaId,
        currentPhase: 2,
        completedPhases: [0, 1],
        totalXP: 500,
        mfaiTokens: 100,
        stakedMfai: 50,
        votingPower: 150,
        nfts: ['nft-address-1'],
        passLevel: 'INTERMEDIATE',
        progressData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.journeyProgress.findUnique as jest.Mock).mockResolvedValue(mockProgress);

      const result = await JourneyService.getUserProgress(mockUserId, mockPersonaId);

      expect(result).toEqual(mockProgress);
      expect(prisma.journeyProgress.findUnique).toHaveBeenCalledWith({
        where: { userId_personaId: { userId: mockUserId, personaId: mockPersonaId } },
      });
    });

    it('should auto-create progress if not exists', async () => {
      const newProgress = {
        userId: mockUserId,
        personaId: mockPersonaId,
        currentPhase: 0,
        completedPhases: [],
        totalXP: 0,
        mfaiTokens: 0,
        stakedMfai: 0,
        votingPower: 0,
        nfts: [],
        passLevel: 'STARTER',
        progressData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.journeyProgress.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.journeyProgress.create as jest.Mock).mockResolvedValue(newProgress);

      const result = await JourneyService.getUserProgress(mockUserId, mockPersonaId);

      expect(result).toEqual(newProgress);
      expect(prisma.journeyProgress.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          personaId: mockPersonaId,
          currentPhase: 0,
          completedPhases: [],
          totalXP: 0,
          mfaiTokens: 0,
          stakedMfai: 0,
          votingPower: 0,
          nfts: [],
          passLevel: 'STARTER',
          progressData: {},
        },
      });
    });
  });

  describe('updateProgress', () => {
    it('should update XP and tokens', async () => {
      const currentProgress = {
        userId: mockUserId,
        personaId: mockPersonaId,
        currentPhase: 1,
        completedPhases: [0],
        totalXP: 100,
        mfaiTokens: 25,
        stakedMfai: 0,
        votingPower: 0,
        nfts: [],
        passLevel: 'STARTER',
        progressData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProgress = { ...currentProgress, totalXP: 300, mfaiTokens: 75 };

      (prisma.journeyProgress.findUnique as jest.Mock).mockResolvedValue(currentProgress);
      (prisma.journeyProgress.update as jest.Mock).mockResolvedValue(updatedProgress);

      const result = await JourneyService.updateProgress(mockUserId, mockPersonaId, {
        total_xp: 300,
        mfai_tokens: 75,
      });

      expect(result.totalXP).toBe(300);
      expect(result.mfaiTokens).toBe(75);
      expect(prisma.journeyProgress.update).toHaveBeenCalled();
    });
  });

  describe('completePhase', () => {
    it('should add phase to completedPhases and award rewards', async () => {
      const currentProgress = {
        userId: mockUserId,
        personaId: mockPersonaId,
        currentPhase: 1,
        completedPhases: [0],
        totalXP: 100,
        mfaiTokens: 25,
        stakedMfai: 0,
        votingPower: 0,
        nfts: [],
        passLevel: 'STARTER',
        progressData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProgress = {
        ...currentProgress,
        completedPhases: [0, 1],
        currentPhase: 1,
        totalXP: 200,
        mfaiTokens: 50,
      };

      (prisma.journeyProgress.findUnique as jest.Mock).mockResolvedValue(currentProgress);
      (prisma.journeyProgress.update as jest.Mock).mockResolvedValue(updatedProgress);

      const result = await JourneyService.completePhase(mockUserId, mockPersonaId, {
        phase_number: 1,
        xp_reward: 100,
        mfai_reward: 25,
      });

      expect(result.completedPhases).toContain(1);
      expect(result.totalXP).toBe(200);
      expect(result.mfaiTokens).toBe(50);
    });
  });

  describe('resetProgress', () => {
    it('should delete journey progress and related data', async () => {
      (prisma.journeyProgress.delete as jest.Mock).mockResolvedValue({});
      (prisma.artifact.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });
      (prisma.agentSession.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });

      await JourneyService.resetProgress(mockUserId, mockPersonaId);

      expect(prisma.artifact.deleteMany).toHaveBeenCalled();
      expect(prisma.agentSession.deleteMany).toHaveBeenCalled();
      expect(prisma.journeyProgress.delete).toHaveBeenCalledWith({
        where: { userId_personaId: { userId: mockUserId, personaId: mockPersonaId } },
      });
    });
  });
});

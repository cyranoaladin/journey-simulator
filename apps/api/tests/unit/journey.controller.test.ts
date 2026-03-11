/**
 * Unit Tests: JourneyController
 * Tests all Real Mode endpoints with mocked service layer
 */

import { Request, Response } from 'express';
import { JourneyController } from '../../src/controllers/journey.controller';
import { JourneyService } from '../../src/services/JourneyService';

jest.mock('../../src/services/JourneyService');

describe('JourneyController - Real Mode Endpoints', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      user: { id: 'test-user-123' },
      query: {},
      body: {},
    } as any;

    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  describe('getUserProgress', () => {
    it('should return user progress successfully', async () => {
      const mockProgress = {
        userId: 'test-user-123',
        personaId: 'cognitive-activation-hub',
        currentPhase: 2,
        completedPhases: [0, 1],
        totalXP: 500,
        mfaiTokens: 100,
        stakedMfai: 50,
        votingPower: 150,
        nfts: ['nft-1'],
        passLevel: 'INTERMEDIATE',
        progressData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (JourneyService.getUserProgress as jest.Mock).mockResolvedValue(mockProgress);
      mockReq.query = { personaId: 'cognitive-activation-hub' };

      await JourneyController.getUserProgress(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        progress: expect.objectContaining({
          total_xp: 500,
          mfai_tokens: 100,
          pass_level: 'INTERMEDIATE',
        }),
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq.user = undefined;

      await JourneyController.getUserProgress(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return 400 if personaId missing', async () => {
      mockReq.query = {};

      await JourneyController.getUserProgress(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'personaId required',
      });
    });
  });

  describe('updateProgress', () => {
    it('should update progress successfully', async () => {
      const updatedProgress = {
        userId: 'test-user-123',
        personaId: 'cognitive-activation-hub',
        currentPhase: 3,
        completedPhases: [0, 1, 2],
        totalXP: 800,
        mfaiTokens: 200,
        stakedMfai: 50,
        votingPower: 150,
        nfts: [],
        passLevel: 'ADVANCED',
        progressData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (JourneyService.updateProgress as jest.Mock).mockResolvedValue(updatedProgress);
      mockReq.body = {
        personaId: 'cognitive-activation-hub',
        total_xp: 800,
        mfai_tokens: 200,
      };

      await JourneyController.updateProgress(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        progress: expect.objectContaining({
          total_xp: 800,
          mfai_tokens: 200,
        }),
      });
    });
  });

  describe('completePhase', () => {
    it('should complete phase successfully', async () => {
      const completedProgress = {
        userId: 'test-user-123',
        personaId: 'cognitive-activation-hub',
        currentPhase: 2,
        completedPhases: [0, 1, 2],
        totalXP: 600,
        mfaiTokens: 150,
        stakedMfai: 0,
        votingPower: 0,
        nfts: [],
        passLevel: 'INTERMEDIATE',
        progressData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (JourneyService.completePhase as jest.Mock).mockResolvedValue(completedProgress);
      mockReq.body = {
        personaId: 'cognitive-activation-hub',
        phase_number: 2,
        xp_reward: 100,
        mfai_reward: 25,
      };

      await JourneyController.completePhase(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Phase 2 completed',
        progress: expect.objectContaining({
          total_xp: 600,
        }),
      });
    });

    it('should return 400 if phase_number missing', async () => {
      mockReq.body = { personaId: 'cognitive-activation-hub' };

      await JourneyController.completePhase(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'personaId and phase_number required',
      });
    });
  });

  describe('resetProgress', () => {
    it('should reset progress successfully', async () => {
      (JourneyService.resetProgress as jest.Mock).mockResolvedValue(undefined);
      mockReq.body = { personaId: 'cognitive-activation-hub' };

      await JourneyController.resetProgress(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Progress reset successfully',
      });
      expect(JourneyService.resetProgress).toHaveBeenCalledWith(
        'test-user-123',
        'cognitive-activation-hub'
      );
    });
  });

  describe('getHistory', () => {
    it('should return session history', async () => {
      const mockHistory = [
        {
          id: 'session-1',
          userId: 'test-user-123',
          agentType: 'curriculum', // Align with controller mapping
          personaId: 'cognitive-activation-hub',
          messages: [{ role: 'user', content: 'Test question' }],
          createdAt: new Date(),
        },
      ];

      (JourneyService.getHistory as jest.Mock).mockResolvedValue(mockHistory);
      mockReq.query = { personaId: 'cognitive-activation-hub' };

      await JourneyController.getHistory(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        history: [
          {
            id: 'session-1',
            agentType: 'curriculum',
            messages: [{ role: 'user', content: 'Test question' }],
            createdAt: expect.any(Date),
          }
        ],
      });
    });
  });

  describe('getArtifacts', () => {
    it('should return journey artifacts', async () => {
      const mockArtifacts = [
        {
          id: 'artifact-1',
          userId: 'test-user-123',
          personaId: 'cognitive-activation-hub',
          title: 'Phase 1 Project',
          content: 'Project content',
          artifactType: 'curriculum',
          metadata: { phaseId: 'phase-1', artifactType: 'curriculum' },
          createdAt: new Date(),
        },
      ];

      (JourneyService.getArtifacts as jest.Mock).mockResolvedValue(mockArtifacts);
      mockReq.query = { personaId: 'cognitive-activation-hub' };

      await JourneyController.getArtifacts(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        artifacts: [
          {
            id: 'artifact-1',
            title: 'Phase 1 Project',
            content: 'Project content',
            artifactType: 'curriculum',
            phaseId: 'phase-1',
            metadata: { phaseId: 'phase-1', artifactType: 'curriculum' },
            createdAt: expect.any(Date),
          }
        ],
      });
    });
  });
});

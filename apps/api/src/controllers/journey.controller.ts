/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Journey Controller - Real Mode Endpoints
 */

import { Request, Response } from 'express';
import { JourneyService } from '../services/JourneyService';
import { MetricsService } from '../services/MetricsService';

export class JourneyController {
  static async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { personaId } = req.query;
      if (!personaId || typeof personaId !== 'string') {
        res.status(400).json({ success: false, message: 'personaId required' });
        return;
      }

      const progress = await JourneyService.getUserProgress(userId, personaId);

      res.status(200).json({
        success: true,
        progress: {
          total_xp: progress.totalXP,
          completed_phases: progress.completedPhases,
          mfai_tokens: progress.mfaiTokens,
          staked_mfai: progress.stakedMfai,
          voting_power: progress.votingPower,
          nft_certificates: progress.nfts.map(addr => ({ title: 'NFT', mintAddress: addr })),
          pass_level: progress.passLevel,
          current_phase: progress.currentPhase,
          persona_id: progress.personaId,
        },
      });
    } catch (error) {
      console.error('[JourneyController] getUserProgress error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { personaId, ...progressData } = req.body;
      if (!personaId) {
        res.status(400).json({ success: false, message: 'personaId required' });
        return;
      }

      const updated = await JourneyService.updateProgress(userId, personaId, progressData);

      res.status(200).json({
        success: true,
        progress: {
          total_xp: updated.totalXP,
          completed_phases: updated.completedPhases,
          mfai_tokens: updated.mfaiTokens,
        },
      });
    } catch (error) {
      console.error('[JourneyController] updateProgress error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async completePhase(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { personaId, phase_number, ...phaseData } = req.body;
      if (!personaId || phase_number === undefined) {
        res.status(400).json({ success: false, message: 'personaId and phase_number required' });
        return;
      }

      const updated = await JourneyService.completePhase(userId, personaId, {
        phase_number,
        ...phaseData,
      });

      res.status(200).json({
        success: true,
        message: `Phase ${phase_number} completed`,
        progress: {
          total_xp: updated.totalXP,
          completed_phases: updated.completedPhases,
          mfai_tokens: updated.mfaiTokens,
          nfts: updated.nfts,
        },
      });
    } catch (error) {
      console.error('[JourneyController] completePhase error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { personaId } = req.query;
      if (!personaId || typeof personaId !== 'string') {
        res.status(400).json({ success: false, message: 'personaId required' });
        return;
      }

      const history = await JourneyService.getHistory(userId, personaId);

      res.status(200).json({
        success: true,
        history: history.map(session => ({
          id: session.id,
          agentType: session.agentType,
          createdAt: session.createdAt,
          messages: (session as any).messages || [],
        })),
      });
    } catch (error) {
      console.error('[JourneyController] getHistory error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getArtifacts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { personaId } = req.query;
      if (!personaId || typeof personaId !== 'string') {
        res.status(400).json({ success: false, message: 'personaId required' });
        return;
      }

      const artifacts = await JourneyService.getArtifacts(userId, personaId);

      res.status(200).json({
        success: true,
        artifacts: artifacts.map(art => ({
          id: art.id,
          title: art.title,
          content: art.content,
          artifactType: (art.metadata as any)?.artifactType || 'TEMPLATE',
          phaseId: (art.metadata as any)?.phaseId,
          createdAt: art.createdAt,
          metadata: art.metadata,
        })),
      });
    } catch (error) {
      console.error('[JourneyController] getArtifacts error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async resetProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { personaId } = req.body;
      if (!personaId) {
        res.status(400).json({ success: false, message: 'personaId required' });
        return;
      }

      await JourneyService.resetProgress(userId, personaId);

      res.status(200).json({
        success: true,
        message: 'Progress reset successfully',
      });
    } catch (error) {
      console.error('[JourneyController] resetProgress error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserJourneys(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const journeys = await JourneyService.getUserJourneys(userId);

      res.status(200).json({
        success: true,
        journeys: journeys.map(j => ({
          personaId: j.personaId,
          currentPhase: j.currentPhase,
          completedPhases: j.completedPhases,
          totalXP: j.totalXP,
          passLevel: j.passLevel,
          updatedAt: j.updatedAt,
        })),
      });
    } catch (error) {
      console.error('[JourneyController] getUserJourneys error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async interactiveStep(req: Request, res: Response): Promise<void> {
    let userId = '';
    try {
      userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { journeyId } = req.params;
      const { phaseId, userAction, payload, userInput } = req.body;

      if (!phaseId) {
        res.status(400).json({ success: false, message: 'phaseId required' });
        return;
      }

      const zynoSlice = require('../orchestration/zynoVerticalSlice');

      const start = Date.now();
      const zynoPayload = {
        journey: journeyId,
        phase: phaseId,
        userInput: userInput || userAction || '',
        userId,
        tenantId: userId,
        runId: `${journeyId}-${phaseId}-${Date.now()}`,
        ...payload,
      };

      const response = await zynoSlice.orchestrateVerticalSlice(zynoPayload);
      const latency = Date.now() - start;

      MetricsService.recordRun(userId, 'OK', latency, 'LIVE');

      res.status(200).json({
        success: true,
        metadata: response.metadata || {},
        ui_blocks: response.ui_blocks || [],
        agent_actions: response.agent_actions || [],
        resources: response.resources || [],
        next_state: response.next_state || {},
      });
    } catch (error) {
      console.error('[JourneyController] interactiveStep error:', error);
      res.status(500).json({
        success: false,
        message: 'Zyno orchestration error',
        error: (error as Error).message,
      });
      // Observability
      MetricsService.recordRun(userId, 'FAIL', 0, 'LIVE');
    }
  }

  static async submitMission(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { journeyId } = req.params;
      const { phaseId, deliverableLink, text, personaId } = req.body;

      if (!phaseId) {
        res.status(400).json({ success: false, message: 'phaseId required' });
        return;
      }

      const artifact = await JourneyService.createArtifact(
        userId,
        personaId || journeyId,
        {
          title: `Mission ${phaseId}`,
          content: text || deliverableLink || '',
          phaseId,
          artifactType: 'mission_submission',
          metadata: { deliverableLink, submittedAt: new Date().toISOString() },
        }
      );

      MetricsService.recordRun(userId, 'OK', 0, 'SUBMIT' as any); // Using 'SUBMIT' mode hack or need to update type

      res.status(200).json({
        success: true,
        message: 'Mission submitted successfully',
        artifact: {
          id: artifact.id,
          title: artifact.title,
          phaseId: (artifact.metadata as any)?.phaseId,
        },
      });
    } catch (error) {
      console.error('[JourneyController] submitMission error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

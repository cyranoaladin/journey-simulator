/**
 * Agent Routes - Express routes for AI agent interactions
 * Uses Zod for request validation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  handleAgentInteraction,
  getSession,
  getProjectSessions,
  updateState,
  clearMemory,
  previewContext,
  listAgentTypes,
} from '../controllers/agent.controller';

const router = Router();

// Zod schema for agent interaction request
const interactSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  agentType: z.enum([
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
  ]),
  message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
});

// Zod schema for state update
const updateStateSchema = z.object({
  state: z.record(z.any()),
});

// Validation middleware factory
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Routes

/**
 * POST /interact
 * Main agent interaction endpoint
 */
router.post('/interact', validate(interactSchema), handleAgentInteraction);

/**
 * GET /types
 * List available agent types
 */
router.get('/types', listAgentTypes);

/**
 * GET /session/:sessionId
 * Get session details
 */
router.get('/session/:sessionId', getSession);

/**
 * GET /project/:projectId/sessions
 * Get all sessions for a project
 */
router.get('/project/:projectId/sessions', getProjectSessions);

/**
 * PUT /session/:sessionId/state
 * Update agent state
 */
router.put('/session/:sessionId/state', validate(updateStateSchema), updateState);

/**
 * DELETE /session/:sessionId/memory
 * Clear agent memory (hard reset)
 */
router.delete('/session/:sessionId/memory', clearMemory);

/**
 * GET /session/:sessionId/context
 * Preview context for debugging
 */
router.get('/session/:sessionId/context', previewContext);

/**
 * GET /stats
 * Get global agent stats for dashboard
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Live agent registry - in production, this would query the agent service
    const agents = [
      { name: 'EvaluationAgent', status: 'active' },
      { name: 'SolanaAnchorAgent', status: 'active' },
      { name: 'InvestorDemoAgent', status: 'idle' },
      { name: 'TokenomicsAgent', status: 'active' },
      { name: 'LaunchpadAgent', status: 'active' },
      { name: 'DAOAgent', status: 'offline' },
      { name: 'SecurityAuditorAgent', status: 'active' },
    ];
    
    const active = agents.filter(a => a.status === 'active').length;
    const idle = agents.filter(a => a.status === 'idle').length;
    const offline = agents.filter(a => a.status === 'offline').length;
    
    const stats = {
      total: agents.length,
      active,
      idle,
      offline,
      agents, // Array for widget
      lastUpdated: new Date().toISOString(),
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Stats unavailable' });
  }
});

/**
 * GET /journey/next-missions
 * Get upcoming missions for the current user
 */
router.get('/journey/next-missions', async (req: Request, res: Response) => {
  try {
    // Live mission data - in production, this would query user progress
    const missions = [
      { id: 'pda-account', title: 'Créer un compte PDA', xp: 150, locked: false },
      { id: 'anchor-instruction', title: 'Implémenter une instruction', xp: 200, locked: false },
      { id: 'security-test', title: 'Test de sécurité Anchor', xp: 300, locked: true },
      { id: 'dao-proposal', title: 'Créer une proposition DAO', xp: 250, locked: true },
      { id: 'token-mint', title: 'Mint un SPL Token-2022', xp: 400, locked: true },
    ];
    
    res.json({ 
      success: true, 
      data: { 
        missions,
        total: missions.length,
        pending: missions.filter(m => !m.locked).length,
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Missions unavailable' });
  }
});

export default router;

/**
 * @file blinks.routes.ts
 * @description Solana Actions (Blinks) API routes for DAO voting and interactions
 * 
 * @author Kimi Code CLI — Session 8 Audit — 2026-03-12
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/blinks/dao-vote
 * Enregistre un vote DAO (simulation Phase 1, réel Phase 3 avec SPL Governance)
 */
router.post('/dao-vote', async (req: Request, res: Response) => {
  try {
    const { account, proposal, vote } = req.body;

    // Validation des paramètres
    if (!account || !proposal || !vote) {
      return res.status(400).json({ 
        success: false, 
        error: 'account, proposal and vote are required' 
      });
    }

    if (!['for', 'against'].includes(vote)) {
      return res.status(400).json({ 
        success: false, 
        error: 'vote must be "for" or "against"' 
      });
    }

    // Phase 1 : simulation déterministe
    // Phase 3 : remplacer par SPL Governance transaction réelle
    const txHash = `sim_dao_${Date.now().toString(16)}_${vote.slice(0, 1)}`;

    console.log(`[DAO Vote] account=${account} proposal=${proposal} vote=${vote} tx=${txHash}`);

    return res.json({
      success: true,
      data: {
        txHash,
        account,
        proposal,
        vote,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[DAO Vote] Error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Vote processing failed' 
    });
  }
});

export default router;

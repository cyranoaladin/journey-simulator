/**
 * @file cnft.routes.ts
 * @description Routes API pour les opérations cNFT (compressed NFTs)
 * 
 * @author Kimi Code CLI — Phase 3 — 2026-03-12
 */

import { Router, Request, Response } from 'express';
import { mintProofOfSkillCNFT, getCNFTServiceStatus, CNFTPayload } from '../services/cnftService';

const router = Router();

/**
 * POST /api/cnft/mint
 * Mint un Proof-of-Skill cNFT pour un utilisateur.
 * 
 * Body: CNFTPayload
 * Response: CNFTReturn
 */
router.post('/mint', async (req: Request, res: Response) => {
  try {
    const payload: CNFTPayload = req.body;
    
    // Validation minimale
    if (!payload.recipient || !payload.phase || typeof payload.score !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Paramètres requis: recipient, phase, score',
      });
    }

    const result = await mintProofOfSkillCNFT(payload);
    res.json(result);
  } catch (error) {
    console.error('[cNFT Route] Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors du mint',
    });
  }
});

/**
 * GET /api/cnft/status
 * Retourne le status du service cNFT.
 */
router.get('/status', (_req: Request, res: Response) => {
  const status = getCNFTServiceStatus();
  res.json(status);
});

/**
 * GET /api/cnft/wallet/:address
 * Récupère les cNFTs d'un wallet (Phase 4).
 */
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    // TODO Phase 4 : Implémenter getWalletCNFTs
    res.json({
      success: true,
      data: [],
      message: 'Phase 4 : Lecture cNFTs à implémenter',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des cNFTs',
    });
  }
});

export default router;

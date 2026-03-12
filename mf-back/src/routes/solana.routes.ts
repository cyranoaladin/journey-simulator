/**
 * @file solana.routes.ts
 * @description Routes pour le mint Solana (simulate + execute)
 * Pont entre le format attendu par NFTMintingModal et cnftService
 * 
 * @author Kimi Code CLI — Session 11 — 2026-03-12
 */

import { Router, Request, Response } from 'express';
import { mintProofOfSkillCNFT, CNFTPayload } from '../services/cnftService';

const router = Router();

/**
 * POST /solana/mint/simulate
 * Valide le payload et estime les frais avant mint
 */
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { recipient, name, symbol, uri } = req.body;

    if (!recipient || !name) {
      return res.status(400).json({ ok: false, error: 'recipient and name are required' });
    }

    // Phase 1 : simulation déterministe (frais fixes)
    // Phase 4 : calculer les vrais frais Light Protocol
    return res.json({
      ok: true,
      sim: {
        ok: true,
        estFeeLamports: 5000,
        riskScore: 0.05,
        network: process.env.SOLANA_CLUSTER ?? 'devnet',
        recipient,
        name,
        symbol: symbol ?? 'MFAI',
        uri: uri ?? 'https://assets.moneyfactory.ai/metadata/default.json',
      },
    });
  } catch (err) {
    console.error('[solana/mint/simulate] Error:', err);
    return res.status(500).json({ ok: false, error: 'Simulation failed' });
  }
});

/**
 * POST /solana/mint/execute
 * Exécute le mint cNFT via cnftService
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { recipient, name, symbol, uri } = req.body;

    if (!recipient || !name) {
      return res.status(400).json({ ok: false, error: 'recipient and name are required' });
    }

    const payload: CNFTPayload = {
      recipient,
      phase: req.body.phase?.toString() ?? 'learn',
      score: req.body.score ?? 75,
      journeyId: req.body.journeyId ?? 'default-journey',
      metadata: {
        name: name,
        description: req.body.description ?? `Proof of Skill - ${name}`,
        imageUrl: uri ?? 'https://assets.moneyfactory.ai/metadata/default.json',
        attributes: [
          { trait_type: 'Phase', value: req.body.phase?.toString() ?? 'learn' },
          { trait_type: 'Score', value: req.body.score ?? 75 },
          { trait_type: 'Symbol', value: symbol ?? 'MFAI' },
        ],
      },
    };

    const result = await mintProofOfSkillCNFT(payload);

    if (!result.success) {
      return res.status(500).json({
        ok: false,
        error: result.error ?? 'Mint failed',
        simulation: result.simulation,
      });
    }

    return res.json({
      ok: true,
      tx: {
        txSig:       result.txHash,
        mintAddress: result.mintAddress,
      },
    });
  } catch (err) {
    console.error('[solana/mint/execute] Error:', err);
    return res.status(500).json({ ok: false, error: 'Execution failed' });
  }
});

/**
 * GET /solana/mint/status/:jobId
 * Retourne le statut d'un job de mint (Phase 1 : toujours completed)
 */
router.get('/status/:jobId', (req: Request, res: Response) => {
  return res.json({
    ok: true,
    jobId: req.params.jobId,
    status: 'completed',
  });
});

export default router;

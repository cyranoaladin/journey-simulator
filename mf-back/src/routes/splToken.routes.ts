/**
 * @file splToken.routes.ts
 * @description Routes API pour les opérations SPL Token ($MFAI)
 * 
 * @author Kimi Code CLI — Phase 4 — 2026-03-12
 */

import { Router, Request, Response } from 'express';
import {
  transferMFAI,
  rewardUser,
  getMFAIBalance,
  getSPLTokenStatus,
  createMFAIToken,
  TransferPayload,
} from '../services/splTokenService';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

/**
 * GET /api/token/status
 * Status du service SPL Token et configuration $MFAI
 */
router.get('/status', (_req: Request, res: Response) => {
  const status = getSPLTokenStatus();
  res.json({
    success: true,
    data: status,
  });
});

/**
 * POST /api/token/transfer
 * Transfère des tokens $MFAI (authentification requise)
 * 
 * Body: { recipient: string, amount: number, reason?: string }
 */
router.post('/transfer', protect, async (req: Request, res: Response) => {
  try {
    const payload: TransferPayload = {
      recipient: req.body.recipient,
      amount: req.body.amount,
      reason: req.body.reason || 'Transfer',
    };

    // Validation
    if (!payload.recipient || !payload.amount || payload.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres requis: recipient (string), amount (number > 0)',
      });
    }

    const result = await transferMFAI(payload);
    res.json(result);
  } catch (error) {
    console.error('[Token Route] Erreur transfer:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors du transfer',
    });
  }
});

/**
 * POST /api/token/reward
 * Récompense un utilisateur (authentification requise)
 * 
 * Body: { recipient: string, type: 'referral' | 'mission' | 'proof-of-skill', amount?: number }
 */
router.post('/reward', protect, async (req: Request, res: Response) => {
  try {
    const { recipient, type, amount } = req.body;

    if (!recipient || !type) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres requis: recipient, type (referral|mission|proof-of-skill)',
      });
    }

    const result = await rewardUser(recipient, type, amount);
    res.json(result);
  } catch (error) {
    console.error('[Token Route] Erreur reward:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la récompense',
    });
  }
});

/**
 * GET /api/token/balance/:wallet
 * Récupère le solde $MFAI d'un wallet
 */
router.get('/balance/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const balance = await getMFAIBalance(wallet);
    
    if (!balance) {
      return res.json({
        success: true,
        data: null,
        message: 'Token $MFAI non configuré ou wallet sans compte associé',
      });
    }

    res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du solde',
    });
  }
});

/**
 * POST /api/token/admin/create-mfai
 * Crée le token $MFAI (admin uniquement, exécutable une seule fois)
 * 
 * ⚠️ Cette route crée réellement le token sur la blockchain
 */
router.post('/admin/create-mfai', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const result = await createMFAIToken();
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Échec de la création du token',
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'Token $MFAI créé avec succès. Ajoutez cette adresse à votre .env: MFAI_TOKEN_MINT',
    });
  } catch (error) {
    console.error('[Token Route] Erreur création token:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du token',
    });
  }
});

export default router;

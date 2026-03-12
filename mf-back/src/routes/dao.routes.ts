/**
 * @file dao.routes.ts
 * @description Routes DAO — Phase 1 : données statiques déterministes
 * Phase 3 : connecter à SPL Governance on-chain
 * 
 * @author Kimi Code CLI — Session 11 — 2026-03-12
 */

import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// Proposals statiques Phase 1 (remplacer par SPL Governance en Phase 3)
const STATIC_PROPOSALS = [
  {
    id: '1',
    title: 'Increase Treasury Allocation to DeFi',
    description: 'Propose to increase the treasury allocation to automated DeFi strategies from 40% to 60%',
    status: 'active',
    votesFor: 1250000,
    votesAgainst: 350000,
    quorum: 2000000,
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'system',
  },
  {
    id: '2',
    title: 'Launch MFAI Liquidity Mining Program',
    description: 'Allocate 5M $MFAI tokens for a 90-day liquidity mining incentive program on Raydium',
    status: 'active',
    votesFor: 890000,
    votesAgainst: 120000,
    quorum: 2000000,
    endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'system',
  },
];

/**
 * GET /dao/config
 */
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalStaked: 12500000,
      activeProposals: STATIC_PROPOSALS.filter(p => p.status === 'active').length,
      treasuryBalance: 45000000,
      phase: 'Phase 1 — SPL Governance déploiement Phase 3',
      governanceAddress: null,
    },
  });
});

/**
 * GET /dao/proposals
 */
router.get('/proposals', (_req: Request, res: Response) => {
  const { status } = _req.query;
  const proposals = status
    ? STATIC_PROPOSALS.filter(p => p.status === status)
    : STATIC_PROPOSALS;
  res.json({ success: true, proposals });
});

/**
 * GET /dao/proposals/:id
 */
router.get('/proposals/:id', (req: Request, res: Response) => {
  const proposal = STATIC_PROPOSALS.find(p => p.id === req.params.id);
  if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
  res.json({ success: true, proposal });
});

/**
 * POST /dao/proposals/:id/vote
 */
router.post('/proposals/:id/vote', protect, async (req: Request, res: Response) => {
  try {
    const { vote } = req.body; // 'for' | 'against'
    if (!vote || !['for', 'against'].includes(vote)) {
      return res.status(400).json({ success: false, error: 'vote must be "for" or "against"' });
    }
    const txHash = `sim_dao_${Date.now().toString(16)}_${vote.slice(0, 1)}`;
    res.json({ success: true, txHash, proposalId: req.params.id, vote });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Vote failed' });
  }
});

/**
 * POST /dao/proposals
 * Créer une nouvelle proposal (Phase 1 : stub)
 */
router.post('/proposals', protect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Proposal creation — Phase 3 avec SPL Governance',
    proposal: { id: `prop_${Date.now()}`, ...req.body, status: 'pending' },
  });
});

/**
 * POST /dao/proposals/:id/close
 */
router.post('/proposals/:id/close', protect, (req: Request, res: Response) => {
  res.json({ success: true, message: 'Proposal closed', proposalId: req.params.id });
});

export default router;

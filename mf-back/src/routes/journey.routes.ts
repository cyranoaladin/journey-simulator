/**
 * Journey Routes - Demo endpoints
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Demo bootstrap payload — no persistence, no DB
const DEMO_DEFAULTS = {
  totalXp: 240,
  completedPhases: 1,
  mfaiTokens: 25,
  nftCertificates: [{ title: 'Founding Demo Certificate' }],
};

// Persona-based demo presets (non-persistent, backend-only)
const DEMO_PERSONA_PRESETS: Record<string, {
  total_xp: number;
  completed_phases: number;
  mfai_tokens: number;
  nft_certificates: Array<{ title: string }>;
}> = {
  'cognitive-activation-hub': {
    total_xp: 240,
    completed_phases: 1,
    mfai_tokens: 25,
    nft_certificates: [{ title: 'Founding Demo Certificate' }],
  },
  'capital-foundry': {
    total_xp: 480,
    completed_phases: 2,
    mfai_tokens: 75,
    nft_certificates: [{ title: 'Capital Strategy Demo NFT' }],
  },
  'investor-demo': {
    total_xp: 800,
    completed_phases: 3,
    mfai_tokens: 150,
    nft_certificates: [{ title: 'Investor Preview Certificate' }],
  },
};

const MAX_DEMO_PHASES = 6;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const toNonNegInt = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.floor(value));
};

const normalizeNftCertificates = (
  value: unknown,
  fallback: Array<{ title: string }>
): Array<{ title: string }> => {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      const title = typeof item?.title === 'string' ? item.title.trim() : '';
      return title ? { title } : null;
    })
    .filter((item): item is { title: string } => Boolean(item));
  return normalized.length > 0 ? normalized : fallback;
};

/**
 * POST /journey/load-demo
 * Minimal demo payload for frontend/E2E expectations
 */
router.post('/load-demo', (req: Request, res: Response) => {
  const personaId = typeof req.body?.personaId === 'string' && req.body.personaId.trim()
    ? req.body.personaId
    : 'cognitive-activation-hub';

  const preset = req.body?.demoPreset;
  const customDefaults = (preset && typeof preset === 'object') ? preset : {};

  const personaPreset = DEMO_PERSONA_PRESETS[personaId];
  const effectivePreset = Object.keys(customDefaults).length > 0
    ? customDefaults
    : (personaPreset || {});

  const totalXp = typeof effectivePreset.total_xp === 'number'
    ? effectivePreset.total_xp
    : DEMO_DEFAULTS.totalXp;
  const completedPhases = typeof effectivePreset.completed_phases === 'number'
    ? effectivePreset.completed_phases
    : DEMO_DEFAULTS.completedPhases;
  const mfaiTokens = typeof effectivePreset.mfai_tokens === 'number'
    ? effectivePreset.mfai_tokens
    : DEMO_DEFAULTS.mfaiTokens;
  const nftCertificates = normalizeNftCertificates(
    effectivePreset.nft_certificates,
    DEMO_DEFAULTS.nftCertificates
  );

  const safeTotalXp = toNonNegInt(totalXp, DEMO_DEFAULTS.totalXp);
  const safeCompletedPhases = clamp(
    toNonNegInt(completedPhases, DEMO_DEFAULTS.completedPhases),
    0,
    MAX_DEMO_PHASES
  );
  const safeMfaiTokens = toNonNegInt(mfaiTokens, DEMO_DEFAULTS.mfaiTokens);

  return res.status(200).json({
    success: true,
    journey: { id: personaId },
    progress: {
      total_xp: safeTotalXp,
      completed_phases: safeCompletedPhases,
      token_transactions: { mfai_tokens: safeMfaiTokens },
      nft_certificates: nftCertificates,
    },
  });
});

export default router;

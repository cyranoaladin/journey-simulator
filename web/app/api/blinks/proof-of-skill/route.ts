/**
 * @file /api/blinks/proof-of-skill/route.ts
 * @description Solana Action (Blink) — Certifier une compétence MFAI on-chain.
 *
 * SPEC : https://solana.com/docs/advanced/actions
 *
 * USAGE :
 *   Partager l'URL https://journey.mfai.app/api/blinks/proof-of-skill?phase=build&score=87
 *   sur Twitter/X → affiche un bouton "Certifier on-chain" directement dans le tweet.
 *
 * STATUT ACTUEL : Mode simulation — retourne un message de confirmation sans transaction réelle.
 * Phase 2 : Remplacer le POST par une vraie transaction cNFT + transfer $MFAI.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { NextRequest, NextResponse } from 'next/server';

// Headers obligatoires spec Solana Actions
const ACTIONS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-action-version, x-blockchain-ids',
  'Content-Type': 'application/json',
  'X-Action-Version': '2.1.3',
  'X-Blockchain-Ids': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpK', // mainnet genesis hash
};

const PHASE_META: Record<string, { label: string; emoji: string; description: string }> = {
  learn:       { label: 'Fondamentaux Web3',    emoji: '📚', description: 'Maîtrise des fondamentaux blockchain et Solana' },
  build:       { label: 'Développeur Solana',   emoji: '🔧', description: 'Création de dApps et smart contracts Anchor' },
  'defi':      { label: 'Expert DeFi',          emoji: '💰', description: 'Jupiter, Raydium, Pyth et protocoles DeFi Solana' },
  'nft':       { label: 'Creator NFT & cNFTs',  emoji: '🎨', description: 'Metaplex Core, ZK Compression, NFT standards' },
  dao:         { label: 'Governance DAO',       emoji: '🏛️', description: 'SPL Governance, Realms, vote on-chain' },
  launch:      { label: 'Protocol Architect',   emoji: '🚀', description: 'Lancement d\'un protocole sur Solana mainnet' },
  activate:    { label: 'Activateur Cognitif',  emoji: '⚡', description: 'Activation AEPO et stratégie de croissance' },
  scale:       { label: 'Scaler Web3',          emoji: '📈', description: 'Scalabilité on-chain et croissance communauté' },
};

function getPhaseOrDefault(phase: string) {
  return PHASE_META[phase] ?? PHASE_META['learn'];
}

/** GET — Retourne les métadonnées du Blink (affiché dans Twitter/X) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phase = searchParams.get('phase') ?? 'learn';
  const score = Math.min(100, Math.max(0, parseInt(searchParams.get('score') ?? '0', 10)));
  const meta = getPhaseOrDefault(phase);

  return NextResponse.json(
    {
      type: 'action',
      icon: `https://journey.mfai.app/assets/blinks/proof-of-skill-${phase}.png`,
      label: `${meta.emoji} Certifier : ${meta.label}`,
      title: `MFAI — Proof-of-Skill™ On-Chain`,
      description: [
        `✅ Compétence : ${meta.description}`,
        `📊 Score AEPO : ${score}/100`,
        `⛓️  Certification permanente sur Solana`,
        `🎁 Récompense : Proof-of-Skill™ cNFT + 50 $MFAI`,
      ].join('\n'),
      links: {
        actions: [
          {
            type: 'transaction',
            label: `Certifier (score ${score}/100)`,
            href: `/api/blinks/proof-of-skill?phase=${encodeURIComponent(phase)}&score=${score}`,
          },
        ],
      },
    },
    { headers: ACTIONS_HEADERS }
  );
}

/** POST — Construit et retourne la transaction (simulation en Phase 1, réelle en Phase 2) */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phase = searchParams.get('phase') ?? 'learn';
  const score = parseInt(searchParams.get('score') ?? '0', 10);

  try {
    const body = await req.json();
    const { account } = body as { account?: string };

    if (!account) {
      return NextResponse.json(
        { error: 'Le paramètre "account" (adresse wallet) est requis' },
        { status: 400, headers: ACTIONS_HEADERS }
      );
    }

    // ─── Phase 2 : remplacer ce bloc par la vraie transaction ─────────────
    // const tx = await buildProofOfSkillTransaction({ recipient: account, phase, score });
    // return NextResponse.json({ transaction: tx.serialize('base64') }, { headers: ACTIONS_HEADERS });
    // ──────────────────────────────────────────────────────────────────────

    // Phase 1 — Simulation avec message explicatif
    return NextResponse.json(
      {
        message: `✅ Certification simulée : Proof-of-Skill™ "${phase}" (score ${score}/100) pour ${account.slice(0, 8)}... — Activation mainnet Phase 2`,
        simulation: true,
        details: {
          phase,
          score,
          account,
          pending: 'cNFT mint via Light Protocol + 50 $MFAI transfer',
          estimatedPhase2Date: 'Semaines 3-6 (après création token $MFAI)',
        },
      },
      { headers: ACTIONS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Corps de requête invalide — JSON attendu avec { account: string }' },
      { status: 400, headers: ACTIONS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_HEADERS });
}

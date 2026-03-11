/**
 * @file /api/blinks/journey-start/route.ts
 * @description Solana Action (Blink) — Démarrer un parcours MFAI.
 *
 * USAGE :
 *   https://journey.mfai.app/api/blinks/journey-start?journey=capital-foundry
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { NextRequest, NextResponse } from 'next/server';

const ACTIONS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-action-version, x-blockchain-ids',
  'Content-Type': 'application/json',
  'X-Action-Version': '2.1.3',
  'X-Blockchain-Ids': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpK',
};

const JOURNEY_META: Record<string, { label: string; emoji: string; description: string }> = {
  'cognitive-activation-hub': { label: 'Cognitive Activation Hub', emoji: '🧠', description: 'Active ton potentiel entrepreneurial avec Zyno' },
  'capital-foundry':          { label: 'Capital Foundry',          emoji: '⚒️',  description: 'Forge ta première startup Web3 sur Solana' },
  'builder-protocol':         { label: 'Builder Protocol',         emoji: '🔧', description: 'Deviens développeur Solana/Anchor expert' },
  'defi-mastery':             { label: 'DeFi Mastery',             emoji: '💰', description: 'Maîtrise Jupiter, Raydium, Pyth et les protocoles DeFi' },
  'nft-empire':               { label: 'NFT Empire',               emoji: '🎨', description: 'Crée ta collection NFT ou cNFT sur Solana' },
  'dao-governance':           { label: 'DAO Governance',           emoji: '🏛️', description: 'Construis et gouverne une organisation décentralisée' },
};

function getJourneyOrDefault(id: string) {
  return JOURNEY_META[id] ?? { label: 'Parcours MFAI', emoji: '🚀', description: 'Commence ton aventure Web3' };
}

/** GET — Affiche le Blink de démarrage */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const journey = searchParams.get('journey') ?? 'cognitive-activation-hub';
  const meta = getJourneyOrDefault(journey);

  return NextResponse.json(
    {
      type: 'action',
      icon: `https://journey.mfai.app/assets/blinks/journey-${journey}.png`,
      label: `${meta.emoji} Démarrer : ${meta.label}`,
      title: `MFAI — ${meta.label}`,
      description: [
        meta.description,
        '🎁 Bonus : 25 $MFAI de bienvenue',
        '📜 Récompense : Proof-of-Skill™ cNFT à la complétion',
        '⛓️  100% on-chain sur Solana',
      ].join('\n'),
      links: {
        actions: [
          {
            type: 'transaction',
            label: `Commencer le parcours`,
            href: `/api/blinks/journey-start?journey=${encodeURIComponent(journey)}`,
          },
        ],
      },
    },
    { headers: ACTIONS_HEADERS }
  );
}

/** POST — Redirige vers l'app et crée le journey progress */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const journey = searchParams.get('journey') ?? 'cognitive-activation-hub';

  try {
    const body = await req.json();
    const { account } = body as { account?: string };

    if (!account) {
      return NextResponse.json(
        { error: 'Paramètre "account" requis' },
        { status: 400, headers: ACTIONS_HEADERS }
      );
    }

    // Redirection vers l'app avec le wallet pré-rempli
    const redirectUrl = `https://journey.mfai.app/journeys/${journey}?wallet=${encodeURIComponent(account)}&welcome=true`;

    return NextResponse.json(
      {
        message: `🚀 Redirection vers le parcours ${journey}`,
        redirectUrl,
        simulation: true,
        details: {
          journey,
          wallet: account,
          welcomeBonus: '25 $MFAI (Phase 2)',
        },
      },
      { headers: ACTIONS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Requête invalide' },
      { status: 400, headers: ACTIONS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_HEADERS });
}

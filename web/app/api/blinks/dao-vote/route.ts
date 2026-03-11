/**
 * @file /api/blinks/dao-vote/route.ts
 * @description Solana Action (Blink) — Vote dans le DAO MFAI.
 *
 * USAGE :
 *   https://journey.mfai.app/api/blinks/dao-vote?proposal=PROP-001&title=Allouer+10k+SOL+au+fonds+ecosysteme
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

/** GET — Affiche le Blink de vote */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const proposal = searchParams.get('proposal') ?? 'UNKNOWN';
  const title = searchParams.get('title') ?? 'Proposal DAO';

  return NextResponse.json(
    {
      type: 'action',
      icon: 'https://journey.mfai.app/assets/blinks/dao-vote.png',
      label: `🏛️ Vote Proposal #${proposal}`,
      title: `MFAI DAO — ${title}`,
      description: [
        `Proposal : #${proposal}`,
        'Votre vote compte dans la gouvernance MFAI.',
        'Poids du vote = stake $MFAI + Proof-of-Skill™.',
      ].join('\n'),
      links: {
        actions: [
          {
            type: 'transaction',
            label: '✅ Voter OUI',
            href: `/api/blinks/dao-vote?proposal=${encodeURIComponent(proposal)}&vote=yes`,
          },
          {
            type: 'transaction',
            label: '❌ Voter NON',
            href: `/api/blinks/dao-vote?proposal=${encodeURIComponent(proposal)}&vote=no`,
          },
        ],
      },
    },
    { headers: ACTIONS_HEADERS }
  );
}

/** POST — Enregistre le vote */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const proposal = searchParams.get('proposal') ?? 'UNKNOWN';
  const vote = searchParams.get('vote') ?? 'yes';

  try {
    const body = await req.json();
    const { account } = body as { account?: string };

    if (!account) {
      return NextResponse.json(
        { error: 'Paramètre "account" requis' },
        { status: 400, headers: ACTIONS_HEADERS }
      );
    }

    // Phase 1 : Simulation — enregistrer dans DB
    // Phase 2 : Transaction SPL Governance réelle

    return NextResponse.json(
      {
        message: `✅ Vote ${vote.toUpperCase()} enregistré pour Proposal #${proposal} — Activation SPL Governance Phase 3`,
        simulation: true,
        details: {
          proposal,
          vote,
          voter: account,
          weight: 'à calculer selon stake $MFAI',
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

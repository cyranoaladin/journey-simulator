/**
 * @file /api/blinks/referral/route.ts
 * @description Solana Action (Blink) — Programme de parrainage MFAI.
 *
 * USAGE :
 *   Partager https://journey.mfai.app/api/blinks/referral?ref=WALLET_ADDRESS
 *   → Le nouvel utilisateur reçoit 100 $MFAI de bienvenue en rejoignant.
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

/** GET — Affiche le Blink de parrainage */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref') ?? 'unknown';
  const refShort = ref.slice(0, 4) + '...' + ref.slice(-4);

  return NextResponse.json(
    {
      type: 'action',
      icon: 'https://journey.mfai.app/assets/blinks/referral.png',
      label: '🎁 Rejoins MFAI via ' + refShort,
      title: 'Money Factory AI — Programme de Parrainage',
      description: [
        `👋 Invité par : ${refShort}`,
        '🚀 Rejoins la Proof-of-Merit Economy sur Solana',
        '🎁 Bonus : 100 $MFAI de bienvenue',
        '📚 Accès immédiat aux parcours Learn → Build → Launch',
      ].join('\n'),
      links: {
        actions: [
          {
            type: 'transaction',
            label: 'Rejoindre MFAI (+100 $MFAI)',
            href: `/api/blinks/referral?ref=${encodeURIComponent(ref)}`,
          },
        ],
      },
    },
    { headers: ACTIONS_HEADERS }
  );
}

/** POST — Enregistre le referral (simulation Phase 1, transaction réelle Phase 2) */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref') ?? 'unknown';

  try {
    const body = await req.json();
    const { account } = body as { account?: string };

    if (!account) {
      return NextResponse.json(
        { error: 'Paramètre "account" requis' },
        { status: 400, headers: ACTIONS_HEADERS }
      );
    }

    // ─── Phase 4 : Transfer réel de $MFAI ────────────────────────────────
    
    try {
      // Appel au backend pour le transfer de récompense
      const rewardResponse = await fetch(
        `${process.env.MFAI_API_URL ?? 'http://localhost:3002'}/api/token/reward`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: account,
            type: 'referral',
            amount: 100, // 100 $MFAI pour nouvel utilisateur
          }),
        }
      );

      const rewardResult = await rewardResponse.json();

      if (rewardResult.success) {
        return NextResponse.json(
          {
            message: `✅ Bienvenue dans MFAI ! 100 $MFAI crédités sur ${account.slice(0, 8)}...`,
            simulation: rewardResult.simulation ?? false,
            txHash: rewardResult.txHash,
            details: {
              newUser: account,
              referrer: ref,
              reward: '100 $MFAI',
              status: rewardResult.simulation ? 'simulation' : 'confirmed',
              redirectUrl: 'https://journey.mfai.app/onboarding',
            },
          },
          { headers: ACTIONS_HEADERS }
        );
      } else {
        throw new Error(rewardResult.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('[Blink Referral] Erreur:', error);
      // Fallback simulation si backend indisponible
      return NextResponse.json(
        {
          message: `✅ Bienvenue dans MFAI ! (mode simulation) — Parrain: ${ref.slice(0, 8)}...`,
          simulation: true,
          txHash: `sim_${Date.now().toString(16)}`,
          details: {
            newUser: account,
            referrer: ref,
            reward: '100 $MFAI (simulation)',
            redirectUrl: 'https://journey.mfai.app/onboarding',
          },
        },
        { headers: ACTIONS_HEADERS }
      );
    }
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

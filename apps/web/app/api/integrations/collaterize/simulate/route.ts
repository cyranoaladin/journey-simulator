/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({
  wallet: z.string(), // wallet créateur du projet
  tokenMint: z.string().optional(),
  tokenSymbol: z.string(),
  totalSupply: z.number().int().positive(),
  circulatingAtTGE: z.number().int().positive(),
  fundraisingGoalUSD: z.number().positive(),
  journeyScore: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(1),
  communityScore: z.number().min(0).max(100).optional(),
  docsScore: z.number().min(0).max(100).optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const input = parsed.data

  // --- Heuristiques de simulation Collaterize ---
  const weightedScore =
    0.4 * input.journeyScore +
    0.2 * (input.communityScore ?? input.journeyScore) +
    0.2 * (input.docsScore ?? input.journeyScore) +
    0.2 * (100 - input.riskScore * 100)

  let tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED'
  if (weightedScore >= 80) tier = 'CORE'
  else if (weightedScore >= 60) tier = 'EXPERIMENTAL'
  else tier = 'REJECTED'

  const accepted = tier !== 'REJECTED'

  const softCapUSD = input.fundraisingGoalUSD * 0.25
  const hardCapUSD = input.fundraisingGoalUSD
  const liquidityUSD = input.fundraisingGoalUSD * 0.4 // ex : 40% en LP
  const initialPriceUSD = input.fundraisingGoalUSD / Math.max(input.circulatingAtTGE, 1)

  const notes: string[] = []
  if (!accepted)
    notes.push(
      "Score global insuffisant pour une intégration standard. Renforcer la documentation, l'audit et la communauté."
    )
  else if (tier === 'EXPERIMENTAL')
    notes.push(
      'Projet intéressant mais encore jeune : éligible en experimental track sous conditions.'
    )
  else notes.push("Projet éligible pour un launch 'Core' avec Collaterize.")

  if ((input.docsScore ?? 0) < 70)
    notes.push('Renforcer la documentation projet (whitepaper, litepaper, tokenomics).')

  if ((input.communityScore ?? 0) < 70)
    notes.push('Travailler la communauté avant le launch (Discord, Twitter, ambassadeurs).')

  const simulatedLaunchUrl = 'https://launchpad.collaterize.com/'

  const simulation = {
    accepted,
    eligibilityScore: Math.round(weightedScore),
    tier,
    targetRaiseUSD: input.fundraisingGoalUSD,
    softCapUSD,
    hardCapUSD,
    liquidityUSD,
    initialPriceUSD,
    communityScore: input.communityScore ?? 0,
    riskScore: input.riskScore,
    notes,
    simulatedLaunchUrl,
    // potentiellement : timings, vesting, etc.
  }

  return NextResponse.json({ ok: true, simulation })
}

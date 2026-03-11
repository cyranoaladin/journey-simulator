/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Query = z.object({
  name: z.string().optional(),
  wallet: z.string().optional(),
  score: z.string().optional(),
  journey: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = Query.safeParse({
    name: searchParams.get('name') ?? undefined,
    wallet: searchParams.get('wallet') ?? undefined,
    score: searchParams.get('score') ?? undefined,
    journey: searchParams.get('journey') ?? undefined,
    description: searchParams.get('description') ?? undefined,
    image: searchParams.get('image') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_query' }, { status: 400 })
  }

  const { name, wallet, score, journey, description, image } = parsed.data

  const title = name || 'MFAI – Proof of Skill'
  const imageBase = process.env.MFAI_METADATA_IMAGE_BASE || 'https://mfai.app/images/proof-of-skill'
  const imageUrl = image || `${imageBase}?tier=A&wallet=${wallet ?? ''}`

  const json = {
    name: title,
    symbol: process.env.NEXT_PUBLIC_NFT_SYMBOL || 'MFAI',
    description:
      description ||
      'NFT de compétence délivré par Money Factory AI pour un parcours complété dans le Journey Simulator.',
    image: imageUrl,
    attributes: [
      journey ? { trait_type: 'Journey', value: journey } : null,
      wallet ? { trait_type: 'Owner Wallet', value: wallet } : null,
      score ? { trait_type: 'Score', value: score } : null,
      { trait_type: 'Issuer', value: 'Money Factory AI' },
      { trait_type: 'Type', value: 'Proof of Skill' },
    ].filter(Boolean),
  }

  const res = NextResponse.json(json)
  res.headers.set('Cache-Control', 'public, max-age=300')
  return res
}

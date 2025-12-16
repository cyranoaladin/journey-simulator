import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Query = z.object({
  tier: z.enum(['BUILDER', 'GROWTH', 'DAO', 'FOUNDER']).default('BUILDER'),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = Query.safeParse({
    tier: searchParams.get('tier') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_query' }, { status: 400 })
  }

  const { tier } = parsed.data

  const baseName = 'Money Factory AI – Access Pass'
  const title = `${baseName} – ${tier}`
  const imageBase = process.env.MFAI_PASS_IMAGE_BASE || 'https://mfai.app/images/pass'

  const json = {
    name: title,
    symbol: 'MFAPASS',
    description: `Pass d'accès ${tier} pour Money Factory AI Journey Simulator et son écosystème multi-agents.`,
    image: `${imageBase}/${tier.toLowerCase()}.png`,
    attributes: [
      { trait_type: 'Tier', value: tier },
      { trait_type: 'Product', value: 'Journey Simulator' },
      { trait_type: 'Issuer', value: 'Money Factory AI' },
      { trait_type: 'Type', value: 'Access Pass' },
    ],
  }

  const res = NextResponse.json(json)
  res.headers.set('Cache-Control', 'public, max-age=300')
  return res
}

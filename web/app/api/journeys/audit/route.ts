import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z
  .object({
    pitch: z.string().min(10).optional(),
    url: z.string().url().optional(),
    language: z.enum(['fr', 'en']).default('fr'),
  })
  .refine((d) => !!d.pitch || !!d.url, { message: 'pitch or url required' })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { language } = parsed.data
  const resp = {
    metadata: {
      persona_id: 'audit',
      journey_track: 'audit',
      phase_id: 'prove',
      language,
      title: 'Audit rapide',
      summary: 'Évaluation synthétique du projet',
    },
    ui_blocks: [
      {
        kind: 'evaluation_block',
        id: 'eval_quick',
        title: 'Évaluation',
        global_score: 7.2,
        max_score: 10,
        feedback: 'Bon potentiel, clarifier utilité token et gouvernance.',
        axes: [
          { name: 'Clarté', score: 7.5, max_score: 10, comment: 'Pitch compréhensible' },
          {
            name: 'Tokenomics',
            score: 6.5,
            max_score: 10,
            comment: 'Manque détails sur supply/allocations',
          },
          {
            name: 'Gouvernance',
            score: 7.0,
            max_score: 10,
            comment: 'DAO envisagée, préciser rôles',
          },
          { name: 'GTM', score: 7.8, max_score: 10, comment: 'Plan initial crédible' },
        ],
      },
      {
        kind: 'document_block',
        id: 'doc_audit',
        title: 'Rapport d’audit – brouillon',
        doc_type: 'investor_brief',
        content_markdown:
          '# Audit – Brouillon\n\n## Points forts\n- ...\n\n## Risques\n- ...\n\n## Recos\n- ...',
      },
    ],
    agent_actions: [],
    next_state: { phase_id: 'prove', completed_missions: [], xp_delta: 0, notes: 'audit' },
  }
  return NextResponse.json(resp)
}

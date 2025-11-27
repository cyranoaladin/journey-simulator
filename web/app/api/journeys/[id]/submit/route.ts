import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callZynoEvaluate } from '@/server/zyno'
import { setJourneyState, pushAgentLog } from '@/server/state'

const Body = z.object({
  missionId: z.string(),
  inputType: z.enum(['text', 'markdown_document', 'code_snippet', 'link', 'choice']),
  submission: z.string().min(1),
  language: z.enum(['fr', 'en']).default('fr'),
  mode: z.enum(['discovery', 'builder', 'expert']).optional(),
  tone: z.enum(['pedagogical', 'investor_pitch', 'critical']).optional(),
  trackId: z.string().optional(),
  phaseId: z.string().optional(),
  journeyState: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { searchParams } = new URL(req.url)
  const forceLlm = searchParams.get('llm') === '1'

  const {
    missionId,
    inputType,
    submission,
    language,
    mode = 'builder',
    tone = 'pedagogical',
    trackId,
    phaseId,
    journeyState,
  } = parsed.data

  // DEMO / fallback
  if (process.env.DEMO_MODE === 'true' && !forceLlm) {
    const quality = Math.min(100, Math.round(Math.max(10, submission.length / 10)))
    const gained = Math.round(Math.min(50, quality / 2))
    const resp = {
      metadata: {
        persona_id: 'demo',
        journey_track: trackId ?? 'track',
        phase_id: phaseId ?? 'phase',
        language,
        mode,
        tone,
        title: 'Mission Evaluation (Demo)',
      },
      ui_blocks: [
        {
          kind: 'evaluation_block',
          id: 'eval_' + missionId,
          title: 'Your Mission Feedback',
          global_score: quality,
          max_score: 100,
          feedback: 'Good proposal for a demo mode.',
          axes: [
            {
              name: 'Relevance',
              score: Math.round(quality * 0.35),
              max_score: 35,
              comment: 'Overall alignment satisfactory.',
            },
            {
              name: 'Quality',
              score: Math.round(quality * 0.35),
              max_score: 35,
              comment: 'Structure and clarity suitable.',
            },
            {
              name: 'Execution',
              score: Math.round(quality * 0.3),
              max_score: 30,
              comment: 'Deliverable usable.',
            },
          ],
        },
        {
          kind: 'xp_block',
          id: 'xp_' + missionId,
          title: 'Progression',
          current_xp: (journeyState as any)?.xp ?? 0,
          gained_xp: gained,
          next_level_xp: 100,
        },
      ],
      agent_actions: [
        {
          agent_name: 'Zyno',
          reason: 'demo',
          action: 'evaluate',
          parameters: { missionId, inputType },
        },
      ],
      next_state: {
        phase_id: phaseId ?? 'phase',
        completed_missions: [missionId],
        xp_delta: gained,
        notes: 'demo_submit',
      },
    }
    return NextResponse.json(resp)
  }

  // Real evaluator
  try {
    const result: any = await callZynoEvaluate({
      trackId,
      phaseId,
      missionId,
      inputType,
      submission,
      language,
      mode,
      tone,
      journeyState,
    })
    const out = result?.out ?? result
    const meta = result?.meta
    const ok = out && out.metadata && out.ui_blocks && out.agent_actions && out.next_state
    if (!ok) return NextResponse.json({ error: 'schema_validation_failed' }, { status: 500 })
    try {
      await setJourneyState(id, out.next_state, out.metadata)
      await pushAgentLog({
        ts: Date.now(),
        journeyId: id,
        agent: 'Zyno',
        action: 'submit',
        details: {
          missionId,
          inputType,
          perf: {
            ...meta,
            tokens: meta?.usage
              ? {
                  input: meta.usage.input_tokens ?? meta.usage.prompt_tokens,
                  output: meta.usage.output_tokens ?? meta.usage.completion_tokens,
                  total: meta.usage.total_tokens,
                }
              : undefined,
          },
        },
      })
    } catch (persistError) {
      console.warn('Failed to persist mission evaluation', persistError)
    }
    return NextResponse.json(out)
  } catch (e: any) {
    try {
      await pushAgentLog({
        ts: Date.now(),
        journeyId: id,
        agent: 'Zyno',
        action: 'submit_error',
        details: { level: 'error', message: e?.message || String(e) },
      })
    } catch (logError) {
      console.warn('Failed to log mission submit error', logError)
    }
    return NextResponse.json(
      { error: 'evaluator_failed', message: e?.message || String(e) },
      { status: 500 }
    )
  }
}

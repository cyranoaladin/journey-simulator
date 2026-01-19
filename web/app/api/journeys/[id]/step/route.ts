/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callZynoStep } from '@/server/zyno'
import { getDemoStep } from '@/server/demoArtifacts'
import { setJourneyState, pushAgentLog } from '@/server/state'

const Body = z.object({
  phaseId: z.string(),
  trackId: z.string(),
  userInput: z.string().optional(),
  actionId: z.string().optional(),
  language: z.enum(['fr', 'en']),
  mode: z.enum(['discovery', 'builder', 'expert']).optional(),
  tone: z.enum(['pedagogical', 'investor_pitch', 'critical']).optional(),
  journeyState: z.record(z.any()),
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
  const replay = searchParams.get('replay') === '1'
  const {
    phaseId,
    trackId,
    language,
    mode = 'discovery',
    tone = 'pedagogical',
    userInput,
    actionId,
    journeyState,
  } = parsed.data

  // DEMO_MODE / Replay
  if (process.env.DEMO_MODE === 'true' && !forceLlm) {
    if (replay) {
      const step = getDemoStep(req)
      return NextResponse.json(step)
    }
    // Basic demo response
    const resp = {
      metadata: {
        persona_id: 'unknown',
        journey_track: trackId,
        phase_id: phaseId,
        language,
        mode,
        tone: 'pedagogical',
        title: 'Demo Step',
        summary: 'Example UI Blocks render for frontend integration.',
      },
      ui_blocks: [
        {
          kind: 'text_block',
          id: 'tb_intro',
          title: 'Welcome',
          body_markdown: 'This step is an example. ID: ' + id,
        },
        {
          kind: 'action_suggestions_block',
          id: 'asb_next',
          title: 'What would you like to do?',
          suggestions: [
            { label: 'Continue', action_id: 'go_next' },
            { label: 'View resources', action_id: 'open_resources' },
          ],
        },
        {
          kind: 'xp_block',
          id: 'xp_demo',
          current_xp: 0,
          gained_xp: 5,
          next_level_xp: 50,
          title: 'Progression',
          comment: 'Demo',
        },
      ],
      agent_actions: [{ agent_name: 'Zyno', reason: 'stub', action: 'none', parameters: {} }],
      next_state: { phase_id: phaseId, completed_missions: [], xp_delta: 5, notes: 'demo' },
    }
    try {
      await setJourneyState(id, (resp as any).next_state, (resp as any).metadata)
      await pushAgentLog({
        ts: Date.now(),
        journeyId: id,
        agent: 'Zyno',
        action: 'step',
        details: { phaseId, trackId, mode, tone },
      })
    } catch (persistError) {
      console.warn('Failed to persist demo response', persistError)
    }
    return NextResponse.json(resp)
  }

  // LLM orchestrator
  try {
    const { out, meta } = await callZynoStep({
      userId: 'demo_user',
      personaId: 'unknown',
      trackId,
      phaseId,
      language,
      mode,
      tone,
      journeyState,
      userInput,
      actionId,
    })
    const ok = out && out.metadata && out.ui_blocks && out.agent_actions && out.next_state
    if (!ok) return NextResponse.json({ error: 'schema_validation_failed' }, { status: 500 })
    // persist state and log
    try {
      await setJourneyState(id, out.next_state, out.metadata)
      await pushAgentLog({
        ts: Date.now(),
        journeyId: id,
        agent: 'Zyno',
        action: 'step',
        details: {
          phaseId,
          trackId,
          mode,
          tone,
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
      console.warn('Failed to persist journey step result', persistError)
    }
    return NextResponse.json(out)
  } catch (e: any) {
    try {
      await pushAgentLog({
        ts: Date.now(),
        journeyId: id,
        agent: 'Zyno',
        action: 'step_error',
        details: { level: 'error', message: e?.message || String(e) },
      })
    } catch (logError) {
      console.warn('Failed to push error log for journey step', logError)
    }
    return NextResponse.json(
      { error: 'orchestrator_failed', message: e?.message || String(e) },
      { status: 500 }
    )
  }
}

/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/** @jest-environment node */
import { NextResponse } from 'next/server'

const sampleOut = {
  metadata: {
    persona_id: 'demo',
    journey_track: 'builder',
    phase_id: 'learn',
    language: 'fr',
    mode: 'builder',
    tone: 'pedagogical',
    title: 'Step',
  },
  ui_blocks: [{ kind: 'text_block', id: 'tb', title: 'Intro', body_markdown: 'Hello' }],
  agent_actions: [],
  next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 },
}

const callSpy = jest.fn(async () => ({
  out: sampleOut,
  meta: { model: 'gpt-5.1', duration_ms: 50, usage: { total_tokens: 42 } },
}))

jest.mock('@/server/zyno', () => ({
  callZynoStep: (...args: any[]) => (callSpy as any)(...args),
}))

describe('API /api/journeys/[id]/step with actionId', () => {
  const path = '../../app/api/journeys/[id]/step/route'

  beforeEach(() => {
    delete process.env.DEMO_MODE
    callSpy.mockClear()
  })

  it('forwards actionId to callZynoStep when ?llm=1', async () => {
    const mod = await import(path)
    const { POST } = mod as { POST: (req: any, ctx: any) => Promise<Response> }
    const url = new URL('http://localhost/api/journeys/abc/step?llm=1')
    const req = {
      json: async () => ({
        phaseId: 'learn',
        trackId: 'builder',
        language: 'fr',
        journeyState: {},
        actionId: 'go_next',
      }),
      url: url.toString(),
    }
    const res = await POST(req, { params: { id: 'abc' } })
    expect(res.status).toBe(200)
    expect(callSpy).toHaveBeenCalledTimes(1)
    const arg = (callSpy.mock.calls as any)[0][0]
    expect(arg).toMatchObject({ actionId: 'go_next', trackId: 'builder', phaseId: 'learn' })
    const json = await (res as NextResponse).json()
    expect(json).toHaveProperty('metadata')
    expect(Array.isArray(json.ui_blocks)).toBe(true)
  })
})

/** @jest-environment node */
import { NextResponse } from 'next/server'

// Force module mock before route import when testing LLM path
const sampleEval = {
  metadata: {
    persona_id: 'demo',
    journey_track: 'builder',
    phase_id: 'learn',
    language: 'fr',
    mode: 'builder',
    tone: 'pedagogical',
    title: 'Eval',
  },
  ui_blocks: [
    {
      kind: 'evaluation_block',
      id: 'e1',
      title: 'Feedback',
      global_score: 84,
      max_score: 100,
      feedback: 'Bien',
      axes: [
        { name: 'Pertinence', score: 30, max_score: 35, comment: 'OK' },
        { name: 'Qualité', score: 29, max_score: 35, comment: 'OK' },
        { name: 'Exécution', score: 25, max_score: 30, comment: 'OK' },
      ],
    },
    { kind: 'xp_block', id: 'xp1', current_xp: 100, gained_xp: 20, next_level_xp: 200 },
  ],
  agent_actions: [],
  next_state: { phase_id: 'learn', completed_missions: ['m1'], xp_delta: 20 },
}

jest.mock('@/server/zyno', () => ({
  callZynoEvaluate: jest.fn(async () => sampleEval),
}))

describe('API /api/journeys/[id]/submit', () => {
  const path = '../../app/api/journeys/[id]/submit/route'

  beforeEach(() => {
    delete process.env.DEMO_MODE
  })

  it('rejects bad request', async () => {
    const mod = await import(path)
    const { POST } = mod as { POST: (req: any, ctx: any) => Promise<Response> }
    const res = await POST({ json: async () => ({}) }, { params: { id: 'abc' } })
    expect(res.status).toBe(400)
  })

  it('returns demo evaluation when DEMO_MODE=true', async () => {
    process.env.DEMO_MODE = 'true'
    const mod = await import(path)
    const { POST } = mod as { POST: (req: any, ctx: any) => Promise<Response> }
    const url = new URL('http://localhost/api/journeys/abc/submit')
    const req = {
      json: async () => ({
        missionId: 'm1',
        inputType: 'text',
        submission: 'mon livrable',
        language: 'fr',
      }),
      url: url.toString(),
    } as any
    const res = await POST(req, { params: { id: 'abc' } })
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(Array.isArray(json.ui_blocks)).toBe(true)
    const hasEval = json.ui_blocks.some((b: any) => b.kind === 'evaluation_block')
    const hasXp = json.ui_blocks.some((b: any) => b.kind === 'xp_block')
    expect(hasEval && hasXp).toBe(true)
    expect(typeof json.next_state?.xp_delta).toBe('number')
  })

  it('forces LLM path with ?llm=1 and uses evaluator mock', async () => {
    const mod = await import(path)
    const { POST } = mod as { POST: (req: any, ctx: any) => Promise<Response> }
    const url = new URL('http://localhost/api/journeys/abc/submit?llm=1')
    const req = {
      json: async () => ({
        missionId: 'm1',
        inputType: 'text',
        submission: 'livrable',
        language: 'fr',
      }),
      url: url.toString(),
    } as any
    const res = await POST(req, { params: { id: 'abc' } })
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.next_state?.xp_delta).toBe(20)
    expect(json.ui_blocks.some((b: any) => b.kind === 'evaluation_block')).toBe(true)
  })
})

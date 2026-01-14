/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/** @jest-environment node */
import { NextResponse } from 'next/server'

const sampleOut = {
  metadata: {
    persona_id: 'p',
    journey_track: 't',
    phase_id: 'ph',
    language: 'fr',
    mode: 'builder',
    tone: 'pedagogical',
    title: 'Step',
  },
  ui_blocks: [{ kind: 'text_block', id: 't1', title: 'Hi', body_markdown: '...' }],
  agent_actions: [],
  next_state: { phase_id: 'ph', completed_missions: [], xp_delta: 0 },
}

jest.mock('../../src/server/zyno', () => ({
  callZynoStep: jest.fn(async () => ({
    out: sampleOut,
    meta: { usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 } },
  })),
}))

describe('API /api/journeys/[id]/step LLM branch', () => {
  it('returns 200 with ?llm=1', async () => {
    const mod = await import('../../app/api/journeys/[id]/step/route')
    const { POST } = mod as any
    const url = new URL('http://localhost/api/journeys/abc/step?llm=1')
    const req = {
      json: async () => ({ phaseId: 'ph', trackId: 't', language: 'fr', journeyState: {} }),
      url: url.toString(),
    } as any
    const res = await POST(req, { params: { id: 'abc' } } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json).toHaveProperty('metadata')
  })
})

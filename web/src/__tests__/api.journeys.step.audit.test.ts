/** @jest-environment node */
import { NextResponse } from 'next/server'

describe('API /api/journeys/[id]/step & /api/journeys/audit', () => {
  it('POST /step returns JourneyStepResponse (demo)', async () => {
    const mod = await import('../../app/api/journeys/[id]/step/route')
    const { POST } = mod as any
    const url = new URL('http://localhost/api/journeys/abc/step')
    const res = await POST({ json: async () => ({ phaseId: 'learn', trackId: 'builder', language: 'fr', journeyState: {} }), url: url.toString() } as any, { params: { id: 'abc' } } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json).toHaveProperty('metadata')
    expect(json).toHaveProperty('ui_blocks')
  })

  it('POST /audit returns evaluation/document blocks', async () => {
    const mod = await import('../../app/api/journeys/audit/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ pitch: 'Mon protocole', language: 'fr' }) } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json?.ui_blocks?.some((b:any)=>b.kind==='evaluation_block')).toBeTruthy()
  })
})

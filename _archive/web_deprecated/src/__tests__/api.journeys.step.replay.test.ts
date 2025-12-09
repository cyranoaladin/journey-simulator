/** @jest-environment node */
import { NextResponse } from 'next/server'

describe('API /api/journeys/[id]/step demo replay', () => {
  it('returns demo step when replay=1', async () => {
    const mod = await import('../../app/api/journeys/[id]/step/route')
    const { POST } = mod as any
    const url = new URL('http://localhost/api/journeys/abc/step?replay=1')
    const req = {
      json: async () => ({ phaseId: 'ph', trackId: 't', language: 'fr', journeyState: {} }),
      url: url.toString(),
    } as any
    const res = await POST(req, { params: { id: 'abc' } } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(Array.isArray(json.ui_blocks)).toBe(true)
  })
})

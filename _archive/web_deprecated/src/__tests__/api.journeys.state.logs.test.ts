/** @jest-environment node */
import { NextResponse } from 'next/server'

describe('API /api/journeys/[id]/state and /api/agents/logs', () => {
  it('returns 404 when state missing', async () => {
    const mod = await import('../../app/api/journeys/[id]/state/route')
    const { GET } = mod as any
    const url = new URL('http://localhost/api/journeys/none/state')
    const res = await GET({ url: url.toString() } as any, { params: { id: 'none' } } as any)
    expect(res.status).toBe(404)
  })

  it('persists state after step and lists logs', async () => {
    process.env.DEMO_MODE = 'true'
    const stepMod = await import('../../app/api/journeys/[id]/step/route')
    const { POST } = stepMod as any
    const stepUrl = new URL('http://localhost/api/journeys/abc/step')
    const stepRes = await POST(
      {
        json: async () => ({
          phaseId: 'learn',
          trackId: 'builder',
          language: 'fr',
          journeyState: {},
        }),
        url: stepUrl.toString(),
      } as any,
      { params: { id: 'abc' } } as any
    )
    expect(stepRes.status).toBe(200)

    const stateMod = await import('../../app/api/journeys/[id]/state/route')
    const { GET } = stateMod as any
    const stateUrl = new URL('http://localhost/api/journeys/abc/state')
    const stateRes = await GET(
      { url: stateUrl.toString() } as any,
      { params: { id: 'abc' } } as any
    )
    expect(stateRes.status).toBe(200)
    const json = await (stateRes as NextResponse).json()
    expect(json).toHaveProperty('last_state')

    const logsMod = await import('../../app/api/agents/logs/route')
    const { GET: LOGS } = logsMod as any
    const logsUrl = new URL('http://localhost/api/agents/logs?journeyId=abc&limit=10')
    const logsRes = await LOGS({ url: logsUrl.toString() } as any)
    expect(logsRes.status).toBe(200)
    const logsJson = await (logsRes as NextResponse).json()
    expect(Array.isArray(logsJson.logs)).toBe(true)
    expect(logsJson.logs.length).toBeGreaterThan(0)
  })
})

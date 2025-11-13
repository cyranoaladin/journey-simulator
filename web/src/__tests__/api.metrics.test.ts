/** @jest-environment node */
import { NextResponse } from 'next/server'

describe('API /api/metrics', () => {
  it('GET returns counters', async () => {
    const mod = await import('../../app/api/metrics/route')
    const { GET } = mod as any
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.ok).toBe(true)
    expect(json.metrics).toBeDefined()
    expect(typeof json.metrics.visits).toBe('number')
  })
})
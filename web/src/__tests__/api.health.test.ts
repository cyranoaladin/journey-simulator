/** @jest-environment node */
import { NextResponse } from 'next/server'

describe('API /api/health', () => {
  it('GET returns ok', async () => {
    const mod = await import('../../app/api/health/route')
    const { GET } = mod as any
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.ok).toBe(true)
    expect(typeof json.time).toBe('string')
  })
})
/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/** @jest-environment node */
import { NextResponse } from 'next/server'

describe('API /api/ai/echo', () => {
  it('POST returns 400 for bad request', async () => {
    const mod = await import('../../app/api/ai/echo/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ text: '' }) } as any)
    expect(res.status).toBe(400)
  })

  it('POST returns processed payload', async () => {
    const mod = await import('../../app/api/ai/echo/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ text: 'hello', tags: ['x'] }) } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.upper).toBe('HELLO')
    expect(json.length).toBe(5)
    expect(Array.isArray(json.tags)).toBe(true)
  })

  it('POST works without tags', async () => {
    const mod = await import('../../app/api/ai/echo/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ text: 'world' }) } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.upper).toBe('WORLD')
    expect(Array.isArray(json.tags)).toBe(true)
    expect(json.tags.length).toBe(0)
  })

  it('GET returns sample', async () => {
    const mod = await import('../../app/api/ai/echo/route')
    const { GET } = mod as any
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.sample).toBe(true)
  })
})

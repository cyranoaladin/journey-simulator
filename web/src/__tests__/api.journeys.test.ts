/** @jest-environment node */
import { NextResponse } from 'next/server'

jest.mock('../server/db', () => ({
  prisma: {
    journey: {
      findMany: jest.fn(async () => []),
      create: jest.fn(async (d: any) => ({ id: 'j1', ...d.data })),
    },
    user: { upsert: jest.fn(async (d: any) => ({ id: 'u1', email: d.where.email })) },
  },
}))

describe('API /api/journeys', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    } as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('GET returns list', async () => {
    const mod = await import('../../app/api/journeys/route')
    const { GET } = mod as any
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.ok).toBe(true)
  })

  it('POST creates journey', async () => {
    const mod = await import('../../app/api/journeys/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ title: 'Intro', userEmail: 'a@b.com' }) } as any)
    expect(res.status).toBe(200)
  })

  it('POST creates journey without userEmail', async () => {
    const mod = await import('../../app/api/journeys/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ title: 'Intro2' }) } as any)
    expect(res.status).toBe(200)
  })

  it('POST bad request', async () => {
    const mod = await import('../../app/api/journeys/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(400)
  })
})

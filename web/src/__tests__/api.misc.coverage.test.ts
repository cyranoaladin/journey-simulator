/** @jest-environment node */
import { NextResponse } from 'next/server'

describe('Misc API coverage', () => {
  it('GET /api/healthz returns ok', async () => {
    const mod = await import('../../app/api/healthz/route')
    const { GET } = mod as any
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.ok).toBe(true)
  })

  it('POST /api/stake/simulate bad request then ok', async () => {
    const mod = await import('../../app/api/stake/simulate/route')
    const { POST } = mod as any
    const bad = await POST({ json: async () => ({}) } as any)
    expect(bad.status).toBe(400)
    const ok = await POST({ json: async () => ({ amount: 10 }) } as any)
    expect(ok.status).toBe(200)
    const json = await (ok as NextResponse).json()
    expect(json.staked).toBe(10)
  })

  it('POST /api/auth/siws/challenge returns challenge', async () => {
    const mod = await import('../../app/api/auth/siws/challenge/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(typeof json.challengeId).toBe('string')
    expect(typeof json.message).toBe('string')
  })

  it('POST /api/auth/siws/verify bad then ok', async () => {
    jest.resetModules()
    jest.doMock('@/server/siwsStore', () => ({
      getSiwsChallenge: jest.fn(async () => ({
        id: '550e8400-e29b-41d4-a716-446655440000',
        message: 'msg',
        nonce: 'nonce',
        used: false,
        expiresAt: Date.now() + 10000,
      })),
      markSiwsChallengeUsed: jest.fn(async () => {}),
    }))

    jest.doMock('tweetnacl', () => ({
      sign: { detached: { verify: jest.fn(() => true) } },
    }))

    // Mock PublicKey to avoid validation error
    jest.doMock('@solana/web3.js', () => ({
      PublicKey: class {
        constructor() {}
        toBytes() {
          return new Uint8Array()
        }
      },
    }))

    // Mock bs58
    jest.doMock('bs58', () => ({
      decode: jest.fn(() => new Uint8Array()),
    }))

    const mod = await import('../../app/api/auth/siws/verify/route')
    const { POST } = mod as any
    const bad = await POST({ json: async () => ({}) } as any)
    expect(bad.status).toBe(400)

    const ok = await POST({
      json: async () => ({
        address: '11111111111111111111111111111111',
        signature: 'abcdef0123456789',
        challengeId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    } as any)

    expect(ok.status).toBe(200)
    const json = await (ok as NextResponse).json()
    expect(typeof json.token).toBe('string')
  })

  it('POST /api/dao/vote/simulate yes/no', async () => {
    const mod = await import('../../app/api/dao/vote/simulate/route')
    const { POST } = mod as any
    const yes = await POST({ json: async () => ({ proposalId: 'p1', support: true }) } as any)
    expect(yes.status).toBe(200)
    const no = await POST({ json: async () => ({ proposalId: 'p1', support: 'no' }) } as any)
    expect(no.status).toBe(200)
  })

  it('POST /api/dao/vote/simulate bad request', async () => {
    const mod = await import('../../app/api/dao/vote/simulate/route')
    const { POST } = mod as any
    const bad = await POST({ json: async () => ({}) } as any)
    expect(bad.status).toBe(400)
  })

  it('GET /api/mint/last returns null when no row', async () => {
    jest.resetModules()
    jest.doMock('@/server/db', () => ({
      prisma: { mintLog: { findFirst: jest.fn(async () => null) } },
    }))
    const mod = await import('../../app/api/mint/last/route')
    const { GET } = mod as any
    const res = await GET({ url: 'http://localhost/api/mint/last', headers: new Headers() } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.last).toBe(null)
  })

  it('GET /api/mint/last returns last row when present', async () => {
    jest.resetModules()
    jest.doMock('@/server/db', () => ({
      prisma: {
        mintLog: {
          findFirst: jest.fn(async () => ({
            signature: 'sig',
            network: 'devnet',
            createdAt: new Date().toISOString(),
            spec: { a: 1 },
          })),
        },
      },
    }))
    const mod = await import('../../app/api/mint/last/route')
    const { GET } = mod as any
    const res = await GET({
      url: 'http://localhost/api/mint/last?userId=u1',
      headers: new Headers(),
    } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.last?.signature).toBe('sig')
  })

  it('POST /api/journeys/audit bad request without pitch/url', async () => {
    const mod = await import('../../app/api/journeys/audit/route')
    const { POST } = mod as any
    const bad = await POST({ json: async () => ({ language: 'fr' }) } as any)
    expect(bad.status).toBe(400)
  })

  it('GET /api/agents/logs without params (default limit)', async () => {
    const mod = await import('../../app/api/agents/logs/route')
    const { GET } = mod as any
    const res = await GET({ url: 'http://localhost/api/agents/logs' } as any)
    expect(res.status).toBe(200)
  })

  it('GET /api/agents/logs with and without journeyId', async () => {
    const { pushAgentLog } = await import('../../src/server/state')
    await pushAgentLog({ journeyId: 'abc', agent: 'Zyno', action: 'step', details: { d: 1 } })
    const mod = await import('../../app/api/agents/logs/route')
    const { GET } = mod as any
    const res1 = await GET({ url: 'http://localhost/api/agents/logs?limit=5' } as any)
    expect(res1.status).toBe(200)
    const json1 = await (res1 as NextResponse).json()
    expect(Array.isArray(json1.logs)).toBe(true)
    const res2 = await GET({ url: 'http://localhost/api/agents/logs?journeyId=abc&limit=5' } as any)
    expect(res2.status).toBe(200)
    const json2 = await (res2 as NextResponse).json()
    expect(json2.logs.every((l: any) => l.journeyId === 'abc')).toBe(true)
  })
})

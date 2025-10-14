/** @jest-environment node */
import { NextResponse } from 'next/server'

jest.mock('../server/db', () => ({ prisma: { mintLog: { create: jest.fn(async ()=>({ id:'m1' })) } } }))

describe('API /api/mint', () => {
  it('simulate rejects bad request', async () => {
    const mod = await import('../../app/api/mint/simulate/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(400)
  })

  it('simulate returns ok', async () => {
    const mod = await import('../../app/api/mint/simulate/route')
    const { POST } = mod as any
    const body = { recipient:'F11111111111111111111111111111111111111111', name:'Cert', symbol:'CERT', uri:'https://example.com' }
    const res = await POST({ json: async () => body } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.ok).toBe(true)
    expect(json.sim.ok).toBe(true)
  })

  it('execute fails without minter key', async () => {
    const mod = await import('../../app/api/mint/execute/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ sim: { ok:true, estFeeLamports: 1, riskScore: 0, network: 'devnet' } }) } as any)
    expect([400,500,403]).toContain(res.status)
  })

  it('execute blocked by kill switch', async () => {
    process.env.KILL_SWITCH = '1'
    const mod = await import('../../app/api/mint/execute/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ sim: { ok:true, estFeeLamports: 1, riskScore: 0, network: 'devnet' } }) } as any)
    expect(res.status).toBe(403)
    delete process.env.KILL_SWITCH
  })

  it('execute bad request on invalid body', async () => {
    const mod = await import('../../app/api/mint/execute/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(400)
  })

  it('execute success path when env MINTER_SECRET_KEY is set', async () => {
    process.env.MINTER_SECRET_KEY = 'fake_devnet_key'
    const mod = await import('../../app/api/mint/execute/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ sim: { ok:true, estFeeLamports: 1, riskScore: 0, network: 'devnet' } }) } as any)
    expect(res.status).toBe(200)
    delete process.env.MINTER_SECRET_KEY
  })
})
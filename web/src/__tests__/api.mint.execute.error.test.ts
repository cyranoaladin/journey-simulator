/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/** @jest-environment node */

jest.mock('../../src/server/queue', () => ({
  mintQueue: {
    add: jest.fn(async () => {
      throw new Error('Queue error')
    }),
  },
}))

describe('API /api/mint/execute error path', () => {
  it('returns 500 when queue.add throws', async () => {
    const mod = await import('../../app/api/mint/execute/route')
    const { POST } = mod as any
    const res = await POST({
      json: async () => ({
        spec: {
          recipient: 'WalletA',
          type: 'CERT_NFT',
          name: 'Test NFT',
          symbol: 'TEST',
          uri: 'https://example.com/meta.json',
        },
        sim: { ok: true, estFeeLamports: 1, riskScore: 0, network: 'devnet' },
      }),
    } as any)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('queue_failed')
  })
})

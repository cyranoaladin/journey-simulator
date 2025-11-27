/** @jest-environment node */

jest.mock('agents/tools/solana', () => ({
  executeReward: jest.fn(async () => {
    throw new Error('boom')
  }),
}))

describe('API /api/mint/execute error path', () => {
  it('returns 500 when executeReward throws', async () => {
    process.env.MINTER_SECRET_KEY = 'x'
    const mod = await import('../../app/api/mint/execute/route')
    const { POST } = mod as any
    const res = await POST({
      json: async () => ({ sim: { ok: true, estFeeLamports: 1, riskScore: 0, network: 'devnet' } }),
    } as any)
    expect(res.status).toBe(500)
    delete process.env.MINTER_SECRET_KEY
  })
})

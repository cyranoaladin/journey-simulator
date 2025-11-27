/** @jest-environment node */

describe('API /api/journeys/[id]/step bad request', () => {
  it('returns 400 when body invalid', async () => {
    const mod = await import('../../app/api/journeys/[id]/step/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any, { params: { id: 'abc' } } as any)
    expect(res.status).toBe(400)
  })
})

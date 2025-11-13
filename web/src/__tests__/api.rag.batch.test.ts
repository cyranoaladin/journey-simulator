/** @jest-environment node */
import { NextResponse } from 'next/server'

const mockDb = { doc: { create: jest.fn(async (d:any)=>({ id:'d'+Math.random(), ...d.data })) } }
jest.mock('../server/db', () => ({ prisma: mockDb }))

describe('API /api/rag/ingest-batch', () => {
  it('ingests multiple docs', async () => {
    const mod = await import('../../app/api/rag/ingest-batch/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ items: [ { title:'Aaa', content:'Bbb' }, { title:'Ccc', content:'Ddd', tags:'math' } ] }) } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.createdCount).toBe(2)
  })

  it('bad request', async () => {
    const mod = await import('../../app/api/rag/ingest-batch/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(400)
  })
})
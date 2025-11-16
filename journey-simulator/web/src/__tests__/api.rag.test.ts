/** @jest-environment node */
import { NextResponse } from 'next/server'

const mockDb = { doc: { findMany: jest.fn(async ()=>([{ id:'d1', title:'T', content:'C', embedding: new Array(64).fill(0).map((_,i)=> i===0?1:0) }])), create: jest.fn(async (d:any)=>({ id:'d2', ...d.data })) } }
jest.mock('../server/db', () => ({ prisma: mockDb }))

describe('API /api/rag', () => {
  it('query returns docs', async () => {
    const mod = await import('../../app/api/rag/query/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ text: 'algebra' }) } as any)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.ok).toBe(true)
    expect(json.count).toBeGreaterThan(0)
  })

  it('create doc', async () => {
    const mod = await import('../../app/api/rag/doc/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ title:'Algo', content:'Cours d\'algo', tags:'math' }) } as any)
    expect(res.status).toBe(200)
  })
  it('bad request on empty body', async () => {
    const mod = await import('../../app/api/rag/doc/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(400)
  })

  it('ingest stores embedding', async () => {
    const mod = await import('../../app/api/rag/ingest/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ title:'Vecteur', content:'Bonding', tags:'math' }) } as any)
    expect(res.status).toBe(200)
  })

  it('ingest stores embedding without tags', async () => {
    const mod = await import('../../app/api/rag/ingest/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ title:'Vecteur', content:'Sans tags' }) } as any)
    expect(res.status).toBe(200)
  })

  it('search ranks docs', async () => {
    const mod = await import('../../app/api/rag/search/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ text: 'TT' }) } as any)
    expect(res.status).toBe(200)
  })

  it('search handles docs without embeddings', async () => {
    const { prisma } = await import('../server/db') as any
    prisma.doc.findMany.mockResolvedValueOnce([{ id:'dX', title:'NoVec' }])
    const mod = await import('../../app/api/rag/search/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({ text: 'XX' }) } as any)
    expect(res.status).toBe(200)
  })

  it('ingest bad request', async () => {
    const mod = await import('../../app/api/rag/ingest/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(400)
  })

  it('ingest handles invalid json', async () => {
    const mod = await import('../../app/api/rag/ingest/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => { throw new Error('bad') } } as any)
    expect(res.status).toBe(400)
  })

  it('search handles invalid json', async () => {
    const mod = await import('../../app/api/rag/search/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => { throw new Error('bad') } } as any)
    expect(res.status).toBe(400)
  })

  it('query bad request', async () => {
    const mod = await import('../../app/api/rag/query/route')
    const { POST } = mod as any
    const res = await POST({ json: async () => ({}) } as any)
    expect(res.status).toBe(400)
  })
})

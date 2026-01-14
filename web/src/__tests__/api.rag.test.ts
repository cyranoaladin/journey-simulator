/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/** @jest-environment node */
import { POST as queryPost } from '../../app/api/rag/query/route'
import { POST as docPost } from '../../app/api/rag/doc/route'
import { POST as ingestPost } from '../../app/api/rag/ingest/route'
import { POST as ingestBatchPost } from '../../app/api/rag/ingest-batch/route'
import { POST as searchPost } from '../../app/api/rag/search/route'
import { createDoc, resetRagStore } from '@/server/ragStore'

type MockRequest = { json: () => Promise<any> }

const makeRequest = (payload: any): MockRequest => ({ json: async () => payload })
const makeThrowingRequest = (): MockRequest => ({
  json: async () => {
    throw new Error('bad_request')
  },
})

describe('API /api/rag', () => {
  beforeEach(() => {
    resetRagStore()
    process.env.DEMO_MODE = 'true'
    if ((globalThis.fetch as any)?.mockRestore) {
      ;(globalThis.fetch as jest.Mock).mockRestore()
    }
    delete (globalThis as any).fetch
  })

  it('query returns docs in demo mode', async () => {
    createDoc({ title: 'Algebra Basics', content: 'Linear algebra intro', tags: 'math' })
    const res = await queryPost(makeRequest({ text: 'algebra' }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.count).toBeGreaterThan(0)
    expect(body.docs[0].title.toLowerCase()).toContain('algebra')
  })

  it('query rejects invalid payload', async () => {
    const res = await queryPost(makeRequest({}) as any)
    expect(res.status).toBe(400)
  })

  it('doc route creates a document', async () => {
    const res = await docPost(
      makeRequest({ title: 'Algo', content: "Cours d'algo", tags: 'math' }) as any
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.doc).toMatchObject({ title: 'Algo' })
  })

  it('doc route validates payload', async () => {
    const res = await docPost(makeRequest({}) as any)
    expect(res.status).toBe(400)
  })

  it('ingest route stores a document with tags', async () => {
    const res = await ingestPost(
      makeRequest({ title: 'Vecteur', content: 'Bonding', tags: 'math' }) as any
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.id).toBeDefined()
  })

  it('ingest route stores a document without tags', async () => {
    const res = await ingestPost(makeRequest({ title: 'Vecteur', content: 'Sans tags' }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('ingest route rejects invalid payload', async () => {
    const res = await ingestPost(makeRequest({}) as any)
    expect(res.status).toBe(400)
  })

  it('ingest route handles invalid json', async () => {
    const res = await ingestPost(makeThrowingRequest() as any)
    expect(res.status).toBe(400)
  })

  it('ingest batch creates multiple documents', async () => {
    const res = await ingestBatchPost(
      makeRequest({
        items: [
          { title: 'Linear Algebra', content: 'Matrix operations', tags: 'math' },
          { title: 'Graph Theory', content: 'Nodes and edges' },
        ],
      }) as any
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.createdCount).toBe(2)
  })

  it('ingest batch rejects invalid payload', async () => {
    const res = await ingestBatchPost(makeRequest({}) as any)
    expect(res.status).toBe(400)
  })

  it('search ranks docs in demo mode', async () => {
    createDoc({ title: 'Solana Overview', content: 'Blockchain primer', tags: 'web3' })
    const res = await searchPost(makeRequest({ text: 'solana' }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.docs.length).toBeGreaterThan(0)
  })

  it('search handles invalid json', async () => {
    const res = await searchPost(makeThrowingRequest() as any)
    expect(res.status).toBe(400)
  })

  it('search handles remote docs without embeddings', async () => {
    process.env.DEMO_MODE = 'false'
    const mockFetch = jest.fn(async () => ({
      ok: true,
      json: async () => [
        { id: 'd1', path: 'Doc 1', meta: {} },
        { id: 'd2', path: 'Doc 2', meta: { embedding: [0.2, 0.3] } },
      ],
    }))
    globalThis.fetch = mockFetch as any
    const res = await searchPost(makeRequest({ text: 'doc' }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.docs.length).toBe(2)
    expect(mockFetch).toHaveBeenCalled()
  })
})

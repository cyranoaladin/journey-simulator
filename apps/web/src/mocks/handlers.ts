/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const handlers = [
  // Mock for /documents (RAG)
  http.get(`${API_BASE_URL}/documents`, () => {
    return HttpResponse.json({
      ok: true,
      count: 1,
      docs: [{ id: 'd1', title: 'Mock Document', content: 'Mock content', embedding: [1, 2, 3] }],
    })
  }),

  http.post(`${API_BASE_URL}/documents`, () => {
    return HttpResponse.json({ id: 'mock-doc-id' })
  }),

  // Mock for /agent_logs (Admin Logs)
  http.get(`${API_BASE_URL}/agent_logs`, () => {
    return HttpResponse.json([
      {
        id: 'l1',
        userId: 'u1',
        ts: new Date().toISOString(),
        agent: 'Zyno',
        action: 'step',
        details: {},
      },
    ])
  }),

  // Mock for /mint/mintlogs/last (Mint Last Log)
  http.get(`${API_BASE_URL}/mint/mintlogs/last`, () => {
    return HttpResponse.json({
      ok: true,
      last: {
        id: 'm1',
        userId: 'u1',
        txSig: 'mock-tx-sig',
        mintedAt: new Date().toISOString(),
      },
    })
  }),

  // Mock for /users/upsert (Journeys POST)
  http.post(`${API_BASE_URL}/users/upsert`, () => {
    return HttpResponse.json({ id: 'u1', email: 'mock@example.com' })
  }),

  // Mock for /journeys (Journeys GET/POST)
  http.get(`${API_BASE_URL}/journeys`, () => {
    return HttpResponse.json({
      ok: true,
      journeys: [{ id: 'j1', title: 'Mock Journey', userId: 'u1' }],
    })
  }),
  http.post(`${API_BASE_URL}/journeys`, () => {
    return HttpResponse.json({ id: 'j1', title: 'New Mock Journey', userId: 'u1' })
  }),
]

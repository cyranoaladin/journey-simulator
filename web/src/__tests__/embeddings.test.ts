/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { embedText, cosine } from '@/server/embeddings'

describe('embeddings', () => {
  it('produces normalized vectors and meaningful cosine', () => {
    const a = embedText('algebra linear')
    const b = embedText('linear algebra')
    const c = embedText('probability theory')
    const dotAB = cosine(a, b)
    const dotAC = cosine(a, c)
    expect(dotAB).toBeGreaterThan(dotAC)
    const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
    expect(Math.abs(normA - 1)).toBeLessThan(1e-6)
  })
})

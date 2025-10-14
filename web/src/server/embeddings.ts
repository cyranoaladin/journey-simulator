// Deterministic tiny embedding to avoid external dependencies (for MVP & tests)
export type Vector = number[]

export function embedText(text: string): Vector {
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const dim = 64
  const vec = new Array(dim).fill(0)
  for (const t of tokens) {
    let h = 2166136261
    for (let i = 0; i < t.length; i++) h = (h ^ t.charCodeAt(i)) * 16777619
    const idx = Math.abs(h) % dim
    vec[idx] += 1
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
  return vec.map((v) => v / norm)
}

export function cosine(a: Vector, b: Vector): number {
  const len = Math.min(a.length, b.length)
  let s = 0
  for (let i = 0; i < len; i++) s += a[i] * b[i]
  return s
}
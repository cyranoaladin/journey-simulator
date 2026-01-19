/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/* Simple in-memory rate limiter (per-process). Suitable for MVP/dev/demo only. */

const buckets = new Map<string, { count: number; resetAt: number }>()

function keyFrom(req: Request): string {
  // Try x-forwarded-for first (reverse proxy), fallback to client ip header (Next often hides it)
  // As a last resort, use user agent hash.
  const h = (req as any).headers?.get
    ? (req as any).headers.get('x-forwarded-for') ||
      (req as any).headers.get('cf-connecting-ip') ||
      ''
    : ''
  const ua = (req as any).headers?.get ? (req as any).headers.get('user-agent') || '' : ''
  return h || `ua:${ua}`
}

export function rateLimit(
  req: Request,
  opts?: { maxPerMinute?: number }
): { allowed: boolean; remaining: number; resetMs: number } {
  const max = Math.max(
    1,
    Math.min(600, Number(opts?.maxPerMinute ?? process.env.RATE_LIMIT_PER_MINUTE ?? 60))
  )
  const now = Date.now()
  const minute = 60_000
  const k = keyFrom(req)
  const cur = buckets.get(k)
  if (!cur || now > cur.resetAt) {
    const rec = { count: 1, resetAt: now + minute }
    buckets.set(k, rec)
    return { allowed: true, remaining: max - 1, resetMs: rec.resetAt - now }
  }
  if (cur.count >= max) {
    return { allowed: false, remaining: 0, resetMs: Math.max(0, cur.resetAt - now) }
  }
  cur.count++
  return {
    allowed: true,
    remaining: Math.max(0, max - cur.count),
    resetMs: Math.max(0, cur.resetAt - now),
  }
}

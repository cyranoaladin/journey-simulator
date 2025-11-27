import { NextResponse } from 'next/server'

// Rate limit per IP per path: LIMIT per WINDOW ms
const WINDOW = 60_000
const LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE || 60)

// Simple in-memory store (per process)
const globalAny = globalThis as any
const store: Map<string, { count: number; start: number }> = globalAny.__rate || new Map()
globalAny.__rate = store

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  const allowed = new Set<string>([
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ])
  const extra = (process.env.ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  for (const o of extra) allowed.add(o)
  return allowed.has(origin)
}

export function middleware(req: Request) {
  const url = new URL(req.url)
  const origin = (req.headers as any).get ? (req as any).headers.get('origin') : null
  const isPreflight = req.method === 'OPTIONS'
  const isCorsPath = url.pathname.startsWith('/api/') || url.pathname.startsWith('/user/') || url.pathname.startsWith('/journey/') || url.pathname.startsWith('/dao/') || url.pathname.startsWith('/admin/')

  // Handle CORS (including preflight) for relevant paths
  if (isCorsPath) {
    const res = isPreflight ? new NextResponse(null, { status: 204 }) : NextResponse.next()
    if (isAllowedOrigin(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin as string)
      res.headers.set('Vary', 'Origin')
      res.headers.set('Access-Control-Allow-Credentials', 'true')
      res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-user-id')
    }
    if (isPreflight) return res
  }

  // Admin guard: require x-api-key (skip preflight)
  if (url.pathname.startsWith('/admin')) {
    const provided = req.headers.get('x-api-key') || ''
    const expected = process.env.ADMIN_API_KEY || ''
    if (!expected || provided !== expected) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return NextResponse.next()
  }

  // API rate limit (only for /api)
  if (!url.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const key = `${ip}:${url.pathname}`
  const now = Date.now()
  const entry = store.get(key)
  if (!entry) {
    store.set(key, { count: 1, start: now })
    return NextResponse.next()
  }
  if (now - entry.start > WINDOW) {
    store.set(key, { count: 1, start: now })
    return NextResponse.next()
  }
  if (entry.count >= LIMIT) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  entry.count += 1
  return NextResponse.next()
}

export const config = { matcher: ['/api/:path*', '/admin/:path*', '/user/:path*', '/journey/:path*', '/dao/:path*'] }

import { NextResponse } from 'next/server'

// Rate limit per IP per path: LIMIT per WINDOW ms
const WINDOW = 60_000
const LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE || 60)

// Simple in-memory store (per process)
const globalAny = globalThis as any
const store: Map<string, { count: number; start: number }> = globalAny.__rate || new Map()
globalAny.__rate = store

export function middleware(req: Request) {
  const url = new URL(req.url)
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

export const config = { matcher: ['/api/:path*'] }
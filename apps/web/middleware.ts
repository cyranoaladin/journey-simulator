/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { NextResponse } from 'next/server'

// Rate limit per IP per path: LIMIT per WINDOW ms
const WINDOW = 60_000
const LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE || 60)

// Simple in-memory store (per process)
type RateEntry = { count: number; start: number }
type RateStore = Map<string, RateEntry>

declare global {
  // eslint-disable-next-line no-var
  var __rate: RateStore | undefined
}

const store: RateStore = globalThis.__rate || new Map()
globalThis.__rate = store

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  const allowed = new Set<string>(['http://127.0.0.1:5173', 'http://localhost:5173'])
  const extra = (process.env.ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const o of extra) allowed.add(o)
  return allowed.has(origin)
}

// Helper function to handle CORS headers
function handleCORS(res: NextResponse, origin: string | null) {
  if (isAllowedOrigin(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin as string)
    res.headers.set('Vary', 'Origin')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-api-key, x-user-id'
    )
  }
}

// Helper function to check admin authorization
function checkAdminAuth(req: Request): boolean {
  const provided = req.headers.get('x-api-key') || ''
  const expected = process.env.ADMIN_API_KEY || ''
  return !!(expected && provided === expected)
}

// Helper function to handle rate limiting
function handleRateLimit(req: Request, url: URL): NextResponse | null {
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

export function middleware(req: Request) {
  const url = new URL(req.url)
  const origin = req.headers.get('origin')
  const isPreflight = req.method === 'OPTIONS'
  const isApiPath = url.pathname.startsWith('/api/')
  const isUserPath = url.pathname.startsWith('/user/')
  const isJourneyPath = url.pathname.startsWith('/journey/')
  const isDaoPath = url.pathname.startsWith('/dao/')
  const isAdminPath = url.pathname.startsWith('/admin/')
  const isHandledPath = isApiPath || isUserPath || isJourneyPath || isDaoPath || isAdminPath

  // Root path redirect: UI désactivée, on renvoie vers le simulator.
  if (url.pathname === '/') {
    const simulatorBaseUrl = process.env.SIMULATOR_BASE_URL || 'http://127.0.0.1:3003/'
    return NextResponse.redirect(new URL(simulatorBaseUrl))
  }

  // Handle CORS (including preflight) for relevant paths
  if (isHandledPath) {
    const res = isPreflight ? new NextResponse(null, { status: 204 }) : NextResponse.next()
    handleCORS(res, origin)
    if (isPreflight) return res
  }

  // Admin guard: require x-api-key (skip preflight)
  if (isAdminPath) {
    if (!checkAdminAuth(req)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return NextResponse.next()
  }

  // API rate limit (only for /api)
  if (isApiPath) {
    const rateLimitResult = handleRateLimit(req, url)
    if (rateLimitResult) return rateLimitResult
  }

  // Pour tout le reste, UI désactivée => 404 plain text.
  if (!isHandledPath) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/api/:path*', '/admin/:path*', '/user/:path*', '/journey/:path*', '/dao/:path*'],
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest){
  type PrismaMint = { prisma: { mintLog: { findFirst: (args: any) => Promise<any> } } }
  const db = (await import('@/server/db')) as unknown as PrismaMint
  const url = new URL(req.url)
  const userId = req.headers.get('x-user-id') || url.searchParams.get('userId') || undefined
  const where = userId ? { userId } : {}
  const row = await db.prisma.mintLog.findFirst({ where, orderBy: { createdAt: 'desc' } })
  if(!row) return NextResponse.json({ ok: true, last: null })
  return NextResponse.json({ ok: true, last: { signature: row.signature, network: row.network, createdAt: row.createdAt, spec: row.spec } })
}
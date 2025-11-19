import { NextResponse } from 'next/server'
import { z } from 'zod'
import { simulateTx } from 'agents/tools/solana'

const Body = z.object({
  recipient: z.string(),
  name: z.string().min(1),
  symbol: z.string().min(1),
  uri: z.string().url(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const sim = await simulateTx({ ...parsed.data, type: 'CERT_NFT' })
  type PrismaMint = {
    prisma: {
      mintLog: {
        create: (args: {
          data: { spec: unknown; signature?: string | null; network: string }
        }) => Promise<{ id: string }>
      }
    }
  }
  const db = (await import('@/server/db')) as unknown as PrismaMint
  await db.prisma.mintLog.create({ data: { spec: parsed.data, network: sim.network } })
  return NextResponse.json({ ok: true, sim })
}

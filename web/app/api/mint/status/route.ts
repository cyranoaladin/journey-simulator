import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { mintQueue } from '@/server/queue'
import prisma from '@/lib/prisma'

// This route depends on request URL params and queue state; it must be dynamic.
export const dynamic = 'force-dynamic'

const Query = z.object({
  jobId: z.string().optional(),
  mintAddress: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = Query.safeParse({
      jobId: searchParams.get('jobId') ?? undefined,
      mintAddress: searchParams.get('mintAddress') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'bad_query' }, { status: 400 })
    }

    const { jobId, mintAddress } = parsed.data

    // Check by jobId
    if (jobId) {
      const job = await mintQueue.getJob(jobId)
      if (!job) {
        return NextResponse.json({ error: 'job_not_found' }, { status: 404 })
      }

      const state = await job.getState()
      const progress = job.progress
      const result = job.returnvalue

      return NextResponse.json({
        jobId,
        status: state,
        progress,
        result,
        failedReason: job.failedReason,
      })
    }

    // Check by mintAddress
    if (mintAddress) {
      const mintLog = await prisma.mintLog.findFirst({
        where: { mintAddress },
        orderBy: { createdAt: 'desc' },
      })

      if (!mintLog) {
        return NextResponse.json({ error: 'mint_not_found' }, { status: 404 })
      }

      return NextResponse.json({
        mintAddress,
        status: mintLog.status,
        signature: mintLog.signature,
        network: mintLog.network,
        createdAt: mintLog.createdAt,
        error: mintLog.error,
      })
    }

    return NextResponse.json({ error: 'jobId_or_mintAddress_required' }, { status: 400 })
  } catch (error) {
    console.error('Mint status check error:', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

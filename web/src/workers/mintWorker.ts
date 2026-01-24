/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Worker, Job } from 'bullmq'
import { redis } from '../server/redis'
import {
  executeReward,
  type RewardSpec,
  type SimResult,
} from '../../packages/agents/tools/solana'
import { log, error as logError } from '../server/logger'

// We need to import the Prisma client dynamically or ensure it's available in the worker context
// For simplicity, we'll assume we can import the db helper if it exists, or use PrismaClient directly.
// Given the previous code used dynamic import for db, we'll try to stick to that pattern or just instantiate Prisma here.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type MintJobData = {
  spec: RewardSpec
  sim: SimResult
  userId?: string | null
}

export const mintWorker = new Worker<MintJobData>(
  'minting',
  async (job: Job<MintJobData>) => {
    const { spec, sim, userId } = job.data
    log(`[Worker] Processing mint job ${job.id} for ${spec.recipient}`)

    try {
      // Execute the mint
      const result = await executeReward(spec, sim)

      // Log success to DB
      await prisma.mintLog.create({
        data: {
          spec: spec as any,
          network: sim.network,
          signature: result.txSig,
          mintAddress: result.mintAddress,
          status: 'SUCCESS',
          userId: userId,
        },
      })

      log(`[Worker] Mint success: ${result.mintAddress}`)
      return result
    } catch (error: any) {
      logError(`[Worker] Mint failed for job ${job.id}:`, error)

      // Log failure to DB
      await prisma.mintLog.create({
        data: {
          spec: spec as any,
          network: sim.network,
          error: error.message || 'Unknown error',
          status: 'FAILED',
          userId: userId,
        },
      })

      throw error // Re-throw to let BullMQ handle retries
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 mints in parallel
  }
)

mintWorker.on('completed', (job) => {
  log(`[Worker] Job ${job.id} completed!`)
})

mintWorker.on('failed', (job, err) => {
  logError(`[Worker] Job ${job?.id} failed with ${err.message}`)
})

import { mintWorker } from '../workers/mintWorker'
import { executeReward } from '../../packages/agents/tools/solana'
import { PrismaClient } from '@prisma/client'

// Mock dependencies
jest.mock('bullmq', () => ({
    Worker: class MockWorker {
        constructor(queueName: string, processor: any) {
            this.processor = processor
            this.on = jest.fn()
        }
        processor: any
        on: any
    }
}))

jest.mock('../server/redis', () => ({
    redis: {}
}))

jest.mock('../../packages/agents/tools/solana', () => ({
    executeReward: jest.fn()
}))

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        mintLog: {
            create: jest.fn()
        }
    }))
}))

describe('Mint Worker', () => {
    let processor: any
    let mockPrisma: any

    beforeAll(() => {
        // Get the processor function passed to the worker constructor
        processor = (mintWorker as any).processor
        // Get the prisma instance created in the worker
        mockPrisma = (PrismaClient as unknown as jest.Mock).mock.results[0].value
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('processes a successful mint job', async () => {
        const job = {
            id: 'job-123',
            data: {
                spec: { recipient: 'WalletA' },
                sim: { network: 'devnet' },
                userId: 'user-1'
            }
        }

            ; (executeReward as jest.Mock).mockResolvedValue({
                txSig: 'sig-123',
                mintAddress: 'mint-123'
            })

        await processor(job)

        expect(executeReward).toHaveBeenCalledWith(job.data.spec, job.data.sim)
        expect(mockPrisma.mintLog.create).toHaveBeenCalledWith({
            data: {
                spec: job.data.spec,
                network: 'devnet',
                signature: 'sig-123',
                mintAddress: 'mint-123',
                status: 'SUCCESS',
                userId: 'user-1'
            }
        })
    })

    it('handles mint failure', async () => {
        const job = {
            id: 'job-456',
            data: {
                spec: { recipient: 'WalletB' },
                sim: { network: 'devnet' },
                userId: 'user-2'
            }
        }

        const error = new Error('Mint failed')
            ; (executeReward as jest.Mock).mockRejectedValue(error)

        await expect(processor(job)).rejects.toThrow('Mint failed')

        expect(mockPrisma.mintLog.create).toHaveBeenCalledWith({
            data: {
                spec: job.data.spec,
                network: 'devnet',
                error: 'Mint failed',
                status: 'FAILED',
                userId: 'user-2'
            }
        })
    })
})

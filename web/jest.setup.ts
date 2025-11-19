import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for libs requiring TextEncoder/TextDecoder (e.g., noble)
;(global as any).TextEncoder = TextEncoder
;(global as any).TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder

// Ensure tests use in-memory state store and demo fallbacks by default
process.env.STATE_DRIVER = process.env.STATE_DRIVER || 'memory'
process.env.DEMO_MODE = process.env.DEMO_MODE || 'true'
process.env.KILL_SWITCH = '0'
// Ensure MINTER_SECRET_KEY is unset by default in tests
if (process.env.MINTER_SECRET_KEY) delete process.env.MINTER_SECRET_KEY

// Mock Solana tools to avoid network during tests
jest.mock('agents/tools/solana', () => ({
  simulateTx: jest.fn(async () => ({ ok: true, estFeeLamports: 5000, riskScore: 0.12, network: 'devnet', txB64: 'AQID' })),
  executeReward: jest.fn(async () => ({ txSig: 'test-devnet-txsig' })),
}))

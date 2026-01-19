/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/** @jest-environment node */
import { NextResponse } from 'next/server'

jest.mock('@solana/web3.js', () => {
  class PublicKey {
    constructor(_: string) {}
  }
  class Connection {
    constructor(_: string) {}
    getLatestBlockhash = async () => ({ blockhash: 'BH' })
  }
  const SystemProgram = { transfer: (_: any) => ({}) }
  class TransactionMessage {
    constructor(_: any) {}
    compileToV0Message() {
      return { compiled: true } as any
    }
  }
  class VersionedTransaction {
    message: any
    constructor(message: any) {
      this.message = message
    }
    serialize() {
      return new Uint8Array([1, 2, 3])
    }
    static deserialize(_: Uint8Array) {
      return new VersionedTransaction({})
    }
  }
  return { PublicKey, Connection, SystemProgram, TransactionMessage, VersionedTransaction }
})

describe('API /api/tx/prepare', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('returns 500 when SOLANA_RPC_URL missing', async () => {
    delete (process as any).env.SOLANA_RPC_URL
    const mod = await import('../../app/api/tx/prepare/route')
    const { POST } = mod as any
    const req = {
      json: async () => ({ kind: 'transfer', params: { to: 'X', payer: 'Y', lamports: 1 } }),
    } as any
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await (res as NextResponse).json()
    expect(json.error).toBe('server_misconfig')
  })

  it('returns 400 for bad request', async () => {
    process.env.SOLANA_RPC_URL = 'http://localhost'
    const mod = await import('../../app/api/tx/prepare/route')
    const { POST } = mod as any
    const req = { json: async () => ({ kind: 'unknown' }) } as any
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for unsupported kind', async () => {
    process.env.SOLANA_RPC_URL = 'http://localhost'
    const mod = await import('../../app/api/tx/prepare/route')
    const { POST } = mod as any
    const req = { json: async () => ({ kind: 'mint' }) } as any
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await (res as NextResponse).json()
    expect(json.error).toBe('unsupported_kind')
  })

  it('returns ok and tx for transfer', async () => {
    process.env.SOLANA_RPC_URL = 'http://localhost'
    const mod = await import('../../app/api/tx/prepare/route')
    const { POST } = mod as any
    const body = { kind: 'transfer', params: { to: 'X', payer: 'Y', lamports: 123 } }
    const req = { json: async () => body } as any
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await (res as NextResponse).json()
    expect(json.ok).toBe(true)
    expect(typeof json.tx).toBe('string')
    // Our mock serialize returns [1,2,3] => base64 AQID
    expect(json.tx).toBe('AQID')
  })
})

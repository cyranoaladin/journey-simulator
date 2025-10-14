import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { bumpTxPrepared } from '@/server/metrics'

const Body = z.object({
  kind: z.enum(['mint','transfer']),
  params: z.object({ to: z.string().optional(), lamports: z.number().optional(), payer: z.string().optional() }).optional()
})

export async function POST(req: Request){
  const json = await req.json().catch(()=>null)
  const parsed = Body.safeParse(json)
  if(!parsed.success){
    return NextResponse.json({ error: 'bad_request', details: parsed.error.flatten() }, { status: 400 })
  }
  const RPC_URL = process.env.SOLANA_RPC_URL
  if(!RPC_URL){
    return NextResponse.json({ error: 'server_misconfig', details: 'Define SOLANA_RPC_URL in env' }, { status: 500 })
  }
  try{
    const { kind, params } = parsed.data
    if(kind === 'transfer'){
      const payerStr = params?.payer
      const toStr = params?.to
      const lamportsNum = Number(params?.lamports)
      if (!payerStr || !toStr || !Number.isFinite(lamportsNum) || lamportsNum <= 0) {
        return NextResponse.json({ error: 'bad_params' }, { status: 400 })
      }
      const payer = new PublicKey(payerStr)
      const to = new PublicKey(toStr)
      const connection = new Connection(RPC_URL, 'confirmed')
      const latest = await connection.getLatestBlockhash()
      const ix = SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: lamportsNum })
      const message = new TransactionMessage({ payerKey: payer, recentBlockhash: latest.blockhash, instructions: [ix] }).compileToV0Message()
      const vtx = new VersionedTransaction(message)
      const b64 = Buffer.from(vtx.serialize()).toString('base64')
      bumpTxPrepared()
      return NextResponse.json({ ok:true, tx:b64 })
    }
    return NextResponse.json({ error: 'unsupported_kind' }, { status: 400 })
  } catch (e){
    console.error(e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

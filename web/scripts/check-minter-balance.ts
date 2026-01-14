/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js'
import fs from 'node:fs'
const secret = JSON.parse(fs.readFileSync('minter.json', 'utf8')) as number[]
const kp = Keypair.fromSecretKey(Uint8Array.from(secret))
;(async () => {
  const conn = new Connection(clusterApiUrl('devnet'), 'confirmed')
  const bal = await conn.getBalance(kp.publicKey)
  console.log('Public Key:', kp.publicKey.toBase58())
  console.log('Balance (SOL):', bal / 1_000_000_000)
})().catch(console.error)

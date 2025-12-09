import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import fs from 'fs'
import path from 'path'

async function main() {
  const kp = Keypair.generate()
  const pubkey = kp.publicKey.toBase58()
  const secretBytes = Array.from(kp.secretKey)

  const outDir = path.resolve(process.cwd(), 'scripts')
  const outPath = path.resolve(process.cwd(), 'minter.json')
  try {
    fs.mkdirSync(outDir, { recursive: true })
  } catch (dirError) {
    console.warn('Could not create scripts directory; continuing anyway', dirError)
  }

  fs.writeFileSync(outPath, JSON.stringify(secretBytes, null, 2))
  console.log('Saved keypair to:', outPath)
  console.log('Public Key:', pubkey)
  const secretBase58 = bs58.encode(kp.secretKey)
  console.log('MINTER_SECRET_KEY (base58):', secretBase58)

  const conn = new Connection(clusterApiUrl('devnet'), 'confirmed')
  console.log('Requesting airdrop (2 SOL) on devnet...')
  const sig = await conn.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL)
  await conn.confirmTransaction(sig, 'confirmed')
  const balance = await conn.getBalance(kp.publicKey)
  console.log('Balance (SOL):', balance / LAMPORTS_PER_SOL)

  console.log('\nNEXT STEPS:')
  console.log('- Copiez MINTER_SECRET_KEY (base58) dans web/.env')
  console.log('- Mettez SOLANA_CLUSTER=devnet et RPC=https://api.devnet.solana.com')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

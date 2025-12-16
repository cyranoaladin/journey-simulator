#!/usr/bin/env ts-node
/**
 * Script to check minter wallet status and balance
 * Usage: ts-node scripts/check-minter-status.ts
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { clusterApiUrl } from '@solana/web3.js'
import bs58 from 'bs58'

async function checkMinterStatus() {
  const secretBase58 = process.env.MINTER_SECRET_KEY
  if (!secretBase58) {
    console.error('❌ MINTER_SECRET_KEY not set in environment')
    process.exit(1)
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet')
  const umi = createUmi(rpcUrl)

  let secretKeyBytes: Uint8Array
  if (secretBase58.startsWith('[') && secretBase58.endsWith(']')) {
    secretKeyBytes = Uint8Array.from(JSON.parse(secretBase58))
  } else {
    secretKeyBytes = bs58.decode(secretBase58)
  }

  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes)
  const publicKey = keypair.publicKey.toString()

  console.log('🔍 Checking minter status...')
  console.log(`📍 Public Key: ${publicKey}`)
  console.log(`🌐 Network: ${rpcUrl}`)

  try {
    const balance = await umi.rpc.getBalance(keypair.publicKey)
    const solBalance = Number(balance.basisPoints) / 1e9

    console.log(`💰 Balance: ${solBalance} SOL (${balance.basisPoints} lamports)`)

    if (solBalance < 0.1) {
      console.warn('⚠️  WARNING: Balance is low! Consider funding the minter wallet.')
    } else {
      console.log('✅ Balance is sufficient for minting operations')
    }

    // Check if account exists
    const accountInfo = await umi.rpc.getAccount(keypair.publicKey)
    if (accountInfo.exists) {
      console.log('✅ Minter account exists on-chain')
    } else {
      console.warn('⚠️  Minter account does not exist yet (needs initial funding)')
    }
  } catch (error: any) {
    console.error('❌ Error checking minter status:', error.message)
    process.exit(1)
  }
}

checkMinterStatus().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})

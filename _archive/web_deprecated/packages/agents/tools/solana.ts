import { clusterApiUrl, type Cluster } from '@solana/web3.js'
import bs58 from 'bs58'

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
  publicKey,
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  percentAmount,
  type Umi,
} from '@metaplex-foundation/umi'
import {
  mplTokenMetadata,
  createAndMint,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata'
import { base58 } from '@metaplex-foundation/umi/serializers'

export type RewardSpec = {
  recipient: string
  type: 'CERT_NFT'
  name: string
  symbol: string
  uri: string
}

export type SimResult = {
  ok: boolean
  estFeeLamports: number
  riskScore: number
  txB64?: string
  network: string
}

// --- helpers UMI ---

function getRpcEndpoint(): string {
  const envRpc = process.env.SOLANA_RPC_URL
  if (envRpc && envRpc.length > 0) return envRpc
  const cluster = (process.env.SOLANA_CLUSTER as Cluster) || 'devnet'
  return clusterApiUrl(cluster)
}

function createMinterUmi(): Umi {
  const endpoint = getRpcEndpoint()
  const umi = createUmi(endpoint).use(mplTokenMetadata())

  const secretBase58 = process.env.MINTER_SECRET_KEY
  if (!secretBase58) {
    throw new Error('Missing MINTER_SECRET_KEY in environment')
  }

  let secretKeyBytes: Uint8Array
  // Support JSON array format
  if (secretBase58.startsWith('[') && secretBase58.endsWith(']')) {
    secretKeyBytes = Uint8Array.from(JSON.parse(secretBase58))
  } else {
    secretKeyBytes = bs58.decode(secretBase58)
  }

  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes)
  const signer = createSignerFromKeypair(umi, keypair)
  umi.use(signerIdentity(signer))

  return umi
}

// --- simulateTx ---
// Objectif : construire une transaction réelle de mint (sans l’envoyer)
// et retourner une estimation de fee + txB64 (utile pour debug / logs).
export async function simulateTx(spec: RewardSpec): Promise<SimResult> {
  const network = process.env.SOLANA_CLUSTER || 'devnet'

  try {
    const umi = createMinterUmi()
    const mint = generateSigner(umi)

    const builder = createAndMint(umi, {
      mint,
      authority: umi.identity,
      name: spec.name,
      symbol: spec.symbol,
      uri: spec.uri,
      sellerFeeBasisPoints: percentAmount(0), // pas de royalties pour un Proof-of-Skill
      decimals: 0,
      amount: 1,
      tokenOwner: publicKey(spec.recipient),
      tokenStandard: TokenStandard.NonFungible,
    })

    // On construit la tx signée mais on ne l’envoie pas
    const latest = await umi.rpc.getLatestBlockhash()
    const tx = await builder.setBlockhash(latest).buildAndSign(umi)

    const serialized = umi.transactions.serialize(tx)
    const txB64 = bs58.encode(serialized) // base58 du blob binaire (utile log/debug)

    // Fee estimée : on reste simple, une signature => ~5000 lamports sur devnet
    const estFeeLamports = 5000
    const riskScore = 0.1 // placeholder pour un futur moteur de risk scoring

    return {
      ok: true,
      estFeeLamports,
      riskScore,
      txB64,
      network,
    }
  } catch (e) {
    console.error('simulateTx error', e)
    return {
      ok: false,
      estFeeLamports: 0,
      riskScore: 1,
      network,
    }
  }
}

// --- executeReward ---
// Envoie réellement la tx de mint via UMI / MPL Token Metadata
export async function executeReward(
  spec: RewardSpec,
  sim: SimResult
): Promise<{ txSig: string; slot?: number; mintAddress: string }> {
  if (process.env.KILL_SWITCH === '1') {
    throw new Error('Kill switch active')
  }
  if (!process.env.MINTER_SECRET_KEY) {
    throw new Error('Missing MINTER_SECRET_KEY')
  }

  const umi = createMinterUmi()
  const mint = generateSigner(umi)

  const builder = createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: spec.name,
    symbol: spec.symbol,
    uri: spec.uri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 0,
    amount: 1,
    tokenOwner: publicKey(spec.recipient),
    tokenStandard: TokenStandard.NonFungible,
  })

  const result = await builder.sendAndConfirm(umi, {
    confirm: { commitment: 'confirmed' },
  })

  const txSig = bs58.encode(result.signature)
  const mintAddress = mint.publicKey.toString()

  return { txSig, mintAddress }
}

// Placeholder imports for future UMI integration
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// import { publicKey } from '@metaplex-foundation/umi'

export type RewardSpec = { recipient: string; type: 'CERT_NFT'; name: string; symbol: string; uri: string }
export type SimResult = { ok: boolean; estFeeLamports: number; riskScore: number; txB64?: string; network: string }

export async function simulateTx(spec: RewardSpec): Promise<SimResult>{
  const network = process.env.SOLANA_CLUSTER || 'devnet'
  // For MVP reliability, return a constant estimate and a placeholder tx
  // A real implementation would build Metaplex Token Metadata instructions and serialize
  // UMI client can be created here when needed to build real transactions
  return { ok: true, estFeeLamports: 5000, riskScore: 0.12, txB64: 'AQID', network }
}

export function buildMetadataInstructionPlaceholder(spec: RewardSpec){
  // Placeholder: in Phase 2b, construct MPL createMetadata instructions with real accounts
  return { programId: 'mpl-token-metadata', keys: [], data: { name: spec.name, symbol: spec.symbol, uri: spec.uri } }
}

export async function executeReward(sim: SimResult): Promise<{ txSig: string; slot?: number }>{
  // Placeholder execution: in Phase 2b, sign via isolated signer/HSM and broadcast
  if(process.env.KILL_SWITCH === '1') throw new Error('Kill switch active')
  if(!process.env.MINTER_SECRET_KEY) throw new Error('Missing MINTER_SECRET_KEY')
  // SimSigner path
  const { signBase64Transaction } = await import('@/server/signer')
  const txB64 = sim.txB64 ?? 'AQID' // fallback placeholder
  const res = await signBase64Transaction(txB64)
  return { txSig: res.signature }
}

// Placeholder imports for future UMI integration
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// import { publicKey } from '@metaplex-foundation/umi'

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

export async function simulateTx(spec: RewardSpec): Promise<SimResult> {
  const network = process.env.SOLANA_CLUSTER || 'devnet'
  const enableRealMode = process.env.ENABLE_UMI_REAL === '1'
  
  if (enableRealMode) {
    // Real mode: Build actual Metaplex instructions and simulate
    // UMI client can be created here to build real transactions
    // TODO: Implement real UMI-based transaction building
    return { ok: true, estFeeLamports: 5000, riskScore: 0.12, txB64: 'REAL_TX_PLACEHOLDER', network }
  }
  
  // Demo mode: Return placeholder estimate
  return { ok: true, estFeeLamports: 5000, riskScore: 0.12, txB64: 'DEMO_TX', network }
}

export function buildMetadataInstructionPlaceholder(spec: RewardSpec) {
  // Placeholder: in Phase 2b, construct MPL createMetadata instructions with real accounts
  return {
    programId: 'mpl-token-metadata',
    keys: [],
    data: { name: spec.name, symbol: spec.symbol, uri: spec.uri },
  }
}

export async function executeReward(sim: SimResult): Promise<{ txSig: string; slot?: number }> {
  if (process.env.KILL_SWITCH === '1') throw new Error('Kill switch active')
  
  const enableRealMode = process.env.ENABLE_UMI_REAL === '1'
  
  if (enableRealMode) {
    if (!process.env.MINTER_SECRET_KEY) throw new Error('Missing MINTER_SECRET_KEY')
    // Real mode: Sign via isolated signer/HSM and broadcast to blockchain
    const { signBase64Transaction } = await import('@/server/signer')
    const txB64 = sim.txB64 ?? 'AQID'
    const res = await signBase64Transaction(txB64)
    return { txSig: res.signature }
  }
  
  // Demo mode: Return simulated signature without actual blockchain interaction
  return { txSig: `demo-sig-${Date.now()}` }
}

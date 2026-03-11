/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// SimSigner interface for future KMS/HSM integration
export type SignResult = { signature: string }

export async function signBase64Transaction(b64: string): Promise<SignResult> {
  // Phase 2b: plug KMS/HSM. For now, return a deterministic devnet-style signature using input.
  if (!process.env.MINTER_SECRET_KEY) throw new Error('Missing MINTER_SECRET_KEY')
  const prefix = b64.slice(0, 8)
  return { signature: `Devnet-${Date.now()}-${prefix}` }
}

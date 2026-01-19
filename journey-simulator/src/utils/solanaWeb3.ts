/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

type SolanaWeb3 = typeof import('@solana/web3.js')

let loader: Promise<SolanaWeb3> | null = null

/**
 * Lazy loader for @solana/web3.js.
 * Keeps the heavy solana chunk out of non-wallet routes and only loads it when required.
 */
export const loadSolanaWeb3 = async (): Promise<SolanaWeb3> => {
  if (!loader) {
    loader = import('@solana/web3.js')
  }

  return loader
}

'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState, useEffect } from 'react'

export default function MintPage() {
  const { publicKey, signTransaction, connected } = useWallet()
  const [status, setStatus] = useState<string>('')
  const [isMinting, setIsMinting] = useState(false)
  const [hasPass, setHasPass] = useState(false)

  // Check if user already has a pass
  useEffect(() => {
    if (connected && publicKey) {
      checkPass(publicKey.toString())
    }
  }, [connected, publicKey])

  const checkPass = async (address: string) => {
    try {
      const res = await fetch('/api/pass/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })
      const data = await res.json()
      if (data.hasPass) {
        setHasPass(true)
        setStatus('You already hold a Money Factory AI Pass!')
      }
    } catch (err) {
      console.error('Failed to check pass:', err)
    }
  }

  const handleMint = async () => {
    if (!publicKey || !signTransaction) return

    try {
      setIsMinting(true)
      setStatus('Preparing transaction...')

      // 1. In a real implementation, we would fetch the Candy Machine state
      // and build the mint transaction here using Metaplex SDK.
      // For this MVP, we'll simulate the flow or call a backend endpoint if we chose server-side prep.
      // Since the requirement is client-side minting, we would use:
      // const umi = createUmi(...).use(walletAdapterIdentity(wallet));
      // await mintV2(umi, { candyMachine: ..., ... }).sendAndConfirm(umi);

      // Simulating mint delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setStatus('Please sign the transaction in your wallet...')

      // Simulating signature
      // const tx = ...
      // const signedTx = await signTransaction(tx);
      // const sig = await connection.sendRawTransaction(signedTx.serialize());

      setStatus('Minting in progress... (Simulated)')
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setStatus('Success! You have minted a Money Factory AI Pass.')
      setHasPass(true)

      // Re-check pass status to update DB
      await checkPass(publicKey.toString())
    } catch (error: any) {
      console.error('Mint error:', error)
      setStatus(`Mint failed: ${error.message}`)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Money Factory AI Pass
        </h1>

        <div className="mb-8 flex justify-center">
          <div className="w-48 h-48 bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
            {hasPass ? (
              <span className="text-4xl">🎟️</span>
            ) : (
              <span className="text-gray-400">Pass Preview</span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
          </div>

          {connected && (
            <div className="text-center">
              {hasPass ? (
                <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400">
                  ✅ You have access!
                </div>
              ) : (
                <button
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMinting ? 'Minting...' : 'Mint Access Pass'}
                </button>
              )}
            </div>
          )}

          {status && <div className="text-center text-sm text-gray-300 mt-4">{status}</div>}

          <div className="text-xs text-gray-500 text-center mt-8">Powered by Solana & Metaplex</div>
        </div>
      </div>
    </div>
  )
}

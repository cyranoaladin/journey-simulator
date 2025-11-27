'use client'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function WalletPage() {
  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-6">Wallet</h1>
      <div className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default">
        <WalletMultiButton />
      </div>
    </main>
  )
}

'use client'
import { useState } from 'react'
import { VersionedTransaction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

// Enable test mode for E2E to bypass wallet signing
const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === '1'

export default function TxPage() {
  const [to, setTo] = useState('')
  const [lamports, setLamports] = useState('10000')
  const [status, setStatus] = useState<string | undefined>()
  const { connection } = useConnection()
  const wallet = useWallet()
  const isConnected = !!wallet.publicKey

  async function prepareAndSend() {
    setStatus('Préparation de la transaction...')
    const payer = wallet.publicKey?.toBase58()
    if (!payer) {
      setStatus('Connectez un wallet')
      return
    }
    const res = await fetch('/api/tx/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'transfer', params: { to, lamports: Number(lamports), payer } }),
    })
    const json = await res.json()
    if (!res.ok || !json || !json.tx) {
      setStatus('Erreur préparation TX')
      return
    }
    const txB64 = json.tx as string

    if (TEST_MODE) {
      setStatus('Simulated OK: TX préparée (mode test)')
      return
    }

    // Decode base64 to Uint8Array without Node Buffer
    const binary = atob(txB64)
    const txBytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) txBytes[i] = binary.charCodeAt(i)

    const tx = VersionedTransaction.deserialize(txBytes)
    if (!wallet.signTransaction) {
      setStatus('Wallet ne supporte pas signTransaction')
      return
    }
    const signed = await wallet.signTransaction(tx)
    const sig = await connection.sendRawTransaction(signed.serialize())
    setStatus('Signature: ' + sig)
    await connection.confirmTransaction(sig, 'confirmed')
    setStatus('Confirmée: ' + sig)
  }

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-6" data-testid="tx-heading">
        Préparer une transaction
      </h1>
      <div className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="opacity-75">Destinataire (base58)</span>
            <input
              className="text-black px-3 py-2 rounded"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Adresse Solana"
            />
          </label>
          <label className="flex flex-col">
            <span className="opacity-75">Lamports</span>
            <input
              className="text-black px-3 py-2 rounded"
              value={lamports}
              onChange={(e) => setLamports(e.target.value)}
            />
          </label>
          <button
            className="btn btn-primary w-fit"
            data-testid="tx-submit"
            onClick={prepareAndSend}
          >
            Préparer et envoyer
          </button>
          {!isConnected && (
            <p className="opacity-90" data-testid="tx-wallet-cta">
              Connectez un wallet
            </p>
          )}
          {status && (
            <p className="opacity-90" data-testid="status">
              {status}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

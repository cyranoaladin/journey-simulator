'use client'
import { useState } from 'react'

type SimResult = { ok: boolean; estFeeLamports: number; riskScore: number; txB64?: string; network: string }
type MintSimResponse = { ok: boolean; sim: SimResult } | { error: string }

export default function MintPage(){
  const [output, setOutput] = useState<MintSimResponse | null>(null)
  const [txSig, setTxSig] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function simulate(){
    setLoading(true)
    try{
      const res = await fetch('/api/mint/simulate', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ recipient:'F11111111111111111111111111111111111111111', name:'Certif', symbol:'CERT', uri:'https://example.com/metadata.json' }) })
      const json = await res.json()
      setOutput(json)
      setTxSig(null)
    } finally {
      setLoading(false)
    }
  }

  async function execute(){
    if(!output || !('sim' in output)) return
    setLoading(true)
    try{
      const res = await fetch('/api/mint/execute', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ sim: (output as any).sim }) })
      const json = await res.json()
      setTxSig(json?.tx?.txSig ?? null)
    } finally{
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-2">Mint NFT</h1>
      <p className="opacity-80 mb-6">Flux sécurisé en préparation: la transaction sera construite côté serveur (devnet), signée via un service sécurisé (Phase 2).</p>
      <div className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default">
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={simulate} disabled={loading}>{loading?'...':'Simuler mint (devnet)'}</button>
          <button className="btn" onClick={execute} disabled={loading || !output}>Exécuter</button>
        </div>
        {output && <pre className="mt-4 text-xs bg-black/40 p-3 rounded">{JSON.stringify(output,null,2)}</pre>}
        {txSig && (
          <div className="mt-4 text-sm">
            Signature: <code className="mx-2">{txSig}</code>
          </div>
        )}
      </div>
    </main>
  )
}

'use client'
import { useState } from 'react'

export default function RagPage(){
  const [q, setQ] = useState('')
  const [res, setRes] = useState<unknown | null>(null)
  const [loading, setLoading] = useState(false)

  async function runQuery(){
    setLoading(true)
    try{
      const r = await fetch('/api/rag/query', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ text: q }) })
      setRes(await r.json())
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-4">RAG (MVP)</h1>
      <div className="flex gap-2 mb-4">
        <input className="text-black px-3 py-2 rounded min-w-[300px]" placeholder="Rechercher..." value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="btn btn-primary" disabled={loading} onClick={runQuery}>{loading?'...':'Chercher'}</button>
      </div>
      {res != null && (
        <div className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default">
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(res, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}
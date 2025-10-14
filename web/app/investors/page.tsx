'use client'
import { useEffect, useState } from 'react'

type Metrics = { healthHits: number; echoHits: number; txPrepared: number; visits: number }

export default function InvestorsPage(){
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/metrics')
      .then(r => r.json())
      .then(j => { if(mounted) setMetrics(j.metrics as Metrics) })
      .finally(() => { if(mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-6">Investors Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['visits','txPrepared','echoHits','healthHits'] as (keyof Metrics)[]).map((k) => (
          <div key={k} className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default">
            <h2 className="text-lg opacity-75 mb-2">{k}</h2>
            <p className="text-3xl font-semibold">{metrics ? metrics[k] : (loading ? '...' : 0)}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
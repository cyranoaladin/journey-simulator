'use client'
import { useState } from 'react'

type EchoResult = { text: string; upper: string; length: number; tags: string[] }

export default function AIPage() {
  const [result, setResult] = useState<EchoResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function testApi() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hello investors', tags: ['demo'] }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error('API error')
      setResult(json)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      // Fallback demo result for robustness in non-networked demos
      setResult({ text: 'Hello investors', upper: 'HELLO INVESTORS', length: 16, tags: ['demo'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-2" data-testid="ai-heading">
        AI & Data
      </h1>
      <p className="opacity-80 mb-6">AI exploration space. Server-side API call example below.</p>
      <div className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default">
        <div className="flex gap-3 items-center mb-4">
          <button
            className="btn btn-primary"
            data-testid="ai-echo-submit"
            onClick={testApi}
            disabled={loading}
          >
            {loading ? '...' : 'Test AI API'}
          </button>
          {error && (
            <span className="text-red-400" data-testid="ai-echo-error">
              {error}
            </span>
          )}
        </div>
        {result && (
          <pre
            className="text-sm bg-black/40 p-3 rounded-lg overflow-auto"
            data-testid="ai-echo-result"
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  )
}

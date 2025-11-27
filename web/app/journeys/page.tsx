'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const personas = [
  { id: 'builder', label: 'Builder' },
  { id: 'investor', label: 'Investor' },
  { id: 'student', label: 'Student' },
]

export default function JourneysHome() {
  const router = useRouter()
  const [persona, setPersona] = useState(personas[0].id)
  const [mode, setMode] = useState<'demo' | 'prod'>('demo')
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Journey (${persona}/${mode})`,
        }),
      })
      if (!r.ok) {
        const t = await r.text()
        throw new Error(t)
      }
      const data = await r.json()
      const id = data?.journey?.id || data?.id || data?.journeyId
      if (!id) throw new Error('No journey id returned')
      router.push(`/journeys/${id}`)
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Start a Journey</h1>
      <p className="opacity-80 mb-6 text-sm">
        Configure the persona, mode and language, then create a new journey.
      </p>

      <div className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Persona</span>
          <select
            className="bg-bg-mid/50 border border-white/10 rounded p-2"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Mode</span>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === 'demo'}
                onChange={() => setMode('demo')}
              />{' '}
              Demo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === 'prod'}
                onChange={() => setMode('prod')}
              />{' '}
              Production
            </label>
          </div>
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Language</span>
          <select
            className="bg-bg-mid/50 border border-white/10 rounded p-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      {error && <div className="mt-4 text-sm text-red-400">{error}</div>}

      <button
        disabled={loading}
        onClick={start}
        className="mt-6 rounded px-4 py-2 bg-white/10 border border-white/10"
      >
        {loading ? 'Creating…' : 'Create Journey'}
      </button>
    </div>
  )
}

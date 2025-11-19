'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { UIBlocksRenderer } from '@/components/Journey/UIBlocksRenderer'

export default function JourneyPage() {
  const params = useParams()
  const journeyId = params?.id as string

  const [persona, setPersona] = useState('builder')
  const [mode, setMode] = useState<'demo' | 'prod'>('demo')
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [phaseId, setPhaseId] = useState('learn')
  const [trackId, setTrackId] = useState('builder')

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resp, setResp] = useState<any | null>(null)
  const [journeyState, setJourneyState] = useState<any>({})

  const rightLogHref = useMemo(
    () => `/admin/logs?journeyId=${encodeURIComponent(journeyId || '')}`,
    [journeyId]
  )

  useEffect(() => {
    // Try to pull current state (best-effort)
    if (!journeyId) return
    ;(async () => {
      try {
        const r = await fetch(`/api/journeys/${journeyId}/state`, { cache: 'no-store' })
        if (r.ok) {
          const data = await r.json()
          setJourneyState(data?.state || data)
        }
      } catch (stateError) {
        console.warn('Failed to fetch journey state snapshot', stateError)
      }
    })()
  }, [journeyId])

  async function runStep(payload?: any) {
    if (!journeyId) return
    setLoading(true)
    setError(null)
    try {
      const body = payload || {
        phaseId,
        trackId,
        language,
        userInput: input,
        journeyState: journeyState || {},
      }
      const r = await fetch(`/api/journeys/${journeyId}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || JSON.stringify(data))
      setResp(data)
      if (data?.next_state) setJourneyState(data.next_state)
      if (data?.metadata?.language) setLanguage(data.metadata.language as any)
      setInput('')
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  function handleAction(actionId: string) {
    runStep({ actionId, phaseId, trackId, language, journeyState: journeyState || {} })
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Left column */}
      <aside className="col-span-12 md:col-span-3 rounded-xl border border-white/10 p-4 bg-bg-mid/40">
        <h2 className="font-semibold mb-2">Journey</h2>
        <div className="text-sm opacity-80 grid gap-1">
          <div>
            ID: <span className="opacity-70">{journeyId}</span>
          </div>
          <div>Persona: {persona}</div>
          <div>Mode: {mode}</div>
          <div>Lang: {language}</div>
          <div>Phase: {phaseId}</div>
          <div>Track: {trackId}</div>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <label className="grid gap-1">
            <span className="opacity-70">Persona</span>
            <select
              className="bg-bg-mid/50 border border-white/10 rounded p-2"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            >
              <option value="builder">Builder</option>
              <option value="investor">Investor</option>
              <option value="student">Student</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="opacity-70">Mode</span>
            <select
              className="bg-bg-mid/50 border border-white/10 rounded p-2"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'demo' | 'prod')}
            >
              <option value="demo">Demo</option>
              <option value="prod">Production</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="opacity-70">Language</span>
            <select
              className="bg-bg-mid/50 border border-white/10 rounded p-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="opacity-70">Phase</span>
            <select
              className="bg-bg-mid/50 border border-white/10 rounded p-2"
              value={phaseId}
              onChange={(e) => setPhaseId(e.target.value)}
            >
              <option value="learn">Learn</option>
              <option value="build">Build</option>
              <option value="prove">Prove</option>
              <option value="activate">Activate</option>
              <option value="scale">Scale</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="opacity-70">Track</span>
            <select
              className="bg-bg-mid/50 border border-white/10 rounded p-2"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
            >
              <option value="builder">Builder</option>
              <option value="investor">Investor</option>
              <option value="student">Student</option>
            </select>
          </label>
        </div>

        <a className="mt-4 inline-block text-xs underline" href={rightLogHref}>
          View logs
        </a>
      </aside>

      {/* Center column */}
      <main className="col-span-12 md:col-span-6 rounded-xl border border-white/10 p-4 bg-bg-mid/40 min-h-[60vh]">
        <h2 className="font-semibold mb-3">Step</h2>

        <div className="grid gap-2">
          <textarea
            className="w-full min-h-[100px] bg-black/30 rounded p-2 text-sm"
            placeholder="Describe your goal or ask a question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={() => runStep()}
              className="rounded px-3 py-1.5 bg-white/10 border border-white/10 text-sm"
            >
              {loading ? 'Running…' : 'Run step'}
            </button>
            {resp?.ui_blocks?.length ? (
              <button
                disabled={loading}
                onClick={() => {
                  const asb = (resp.ui_blocks as any[]).find(
                    (b: any) => b.kind === 'action_suggestions_block'
                  )
                  const first = asb?.suggestions?.[0]?.action_id
                  if (first) handleAction(first)
                }}
                className="rounded px-3 py-1.5 bg-white/10 border border-white/10 text-sm"
              >
                Quick action
              </button>
            ) : null}
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

        <div className="mt-4">
          {resp?.ui_blocks?.length ? (
            <UIBlocksRenderer blocks={resp.ui_blocks} onAction={handleAction} />
          ) : (
            <div className="text-sm opacity-70">No blocks yet — run a step.</div>
          )}
        </div>
      </main>

      {/* Right column */}
      <aside className="col-span-12 md:col-span-3 rounded-xl border border-white/10 p-4 bg-bg-mid/40">
        <h2 className="font-semibold mb-2">Agent Activity</h2>
        <div className="text-sm opacity-80">
          {resp?.agent_actions ? (
            <pre className="text-xs whitespace-pre-wrap bg-black/30 p-2 rounded max-h-[300px] overflow-auto">
              {JSON.stringify(resp.agent_actions, null, 2)}
            </pre>
          ) : (
            <div className="text-xs opacity-70">No agent actions yet.</div>
          )}
        </div>

        <h3 className="font-semibold mt-4 mb-2">Resources</h3>
        <div className="text-sm opacity-80">
          {resp?.ui_blocks?.filter((b: any) => b.kind === 'resource_block')?.length ? (
            <UIBlocksRenderer
              blocks={resp.ui_blocks.filter((b: any) => b.kind === 'resource_block')}
            />
          ) : (
            <div className="text-xs opacity-70">No resources yet.</div>
          )}
        </div>
      </aside>
    </div>
  )
}

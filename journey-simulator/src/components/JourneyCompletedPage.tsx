import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import LazyConfetti from './shared/LazyConfetti'
import { Download, PenSquare, RefreshCw, Sparkles, Trophy } from 'lucide-react'
import { exportToPDF } from '../utils/exportToPDF'
import { sendToNotion } from '../utils/sendToNotion'
import { useJourneyStore } from '../store/journeyStore'
import { useAuth } from '../contexts/AuthContext'
import { personas } from '../data/personas'

interface JourneyPhaseSnapshot {
  id: string
  title: string
  mission?: string
  xpReward?: number
  nftReward?: string
  duration?: string
}

interface JourneyCompletionSummary {
  personaId: string
  personaTitle: string
  personaIcon?: string
  passType?: string
  totalXP: number
  mfaiTokens: number
  votingPower: number
  mintedNfts: string[]
  completedPhases: number
  totalPhases: number
  aepoScore: number
  aecoScore: number
  completedAt: string
  phases?: JourneyPhaseSnapshot[]
}

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!globalThis.window) {
      return
    }

    const update = () => {
      setSize({ width: globalThis.window.innerWidth, height: globalThis.window.innerHeight })
    }

    update()
    globalThis.window.addEventListener('resize', update)
    return () => globalThis.window.removeEventListener('resize', update)
  }, [])

  return size
}

function buildCompletionMarkdown(summary: JourneyCompletionSummary, phaseDetails: JourneyPhaseSnapshot[], userIdentifier: string) {
  // Use array literal instead of multiple push calls
  const lines = [
    `# Journey Completion – ${summary.personaTitle}`,
    '',
    `- **User:** ${userIdentifier}`,
    `- **Completed:** ${summary.completedAt}`,
    `- **AEPO Score:** ${summary.aepoScore}`,
    `- **AECO Score:** ${summary.aecoScore}`,
    `- **Total XP:** ${summary.totalXP}`,
    `- **MFAI Tokens:** ${summary.mfaiTokens}`,
    `- **Voting Power:** ${summary.votingPower}`,
    ''
  ];

  if (summary.mintedNfts.length > 0) {
    lines.push('## Proof-of-Skill™ Earned')
    summary.mintedNfts.forEach((nft) => {
      lines.push(`- ${nft}`)
    })
    lines.push('')
  }

  if (phaseDetails.length > 0) {
    lines.push('## Phase Breakdown')
    phaseDetails.forEach((phase, index) => {
      lines.push(`### ${index + 1}. ${phase.title}`)
      if (phase.mission) {
        lines.push(`- Mission: ${phase.mission}`)
      }
      if (phase.nftReward) {
        lines.push(`- Reward: ${phase.nftReward}`)
      }
      if (phase.xpReward !== undefined) {
        lines.push(`- XP: ${phase.xpReward}`)
      }
      if (phase.duration) {
        lines.push(`- Duration: ${phase.duration}`)
      }
      lines.push('')
    })
  }

  return lines.join('\n')
}

const JourneyCompletedPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedPersona, userProgress, setSelectedPersona } = useJourneyStore()
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(true)
  const [exportError, setExportError] = useState<string | null>(null)
  const [notionMessage, setNotionMessage] = useState<string | null>(null)
  const [notionStatus, setNotionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const routeSummary = (location.state as { summary?: JourneyCompletionSummary } | null)?.summary

  const personaFallback = useMemo(() => {
    if (!routeSummary?.personaId) {
      return null
    }
    return personas.find((persona) => persona.id === routeSummary.personaId) ?? null
  }, [routeSummary?.personaId])

  const personaForUi = selectedPersona ?? personaFallback ?? null

  const summary = useMemo<JourneyCompletionSummary | null>(() => {
    if (routeSummary) {
      return {
        ...routeSummary,
        personaIcon: routeSummary.personaIcon ?? personaForUi?.icon,
        passType: routeSummary.passType ?? personaForUi?.passType,
        mintedNfts: Array.isArray(routeSummary.mintedNfts) ? [...routeSummary.mintedNfts] : [],
        phases: routeSummary.phases && routeSummary.phases.length > 0
          ? routeSummary.phases
          : personaForUi?.phases?.map((phase) => ({
            id: phase.id,
            title: phase.title,
            mission: phase.mission,
            xpReward: phase.xpReward,
            nftReward: phase.nftReward,
            duration: phase.duration
          })) ?? []
      }
    }

    if (!personaForUi) {
      return null
    }

    if (userProgress.completedPhases.length < personaForUi.phases.length) {
      return null
    }

    const maxXp = personaForUi.phases.reduce((sum, phase) => sum + (phase.xpReward || 0), 0)
    const totalXp = userProgress.totalXP
    const aepoScore = maxXp > 0 ? Math.min(100, Math.round((totalXp / maxXp) * 100)) : 100
    const aecoScore = Math.min(100, Math.round(aepoScore * 0.92 + 8))

    return {
      personaId: personaForUi.id,
      personaTitle: personaForUi.title,
      personaIcon: personaForUi.icon,
      passType: personaForUi.passType,
      totalXP: totalXp,
      mfaiTokens: userProgress.mfaiTokens,
      votingPower: userProgress.votingPower,
      mintedNfts: [...userProgress.nfts],
      completedPhases: personaForUi.phases.length,
      totalPhases: personaForUi.phases.length,
      aepoScore,
      aecoScore,
      completedAt: new Date().toISOString(),
      phases: personaForUi.phases.map((phase) => ({
        id: phase.id,
        title: phase.title,
        mission: phase.mission,
        xpReward: phase.xpReward,
        nftReward: phase.nftReward,
        duration: phase.duration
      }))
    }
  }, [routeSummary, personaForUi, userProgress.completedPhases.length, userProgress.totalXP, userProgress.mfaiTokens, userProgress.votingPower, userProgress.nfts])

  useEffect(() => {
    if (!globalThis.window) {
      return undefined
    }
    const timeout = globalThis.window.setTimeout(() => setShowConfetti(false), 6000)
    return () => globalThis.window.clearTimeout(timeout)
  }, [])

  if (!summary || !personaForUi) {
    return <Navigate to="/journeys" replace />
  }

  const phaseDetails = summary.phases ?? []
  const userIdentifier = user?.email || user?.name || 'anonymous'
  const markdown = buildCompletionMarkdown(summary, phaseDetails, userIdentifier)

  const handleRestart = () => {
    setSelectedPersona(null)
    navigate('/journeys')
  }

  const handleExportPdf = async () => {
    setExportError(null)
    setNotionMessage(null)
    setIsGeneratingPdf(true)
    try {
      // Note: Using replace() with regex is appropriate here (not replaceAll) as we need pattern matching
      await exportToPDF('journey-summary', `${summary.personaTitle.replaceAll(/\s+/g, '-')}-completion.pdf`)
    } catch (error) {
      console.error('PDF export failed:', error)
      setExportError(error instanceof Error ? error.message : 'PDF export impossible.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleSendToNotion = async () => {
    setExportError(null)
    setNotionMessage(null)
    setNotionStatus('loading')
    try {
      await sendToNotion({
        userId: userIdentifier,
        personaId: summary.personaId,
        personaTitle: summary.personaTitle,
        summary: `Journey completed with AEPO ${summary.aepoScore} and AECO ${summary.aecoScore}.`,
        markdownContent: markdown,
        metadata: {
          totalXP: summary.totalXP,
          mfaiTokens: summary.mfaiTokens,
          votingPower: summary.votingPower,
          mintedNfts: summary.mintedNfts,
          completedAt: summary.completedAt
        }
      })
      setNotionStatus('success')
      setNotionMessage('Summary sent to Notion.')
    } catch (error) {
      console.error('Notion export failed:', error)
      setNotionStatus('error')
      setExportError(error instanceof Error ? error.message : 'Sending to Notion impossible.')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white">
      {showConfetti && width > 0 && height > 0 && (
        <LazyConfetti width={width} height={height} recycle={false} numberOfPieces={450} gravity={0.18} />
      )}

      <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest">
            <Sparkles size={16} /> Journey Complete
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">
            {summary.personaIcon && <span className="mr-3 text-5xl md:text-6xl" aria-hidden>{summary.personaIcon}</span>}
            Digital Sovereignty Achieved
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/70">
            You have fully completed the {summary.personaTitle} journey. Zyno recorded every Proof-of-Skill™ and delivered your activation dossier.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section id="journey-summary" className="relative space-y-6 rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-white/50">Mission Ledger</span>
              <h2 className="text-3xl font-semibold text-white">{summary.personaTitle}</h2>
              {summary.passType && <p className="text-sm text-white/60">{summary.passType}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-white/60">Total XP</p>
                <p className="text-2xl font-semibold text-accent-gold">{summary.totalXP}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-white/60">$MFAI Tokens</p>
                <p className="text-2xl font-semibold text-accent-cyan">{summary.mfaiTokens.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-white/60">Voting Power</p>
                <p className="text-2xl font-semibold text-accent-purple">{summary.votingPower}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-white/60">Proof-of-Skill™ Earned</p>
                <p className="text-2xl font-semibold text-accent-gold">{summary.mintedNfts.length}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-200">AEPO Score</p>
                <p className="text-3xl font-semibold text-emerald-100">{summary.aepoScore}</p>
              </div>
              <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
                <p className="text-sm text-sky-200">AECO Score</p>
                <p className="text-3xl font-semibold text-sky-100">{summary.aecoScore}</p>
              </div>
            </div>

            {summary.mintedNfts.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Trophy size={18} className="text-accent-gold" /> Proof-of-Skill™ Inventory
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.mintedNfts.map((nft) => (
                    <span key={nft} className="rounded-full border border-accent-gold/40 bg-accent-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-gold">
                      {nft}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Journey Timeline</h3>
              <ol className="space-y-3 text-sm">
                {phaseDetails.map((phase, index) => (
                  <li key={phase.id || `${phase.title}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-white/50">Phase {index + 1}</p>
                        <p className="text-base font-semibold text-white">{phase.title}</p>
                      </div>
                      <span className="text-xs text-white/40">{phase.duration}</span>
                    </div>
                    {phase.mission && (
                      <p className="mt-2 text-white/70">{phase.mission}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                      {phase.xpReward !== undefined && <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1">+{phase.xpReward} XP</span>}
                      {phase.nftReward && <span className="rounded-full border border-accent-purple/40 bg-accent-purple/10 px-2 py-1 text-accent-purple/80">{phase.nftReward}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <aside className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">Exports & Continuity</h3>
              <p className="text-sm text-white/70">
                Download the full dossier or sync it with your Notion base to share your mission proofs.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={18} />
                  {isGeneratingPdf ? 'Exporting...' : 'Export to PDF'}
                </button>
                <button
                  type="button"
                  onClick={handleSendToNotion}
                  disabled={notionStatus === 'loading'}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PenSquare size={18} />
                  {notionStatus === 'loading' ? 'Sending to Notion...' : 'Send to Notion'}
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <RefreshCw size={18} />
                  Restart a Journey
                </button>
              </div>

              {(exportError || notionMessage) && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${exportError ? 'border-red-400/40 bg-red-500/10 text-red-100' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'}`}>
                  {exportError ?? notionMessage}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="mb-3 text-lg font-semibold text-white">Next Moves</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li>→ Start a new journey to strengthen your Proof-of-Skill™ stack.</li>
                <li>→ Share your dossier with the Sovereign Builders Network to capture missions.</li>
                <li>→ Activate Zyno to convert this report into a DAO update or investor pitch.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default JourneyCompletedPage

/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, ShieldCheck, Flame, Loader2, Sparkles } from 'lucide-react'
import { useJourneyStore } from '../../store/journeyStore'
import { deriveJourneySignals } from '../../utils/journeySignals'
import { AECO, AEPO } from '../../content/aepoAeco'
import EmptyState from '../shared/EmptyState'
import InfoBadge from '../shared/InfoBadge'
import AgentActivityFeed from '../AgentActivityFeed';
import { AgentDeliverables } from '../AgentDeliverables'

interface Props {
  className?: string
  onClose?: () => void
}

const agentPalette = [
  { label: 'Builder', icon: Flame },
  { label: 'DAO', icon: ShieldCheck },
  { label: 'Growth', icon: Activity }
]

const ZynoSignalSidebar: React.FC<Props> = ({ className = '' }) => {
  const { selectedPersona: persona, userProgress } = useJourneyStore()
  const accumulatedActions = useJourneyStore((state) => state.demoState.accumulatedActions);
  const accumulatedResources = useJourneyStore((state) => state.demoState.accumulatedResources);

  const totalPhases = persona?.phases.length ?? 0
  const { aepo, aeco, alignment } = deriveJourneySignals(userProgress, totalPhases)

  const [agentStats, setAgentStats] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3002'
    fetch(`${API_BASE}/api/agents/stats`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.data?.agents?.length) return
        // Mapper les labels de la palette sur le statut réel
        const map: Record<string, boolean> = {
          Builder: data.data.agents.some((a: any) => /anchor|solana|builder/i.test(a.name) && a.status === 'active'),
          DAO:     data.data.agents.some((a: any) => /dao|token|governance/i.test(a.name) && a.status === 'active'),
          Growth:  data.data.agents.some((a: any) => /eval|marketing|growth/i.test(a.name) && a.status === 'active'),
        }
        setAgentStats(map)
      })
      .catch(() => {/* fail-safe — keeps default states */})
  }, [])

  // Deterministic fallback if API unavailable: all active (better UX than random)
  const activeAgents = useMemo(() =>
    agentPalette.map((agent) => ({
      ...agent,
      active: agentStats[agent.label] ?? true,
    })),
  [agentStats])

  const containerClass = `fixed right-6 top-24 bottom-6 w-80 glass-effect rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur z-40 overflow-y-auto flex flex-col ${className}`.trim()

  if (!persona) {
    return (
      <div className={containerClass}>
        <EmptyState
          dense
          tone="info"
          title="No persona selected"
          description="Choose a journey to unlock live agent signals and recommendations."
          icon={<Sparkles size={18} className="text-accent-cyan" />}
        />
      </div>
    )
  }

  const signalWidgets = [
    { label: 'AEPO', value: aepo, tone: 'success' as const, tooltip: AEPO.tooltip },
    { label: 'AECO', value: aeco, tone: 'info' as const, tooltip: AECO.tooltip },
    { label: 'Alignment', value: alignment, tone: 'default' as const, tooltip: 'Governance + execution alignment across signals.' }
  ]

  const hasSignalData = signalWidgets.some((signal) => Number.isFinite(signal.value))

  return (
    <div data-testid="zyno-sidebar-signals" className={containerClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Zyno Console</p>
          <h3 className="text-lg font-semibold text-white">Mission Control</h3>
        </div>
        <div className="flex gap-2">
          {userProgress.completedPhases.length >= 6 && (
            <div data-testid="veteran-badge">
              <InfoBadge label="VETERAN" tone="success" icon={<ShieldCheck size={12} />} />
            </div>
          )}
          <InfoBadge label="Live" tone="info" icon={<Sparkles size={12} className="text-accent-cyan" />} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {hasSignalData ? (
          signalWidgets.map((signal) => {
            const clampedValue = Math.max(0, Math.min(100, Number.isFinite(signal.value) ? signal.value : 0))
            const displayValue = Math.round(clampedValue)
            const progressLabel = `${signal.label} score`

            return (
              <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span title={signal.tooltip}>
                    <InfoBadge label={signal.label} tone={signal.tone} className="cursor-help" />
                  </span>
                  <InfoBadge label={`${displayValue}/100`} tone="default" />
                </div>
                <progress
                  className="mt-3 h-2 w-full rounded-full bg-white/10"
                  aria-label={progressLabel}
                  max={100}
                  value={displayValue}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedValue}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-white/70"
                  />
                </progress>
              </div>
            )
          })
        ) : (
          <EmptyState
            dense
            tone="info"
            title="Signals initializing"
            description="Zyno agents are calibrating metrics for this journey."
            icon={<Loader2 size={18} className="animate-spin" />}
          />
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Active agents</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activeAgents.map((agent) => {
            const Icon = agent.icon
            return (
              <InfoBadge
                key={agent.label}
                label={agent.label}
                icon={<Icon size={10} />}
                tone={agent.active ? 'info' : 'default'}
                className={agent.active ? '' : 'opacity-40'}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        {/* Real-Time Neural Core Feed */}
        {/* TASK 4: CUMULATIVE DISPLAY */}
        <AgentActivityFeed />

        {/* Injecting Accumulated Deliverables directly here or inside AgentActivityFeed? 
            AgentActivityFeed is connected to demoHistory.
            We need a component for Resources. 
            Reusing AgentDeliverables here.
        */}
        <div className="mt-4">
          <AgentDeliverables
            actions={accumulatedActions}
            resources={accumulatedResources}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            <span className="text-xs uppercase tracking-[0.3em]">Next suggestion</span>
          </div>
          <InfoBadge label="Zyno intel" tone="info" />
        </div>
        <p className="mt-2">
          Publish an artifact recap for the current phase and log an{' '}
          <span title={AEPO.tooltip} className="cursor-help border-b border-dashed border-white/20 text-white/80">
            AEPO
          </span>{' '}
          checkpoint to boost visibility inside the Sovereign Builders Network.
        </p>
      </div>
    </div>
  )
}

export default ZynoSignalSidebar

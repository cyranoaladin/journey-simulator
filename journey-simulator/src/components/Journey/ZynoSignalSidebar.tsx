/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { FormEvent, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, MessageCircle, Sparkles, Send, Activity, ShieldCheck, Flame, Loader2 } from 'lucide-react'
import { useJourneyStore } from '../../store/journeyStore'
import { deriveJourneySignals } from '../../utils/journeySignals'
import { AECO, AEPO } from '../../content/aepoAeco'
import EmptyState from '../shared/EmptyState'
import InfoBadge from '../shared/InfoBadge'

interface ChatMessage {
  id: string
  role: 'user' | 'zyno'
  text: string
  timestamp: string
}

interface Props {
  className?: string
  onClose?: () => void
}

const agentPalette = [
  { label: 'Builder', icon: Flame },
  { label: 'DAO', icon: ShieldCheck },
  { label: 'Growth', icon: Activity }
]

const createMessage = (role: ChatMessage['role'], text: string): ChatMessage => ({
  id: generateId(),
  role,
  text,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const ZynoSignalSidebar: React.FC<Props> = ({ className = '' }) => {
  const { selectedPersona: persona, userProgress } = useJourneyStore()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createMessage('zyno', 'I am tracking your pathway. Ask for a mission reset or a governance brief any time.'),
  ])

  const totalPhases = persona?.phases.length ?? 0
  const { aepo, aeco, alignment } = deriveJourneySignals(userProgress, totalPhases)

  const activeAgents = useMemo(() => agentPalette.map((agent) => ({
    ...agent,
    active: Math.random() > 0.3
  })), [])

  const containerClass = `glass-effect rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur ${className}`.trim()

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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!input.trim()) return

    const payload = input.trim()
    setMessages((prev) => [...prev, createMessage('user', payload)])
    setInput('')

    const personaLabel = persona.title
    const syntheticReply = `Tracking ${personaLabel}. I recommend focusing the next sprint on ${userProgress.completedPhases.length < totalPhases ? 'unlocking the upcoming phase deliverables' : 'documenting launch artifacts'} and logging a DAO update.`

    setTimeout(() => {
      setMessages((prev) => [...prev, createMessage('zyno', syntheticReply)])
    }, 600)
  }

  const signalWidgets = [
    { label: 'AEPO', value: aepo, tone: 'success' as const, tooltip: AEPO.tooltip },
    { label: 'AECO', value: aeco, tone: 'info' as const, tooltip: AECO.tooltip },
    { label: 'Alignment', value: alignment, tone: 'default' as const, tooltip: 'Governance + execution alignment across signals.' }
  ]

  const hasSignalData = signalWidgets.some((signal) => Number.isFinite(signal.value))

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Zyno Console</p>
          <h3 className="text-lg font-semibold text-white">Mission Control</h3>
        </div>
        <InfoBadge label="Live" tone="info" icon={<Sparkles size={12} className="text-accent-cyan" />} />
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

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 text-accent-cyan">
            <Bot size={18} />
            <span className="text-sm font-semibold">Conversation feed</span>
          </div>
          <InfoBadge label="Live feed" tone="info" />
        </div>
        <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className={`rounded-2xl border border-white/10 p-3 text-sm ${message.role === 'zyno' ? 'bg-white/10 text-white/80' : 'bg-accent-cyan/10 text-accent-cyan'}`}>
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.3em]">
                <span>{message.role === 'zyno' ? 'Zyno' : 'You'}</span>
                <span className="text-white/40">{message.timestamp}</span>
              </div>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Brief Zyno about your next task"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-accent-cyan focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-full bg-gradient-accent px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            <Send size={14} />
            Send
          </button>
        </form>
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

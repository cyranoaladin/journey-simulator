import { FormEvent, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, MessageCircle, Sparkles, Send, Activity, ShieldCheck, Flame } from 'lucide-react'
import { useJourneyStore } from '../../store/journeyStore'
import { deriveJourneySignals } from '../../utils/journeySignals'

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
  { label: 'Builder', color: 'bg-emerald-500/15 text-emerald-300', icon: Flame },
  { label: 'DAO', color: 'bg-indigo-500/15 text-indigo-300', icon: ShieldCheck },
  { label: 'Growth', color: 'bg-amber-500/15 text-amber-300', icon: Activity }
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

  if (!persona) return null

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
    { label: 'AEPO', value: aepo, accent: 'from-emerald-400/40 via-transparent to-emerald-500/20' },
    { label: 'AECO', value: aeco, accent: 'from-sky-400/40 via-transparent to-sky-500/20' },
    { label: 'Alignment', value: alignment, accent: 'from-fuchsia-400/40 via-transparent to-fuchsia-500/20' }
  ]

  return (
    <div className={`glass-effect rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Zyno Console</p>
          <h3 className="text-lg font-semibold text-white">Mission Control</h3>
        </div>
        <div className="rounded-full bg-accent-cyan/20 px-3 py-1 text-xs font-semibold text-accent-cyan">Live</div>
      </div>

      <div className="mt-4 space-y-3">
        {signalWidgets.map((signal) => (
          <div key={signal.label} className={`rounded-2xl border border-white/10 bg-gradient-to-r ${signal.accent} p-3`}>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
              <span>{signal.label}</span>
              <span className="text-white">{signal.value}/100</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${signal.value}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-white/70"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Active agents</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activeAgents.map((agent) => {
            const Icon = agent.icon
            return (
              <span key={agent.label} className={`inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold ${agent.color} ${agent.active ? '' : 'opacity-40'}`}>
                <Icon size={12} />
                {agent.label}
              </span>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-accent-cyan">
          <Bot size={18} />
          <span className="text-sm font-semibold">Conversation feed</span>
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
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={16} />
          <span className="text-xs uppercase tracking-[0.3em]">Next suggestion</span>
        </div>
        <p className="mt-2">
          Publish an artifact recap for the current phase and log an AEPO checkpoint to boost visibility inside the Sovereign Builders Network.
        </p>
      </div>
    </div>
  )
}

export default ZynoSignalSidebar

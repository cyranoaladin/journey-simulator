import { ArrowUpRight, MessageCircle, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useJourneyStore } from '../../store/journeyStore'

const ZynoChatSidebar = () => {
  const navigate = useNavigate()
  const { userProgress } = useJourneyStore()

  return (
    <aside
      className="zyno-sticky-sidebar zyno-sidebar hidden shrink-0 flex-col self-start overflow-y-auto border-l border-white/10 bg-surface-900/60 px-6 py-8 text-white backdrop-blur-2xl xl:flex"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary/80">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Zyno Assist</p>
          <h3 className="font-space text-lg font-semibold">AI Co-Founder™ on standby</h3>
        </div>
      </div>

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Total XP</span>
          <span className="font-mono text-base text-white">{userProgress.totalXP}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Proof-of-Skill™ NFTs</span>
          <span className="font-mono text-base text-white">{userProgress.nfts.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>DAO Influence</span>
          <span className="font-mono text-base text-white">{userProgress.votingPower}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary-500/30 bg-primary-500/10 p-5 text-sm text-white/80">
        <p>
          Zyno can translate your current phase into actionable missions, investor narratives, and DAO-ready updates in seconds.
        </p>
      </div>

      <button
        onClick={() => navigate('/zyno')}
        className="zyno-sidebar-cta mt-8 inline-flex items-center justify-between rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        type="button"
      >
        <span className="flex items-center gap-2">
          <MessageCircle size={18} />
          Open Zyno Console
        </span>
        <ArrowUpRight size={18} />
      </button>
    </aside>
  )
}

export default ZynoChatSidebar

import { ArrowUpRight, MessageCircle, Sparkles, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useJourneyStore } from '../../store/journeyStore'
import { useState } from 'react'

const ZynoChatSidebar = () => {
  const navigate = useNavigate()
  const userProgress = useJourneyStore((state) => state.userProgress)
  const [expanded, setExpanded] = useState(true)

  return (
    <aside
      className={`zyno-sticky-sidebar zyno-sidebar hidden shrink-0 flex-col self-start overflow-hidden border-l border-white/10 bg-surface-900/60 text-white backdrop-blur-2xl xl:flex transition-all duration-300 ${expanded ? 'w-80 px-6 py-8' : 'w-16 py-8 px-2 items-center'
        }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-6 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white self-start"
        title={expanded ? "Réduire le panneau" : "Agrandir le panneau"}
      >
        {expanded ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
      </button>

      <div className={`flex items-center gap-3 ${!expanded && 'flex-col'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary/80">
          <Sparkles size={18} />
        </div>
        {expanded && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Zyno Assist</p>
            <h3 className="font-space text-lg font-semibold">AI Co-Founder™ on standby</h3>
          </div>
        )}
      </div>

      {expanded && (
        <>
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 w-full">
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

          <div className="mt-6 rounded-2xl border border-primary-500/30 bg-primary-500/10 p-5 text-sm text-white/80 w-full">
            <p>
              Zyno can translate your current phase into actionable missions, investor narratives, and DAO-ready updates in seconds.
            </p>
          </div>

          <button
            onClick={() => navigate('/zyno')}
            className="zyno-sidebar-cta mt-8 inline-flex items-center justify-between rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 w-full"
            type="button"
          >
            <span className="flex items-center gap-2">
              <MessageCircle size={18} />
              Open Zyno Console
            </span>
            <ArrowUpRight size={18} />
          </button>
        </>
      )}

      {!expanded && (
        <button
          onClick={() => navigate('/zyno')}
          className="mt-6 p-3 rounded-full bg-gradient-primary hover:opacity-90 transition-opacity"
          title="Open Zyno Console"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </aside>
  )
}

export default ZynoChatSidebar

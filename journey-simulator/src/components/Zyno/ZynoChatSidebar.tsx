/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { ArrowUpRight, MessageCircle, Sparkles, PanelRightClose, PanelRightOpen, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useJourneyStore } from '../../store/journeyStore'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

type ZynoSidebarProps = {
  variant?: 'docked' | 'overlay'
  onClose?: () => void
}

const ZynoChatSidebar = ({ variant = 'docked', onClose }: ZynoSidebarProps) => {
  const navigate = useNavigate()
  const userProgress = useJourneyStore((state) => state.userProgress)
  const isOverlay = variant === 'overlay'
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (isOverlay) {
      setExpanded(true)
    }
  }, [isOverlay])

  const containerClasses = clsx(
    'zyno-sidebar flex shrink-0 flex-col self-start overflow-hidden border-l border-white/10 bg-surface-900/60 text-white backdrop-blur-2xl transition-all duration-300',
    {
      'hidden xl:flex': !isOverlay,
      'w-80 px-6 py-8': !isOverlay && expanded,
      'w-16 items-center px-2 py-8': !isOverlay && !expanded,
      'relative flex h-full w-full max-h-[calc(100vh-3rem)] overflow-y-auto px-6 py-8 shadow-2xl': isOverlay,
    }
  )

  return (
    <aside className={containerClasses}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={clsx('mb-6 self-start rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white', {
          'pointer-events-none opacity-40': isOverlay,
        })}
        title={expanded ? 'Minimize panel' : 'Expand panel'}
        disabled={isOverlay}
      >
        {expanded ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
      </button>

      {isOverlay && onClose && (
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-white/20 p-2 text-white/70 transition hover:text-white"
          aria-label="Close insights panel"
          type="button"
        >
          <X size={16} />
        </button>
      )}

      <div className={`flex items-center gap-3 ${!expanded && 'flex-col'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary/80">
          <Sparkles size={18} />
        </div>
        {expanded && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Zyno Assist</p>
            <h3 className="font-space text-lg font-semibold">AI Co-Founder on standby</h3>
          </div>
        )}
      </div>

      {expanded && (
        <>
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 w-full">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Total XP</span>
              <span className="font-mono text-base text-white">{userProgress?.totalXP ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Proof-of-Skill NFTs</span>
              <span className="font-mono text-base text-white">{userProgress?.nfts?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>DAO Influence</span>
              <span className="font-mono text-base text-white">{userProgress?.votingPower ?? 0}</span>
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

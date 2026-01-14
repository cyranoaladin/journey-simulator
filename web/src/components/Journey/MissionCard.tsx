import React from 'react'
import { Play, Lock, Zap, Award } from 'lucide-react'

interface MissionCardProps {
  title?: string
  description?: string
  xp?: number
  mfai?: number
  status?: 'active' | 'locked' | 'completed'
  onStart?: () => void
}

const MissionCard: React.FC<MissionCardProps> = ({
  title = 'Cognition Ignition',
  description = 'Complete the Web3 paradigm deep-dive, map legacy vs. decentralized architecture.',
  xp = 60,
  mfai = 6.0,
  status = 'active', // 'active', 'locked', 'completed'
  onStart,
}) => {
  const isLocked = status === 'locked'

  return (
    <div
      className={`
      group relative w-full overflow-hidden rounded-2xl border transition-all duration-300
      ${
        isLocked
          ? 'border-white/5 bg-gray-900/20 opacity-70'
          : 'border-white/10 bg-gray-900/40 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]'
      }
      backdrop-blur-md
    `}
    >
      {/* Glow Effect en background (subtil) */}
      {!isLocked && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-600/20 blur-3xl transition-all duration-500 group-hover:bg-purple-600/30" />
      )}

      <div className="relative p-6 flex flex-col h-full">
        {/* Header : Badges & Status */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider 
            ${isLocked ? 'bg-gray-800 text-gray-500' : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'}`}
          >
            {status === 'active' ? 'Available' : status}
          </div>
          {/* Loot Box Display */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
              <Zap size={12} className="fill-yellow-400" />
              <span>{xp} XP</span>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
              <Award size={12} />
              <span>{mfai} $MFAI</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h3
          className={`mb-2 text-xl font-bold ${isLocked ? 'text-gray-500' : 'text-white group-hover:text-purple-200 transition-colors'}`}
        >
          {title}
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-400">{description}</p>

        {/* Footer Action (Push to bottom) */}
        <div className="mt-auto">
          <button
            disabled={isLocked}
            onClick={onStart}
            className={`
              flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all
              ${
                isLocked
                  ? 'cursor-not-allowed bg-gray-800 text-gray-500'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/20 hover:scale-[1.02] hover:shadow-violet-600/40 active:scale-[0.98]'
              }
            `}
          >
            {isLocked ? (
              <>
                <Lock size={16} /> Locked Phase
              </>
            ) : (
              <>
                <Play size={16} className="fill-white" /> Launch Mission
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MissionCard

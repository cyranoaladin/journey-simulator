/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState, type FC } from 'react'
import { motion } from 'framer-motion'
import { X, Vote, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { JourneyPhase } from '../types/journey'
import { useJourneyStore } from '../store/journeyStore'

interface DAOVoteModalProps {
  onClose: () => void
  phase: JourneyPhase
  votingPower: number
  onVote?: (vote: 'approve' | 'reject') => void
}

const DAOVoteModal: FC<DAOVoteModalProps> = ({
  onClose,
  phase,
  votingPower,
  onVote
}) => {
  const [selectedVote, setSelectedVote] = useState<'approve' | 'reject' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null)
  const { updateVotingPower } = useJourneyStore()

  // Mock proposal data based on phase type
  const getProposalData = () => {
    if (phase.isIncubation) {
      return {
        title: "Project Incubation Proposal",
        description: "Validation of your project for incubation in the MFAI ecosystem",
        type: "Incubation",
        requiredVotes: 100,
        currentVotes: { approve: 67, reject: 23 },
        timeLeft: "2 days 14h",
        quorum: 80
      }
    } else if (phase.isLaunchpad) {
      return {
        title: "MFAI Launchpad Access",
        description: "Authorization to launch your project on the official Launchpad",
        type: "Launchpad",
        requiredVotes: 200,
        currentVotes: { approve: 145, reject: 34 },
        timeLeft: "1 day 8h",
        quorum: 150
      }
    } else {
      return {
        title: "Phase Validation",
        description: "Community validation of your progression in this phase",
        type: "Phase",
        requiredVotes: 50,
        currentVotes: { approve: 32, reject: 8 },
        timeLeft: "3 days 2h",
        quorum: 40
      }
    }
  }

  const proposal = getProposalData()
  const totalVotes = proposal.currentVotes.approve + proposal.currentVotes.reject
  const approvePercentage = totalVotes > 0 ? (proposal.currentVotes.approve / totalVotes) * 100 : 0
  const rejectPercentage = totalVotes > 0 ? (proposal.currentVotes.reject / totalVotes) * 100 : 0
  const approveProgressRatio = Math.max(0, Math.min(1, approvePercentage / 100))
  const rejectProgressRatio = Math.max(0, Math.min(1, rejectPercentage / 100))

  const handleVote = async (vote: 'approve' | 'reject') => {
    setSelectedVote(vote)
    setIsVoting(true)

    // Simulate voting transaction
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate stable txHash based on vote data
    const stableTxHash = `sim_${Date.now().toString(16)}_${vote.slice(0, 2)}`;
    setConfirmedTxHash(stableTxHash);

    // Update voting power and DAO participation
    updateVotingPower(votingPower + 10)
    setHasVoted(true)
    setIsVoting(false)

    if (onVote) {
      onVote(vote)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-2xl p-6 max-w-lg w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Vote className="text-accent-purple" size={24} />
            <h2 className="text-xl font-space font-bold tracking-tight">DAO Vote</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            type="button"
            aria-label="Close DAO vote modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Proposal Info */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold font-space tracking-tight" data-testid="dao-proposal-title">{proposal.title}</h3>
            <span className={(() => {
              let badgeClass = 'bg-blue-500/20 text-blue-400';
              if (proposal.type === 'Incubation') {
                badgeClass = 'bg-purple-500/20 text-purple-400';
              } else if (proposal.type === 'Launchpad') {
                badgeClass = 'bg-yellow-500/20 text-yellow-400';
              }
              return `px-2 py-1 rounded-full text-xs font-mono font-bold ${badgeClass}`;
            })()}>
              {proposal.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm opacity-90 mb-4 leading-relaxed">{proposal.description}</p>

          <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs">
            <div className="p-2 bg-black/20 rounded-lg">
              <div className="opacity-70 mb-1">Time Left</div>
              <div className="font-bold flex items-center justify-center text-green-400">
                <Clock size={12} className="mr-1" />
                {proposal.timeLeft}
              </div>
            </div>
            <div className="p-2 bg-black/20 rounded-lg">
              <div className="opacity-70 mb-1">Quorum</div>
              <div className="font-bold">{proposal.quorum}</div>
            </div>
            <div className="p-2 bg-black/20 rounded-lg">
              <div className="opacity-70 mb-1">Power</div>
              <div className="font-bold text-accent-purple text-glow">{votingPower}</div>
            </div>
          </div>
        </div>

        {/* Current Results - NEON GLOW IMPLEMENTATION */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center font-space">
            <TrendingUp size={16} className="mr-2 text-accent-cyan" />
            Live Results
          </h3>

          <div className="space-y-4">
            {/* Approve Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center text-green-400 font-bold">
                  <CheckCircle size={12} className="mr-1" />
                  APPROVE
                </span>
                <span className="text-green-400">{proposal.currentVotes.approve} ({approvePercentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-green-500 rounded-full origin-left animate-shimmer shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: approveProgressRatio }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Reject Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center text-red-500 font-bold">
                  <XCircle size={12} className="mr-1" />
                  REJECT
                </span>
                <span className="text-red-500">{proposal.currentVotes.reject} ({rejectPercentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-red-600 rounded-full origin-left animate-shimmer shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: rejectProgressRatio }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quorum Status */}
        <div className="flex items-center justify-between mb-6 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono opacity-70">QUORUM STATUS:</span>
            <span className={`text-xs font-mono font-bold ${totalVotes >= proposal.quorum ? 'text-green-400' : 'text-yellow-400'}`}>
              {totalVotes >= proposal.quorum ? 'REACHED' : 'PENDING'} ({totalVotes}/{proposal.quorum})
            </span>
          </div>
          {totalVotes >= proposal.quorum && <CheckCircle size={14} className="text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />}
        </div>

        {/* Voting Buttons */}
        {hasVoted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <CheckCircle className="mx-auto mb-2 text-green-400 animate-pulse" size={32} />
            <h3 className="font-bold mb-1 font-space text-green-400">Vote Recorded On-Chain</h3>
            <p className="text-xs font-mono opacity-80">
              TxHash: {confirmedTxHash ? confirmedTxHash.slice(0, 14) + '...' : 'Pending...'}
            </p>
            <p className="text-xs font-mono text-accent-purple mt-2">
              Processing Power Gained: +10
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote('approve')}
              disabled={isVoting}
              className="py-3 px-4 rounded-xl font-bold font-mono transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isVoting && selectedVote === 'approve' ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
              )}
              <span>APPROVE</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote('reject')}
              disabled={isVoting}
              className="py-3 px-4 rounded-xl font-bold font-mono transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isVoting && selectedVote === 'reject' ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <XCircle size={18} className="group-hover:scale-110 transition-transform" />
              )}
              <span>REJECT</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default DAOVoteModal

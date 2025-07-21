import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Coins, TrendingUp, Lock, Unlock } from 'lucide-react'
import { useJourneyStore } from '../store/journeyStore'
import { stakeMFAI } from '../utils/blockchain'

interface StakingModalProps {
  onClose: () => void
  availableAmount: number
  currentStaked: number
  onStake?: (amount: number) => void
}

const StakingModal: React.FC<StakingModalProps> = ({
  onClose,
  availableAmount,
  currentStaked,
  onStake
}) => {
  const [stakeAmount, setStakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)
  const [txSig, setTxSig] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { updateStaking } = useJourneyStore()

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount)
    if (amount <= 0 || amount > availableAmount) return

    setIsStaking(true)
    setError(null)
    try {
      const result = await stakeMFAI(amount)
      if (result.success) {
        setTxSig(result.signature || null)
        if (onStake) {
          onStake(amount)
        } else {
          updateStaking(amount)
        }
      } else {
        setError(result.error || 'Transaction failed')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsStaking(false)
    }
  }

  const calculateRewards = (amount: number) => {
    const apy = 0.125 // 12.5% APY
    const dailyReward = (amount * apy) / 365
    const monthlyReward = dailyReward * 30
    const yearlyReward = amount * apy
    
    return { dailyReward, monthlyReward, yearlyReward }
  }

  const rewards = calculateRewards(parseFloat(stakeAmount) || 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-primary-900 rounded-2xl p-6 max-w-md w-full border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Lock className="text-accent-gold" size={24} />
            <h2 className="text-xl font-space font-bold">Cognitive Lock™</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Staking Info */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Current Staking</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-70">Staked</div>
              <div className="text-lg font-bold text-accent-gold">{currentStaked.toFixed(2)} $MFAI</div>
            </div>
            <div>
              <div className="text-sm opacity-70">APY</div>
              <div className="text-lg font-bold text-green-400">12.5%</div>
            </div>
          </div>
        </div>

        {/* Stake Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Amount to stake</label>
          <div className="relative">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-16 focus:outline-none focus:border-primary-400"
              max={availableAmount}
              step="0.1"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm opacity-70">
              $MFAI
            </div>
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="opacity-70">Available: {availableAmount.toFixed(2)} $MFAI</span>
            <button
              onClick={() => setStakeAmount(availableAmount.toString())}
              className="text-primary-400 hover:text-primary-300"
            >
              Max
            </button>
          </div>
        </div>

        {/* Rewards Preview */}
        {parseFloat(stakeAmount) > 0 && (
          <div className="bg-gradient-primary/20 border border-primary-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <TrendingUp size={16} className="mr-2" />
              Estimated Rewards
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs opacity-70">Daily</div>
                <div className="font-bold text-green-400">{rewards.dailyReward.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Monthly</div>
                <div className="font-bold text-green-400">{rewards.monthlyReward.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Annual</div>
                <div className="font-bold text-green-400">{rewards.yearlyReward.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Staking Benefits</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-primary-500 rounded-full" />
              <span>Automatic Neuro-Dividends™</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-primary-500 rounded-full" />
              <span>Increased DAO voting power</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-primary-500 rounded-full" />
              <span>Access to advanced phases</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-primary-500 rounded-full" />
              <span>XP bonus on missions</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStake}
          disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > availableAmount}
          className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStaking ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Staking in progress...</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>Stake {stakeAmount || '0'} $MFAI</span>
            </>
          )}
        </motion.button>
        {txSig && (
          <div className="mt-4 text-xs break-all">
            Transaction: <a href={`https://etherscan.io/tx/${txSig}`} target="_blank" rel="noopener noreferrer" className="text-primary-400 underline">{txSig}</a>
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-400 text-sm">{error}</div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default StakingModal


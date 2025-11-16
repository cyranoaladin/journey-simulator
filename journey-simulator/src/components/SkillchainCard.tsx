import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Copy, CheckCircle, Trophy, Coins, Award, Lock, Unlock, AlertCircle } from 'lucide-react'
import { useJourneyStore } from '../store/journeyStore'
import { useWallet } from '@solana/wallet-adapter-react'

interface SkillchainCardProps {
  className?: string
}

const SkillchainCard: React.FC<SkillchainCardProps> = ({
  className = '',
}) => {
  const { userProgress, selectedPersona } = useJourneyStore()
  const { publicKey, connected, connecting } = useWallet()
  const [isFlipped, setIsFlipped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Listen for wallet errors
  useEffect(() => {
    const handleWalletError = (event: any) => {
      const error = event.detail;
      setConnectionError(error?.message || 'Connection failed');
    };

    window.addEventListener('walletError', handleWalletError);
    return () => window.removeEventListener('walletError', handleWalletError);
  }, []);

  // Get persona-specific card styling
  const getPersonaGradient = () => {
    if (!selectedPersona) return 'bg-gradient-diamond'

    switch (selectedPersona.id) {
      case 'cognitive-activation-hub':
        return 'bg-gradient-to-br from-sky-500 to-cyan-400'
      case 'capital-foundry':
        return 'bg-gradient-to-br from-emerald-500 to-teal-500'
      case 'system-architect':
        return 'bg-gradient-to-br from-purple-500 to-indigo-500'
      case 'experience-studio':
        return 'bg-gradient-to-br from-rose-500 to-fuchsia-500'
      case 'impact-engine':
        return 'bg-gradient-to-br from-amber-500 to-lime-500'
      case 'resilience-master':
        return 'bg-gradient-to-br from-slate-500 to-cyan-600'
      default:
        return 'bg-gradient-diamond'
    }
  }

  // Get persona icon
  const getPersonaIcon = () => {
    if (!selectedPersona) return '💎'
    
    switch (selectedPersona.id) {
      case 'cognitive-activation-hub':
        return '🧠'
      case 'capital-foundry':
        return '🏛️'
      case 'system-architect':
        return '🛠️'
      case 'experience-studio':
        return '🎮'
      case 'impact-engine':
        return '🌍'
      case 'resilience-master':
        return '🛡️'
      default:
        return selectedPersona.icon
    }
  }

  // Get card tier based on XP
  const getCardTier = () => {
    const xp = userProgress.totalXP
    
    if (xp >= 2000) return { name: 'Diamond', color: 'text-blue-300', gradient: 'bg-gradient-diamond' }
    if (xp >= 1000) return { name: 'Platinum', color: 'text-gray-300', gradient: 'bg-gradient-platinum' }
    if (xp >= 500) return { name: 'Gold', color: 'text-yellow-400', gradient: 'bg-gradient-gold' }
    return { name: 'Bronze', color: 'text-amber-600', gradient: 'bg-gradient-primary' }
  }

  const tier = getCardTier()

  // Calculate progress percentage
  const progressPercentage = selectedPersona 
    ? Math.min((userProgress.completedPhases.length / selectedPersona.phases.length) * 100, 100)
    : 0

  // Calculate progress to next tier
  const getNextTierProgress = () => {
    const xp = userProgress.totalXP;
    
    if (xp >= 2000) return 100; // Already at Diamond
    if (xp >= 1000) return ((xp - 1000) / 1000) * 100; // Progress to Diamond
    if (xp >= 500) return ((xp - 500) / 500) * 100; // Progress to Platinum
    return (xp / 500) * 100; // Progress to Gold
  }

  const nextTierProgress = getNextTierProgress();
  const nextTierProgressRatio = Math.max(0, Math.min(1, nextTierProgress / 100));
  const personaProgressRatio = Math.max(0, Math.min(1, progressPercentage / 100));
  const nextTierName = (xp: number) => {
    if (xp >= 2000) return 'Diamond (Max)';
    if (xp >= 1000) return 'Diamond';
    if (xp >= 500) return 'Platinum';
    return 'Gold';
  };

  const personaMissions = selectedPersona
    ? selectedPersona.phases.map((phase, index) => {
        const isCompleted = userProgress.completedPhases.includes(index)
        const isCurrent = !isCompleted && index === userProgress.completedPhases.length
      const status: 'completed' | 'active' | 'locked' = isCompleted ? 'completed' : isCurrent ? 'active' : 'locked'

        return {
          index,
          title: phase.title,
          mission: phase.mission,
          xpReward: phase.xpReward,
          nftReward: phase.nftReward,
          status,
        }
      })
    : []

  const getMissionStatusStyles = (status: 'completed' | 'active' | 'locked') => {
    switch (status) {
      case 'completed':
        return 'text-green-300 bg-green-500/20 border-green-500/30'
      case 'active':
        return 'text-yellow-200 bg-yellow-400/20 border-yellow-400/30'
      default:
        return 'text-white/50 bg-white/10 border-white/10'
    }
  }

  const renderMissionStatusIcon = (status: 'completed' | 'active' | 'locked') => {
    if (status === 'completed') {
      return <CheckCircle size={12} className="mr-1" />
    }

    if (status === 'active') {
      return <Unlock size={12} className="mr-1" />
    }

    return <Lock size={12} className="mr-1" />
  }

  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Copy wallet address
  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Open Solana explorer
  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank')
    }
  }

  // Generate QR code URL (using a simple external service)
  const getQrCodeUrl = () => {
    if (!publicKey) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${publicKey.toString()}`
  }

  // Get wallet connection status display
  const getWalletStatusDisplay = () => {
    if (connectionError) {
      return (
        <div className="flex items-center">
          <AlertCircle size={12} className="mr-1 text-red-400" />
          <span className="opacity-80 text-red-400">Error: {connectionError}</span>
        </div>
      );
    }
    
    if (connecting) {
      return (
        <div className="flex items-center">
          <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" />
          <span className="opacity-80">Connecting...</span>
        </div>
      );
    }
    
    if (connected && publicKey) {
      return (
        <>
          <Unlock size={12} className="mr-1 text-green-400" />
          <span className="font-mono">
            {formatAddress(publicKey.toString())}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              copyAddress()
            }}
            className="ml-1 p-1 hover:bg-white/10 rounded transition-colors"
            type="button"
            aria-label={copied ? 'Address copied' : 'Copy wallet address'}
          >
            {copied ? <CheckCircle size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
          </button>
        </>
      );
    }
    
    return (
      <>
        <Lock size={12} className="mr-1 text-yellow-400" />
        <span className="opacity-80">Not connected</span>
      </>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative w-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div 
          className={`relative w-full ${getPersonaGradient()} rounded-2xl p-6 shadow-2xl border border-white/20 overflow-hidden backface-hidden`}
          style={{ minHeight: '360px', transform: 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
        >
          {/* Holographic effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-space font-bold text-white text-lg">Skillchain Card™</h3>
                <div className={`${tier.color} text-sm font-semibold`}>{tier.name} Tier</div>
              </div>
              <div className={`w-12 h-12 ${tier.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{getPersonaIcon()}</span>
              </div>
            </div>
            
            {/* Wallet & Persona */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm text-white/90">
                <span className="opacity-70">Wallet:</span>
                <div className="flex items-center">
                  {getWalletStatusDisplay()}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-white/90 mt-1">
                <span className="opacity-70">Persona:</span>
                <span className="font-medium">{selectedPersona?.title || 'None selected'}</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="space-y-2 text-white/90 text-sm mb-4">
              <div className="flex justify-between">
                <span className="flex items-center">
                  <Trophy size={14} className="mr-1" />
                  Total XP:
                </span>
                <span className="font-mono">{userProgress.totalXP}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <Coins size={14} className="mr-1" />
                  $MFAI:
                </span>
                <span className="font-mono">{userProgress.mfaiTokens.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <Award size={14} className="mr-1" />
                  NFTs:
                </span>
                <span className="font-mono">{userProgress.nfts.length}</span>
              </div>
            </div>
            
            {/* Next Tier Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>Next Tier: {nextTierName(userProgress.totalXP)}</span>
                <span>{nextTierProgress.toFixed(0)}%</span>
              </div>
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: nextTierProgressRatio }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            
            {/* Skillchain Mining Progress */}
            {selectedPersona && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Skillchain Mining™ Progress</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: personaProgressRatio }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
            
            {/* Card ID */}
            <div className="mt-4 text-xs text-white/60 font-mono flex justify-between">
              <span>ID: MFAI-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            
            {/* Flip hint */}
            <div className="absolute bottom-2 right-2 text-xs text-white/40">
              Tap to flip
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className={`absolute inset-0 w-full ${getPersonaGradient()} rounded-2xl p-6 shadow-2xl border border-white/20 overflow-hidden backface-hidden`}
          style={{ minHeight: '360px', transform: 'rotateY(180deg)', transformStyle: 'preserve-3d' }}
        >
          {/* Holographic effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
          
          <div className="relative z-10 flex h-full flex-col">
            <h3 className="font-space font-bold text-white text-lg mb-3">Mission Briefing</h3>

            <div className="flex-1 overflow-hidden">
              {personaMissions.length > 0 ? (
                <div className="space-y-2 h-full overflow-y-auto pr-1">
                  {personaMissions.map((mission) => (
                    <div
                      key={mission.index}
                      className="rounded-xl border border-white/10 bg-black/25 p-3"
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
                        <span>Phase {mission.index + 1}</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getMissionStatusStyles(mission.status)}`}
                        >
                          {renderMissionStatusIcon(mission.status)}
                          {mission.status === 'completed'
                            ? 'Completed'
                            : mission.status === 'active'
                              ? 'In Progress'
                              : 'Locked'}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {mission.title}
                      </div>
                      <p className="mt-1 text-xs text-white/70 line-clamp-2">
                        {mission.mission}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
                        <span>{mission.xpReward} XP</span>
                        {mission.nftReward && (
                          <span className="inline-flex items-center gap-1">
                            <Award size={12} className="text-yellow-300" />
                            {mission.nftReward}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 text-center text-sm text-white/60">
                  Select a persona to reveal mission steps
                </div>
              )}
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-white/80 mb-2">Proof Certifications</h4>
              <div className="space-y-2">
                {userProgress.nfts.length > 0 ? (
                  userProgress.nfts.map((nft, index) => (
                    <div key={index} className="flex items-center rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white">
                      <Award className="mr-2 text-yellow-300" size={16} />
                      <span className="truncate">{nft}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-white/15 bg-white/5 py-2 text-center text-sm text-white/60">
                    No certifications minted yet
                  </div>
                )}
              </div>
            </div>

            {publicKey && (
              <div className="mt-4 rounded-xl border border-white/15 bg-black/20 p-3">
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">Wallet QR</div>
                <div className="flex justify-center">
                  <div className="rounded-lg bg-white p-2">
                    <img
                      src={getQrCodeUrl()}
                      alt="Wallet QR Code"
                      className="h-24 w-24"
                    />
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openExplorer()
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-black/40 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-black/60"
                >
                  <ExternalLink size={12} />
                  <span>View on Solana Explorer</span>
                </button>
              </div>
            )}

            <div className="mt-3 text-center text-xs italic text-white/60">
              "Every proof you mint is a piece of your sovereign capital. This card grows with your skills."
              <div className="mt-1 text-white/40">Certified by Zyno AI Co-Founder™</div>
            </div>

            <div className="absolute bottom-2 right-2 text-xs text-white/40">
              Tap to flip
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SkillchainCard

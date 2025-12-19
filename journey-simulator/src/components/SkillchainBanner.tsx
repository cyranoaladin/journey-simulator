import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Ticket as Pickaxe, Coins } from 'lucide-react'
import { useJourneyStore } from '../store/journeyStore'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLocation } from 'react-router-dom'
import WalletFaucetButton from './WalletFaucetButton'

const SKILLCHAIN_TOP_GAP = 16
const SKILLCHAIN_BOTTOM_GAP = 12

const shouldShowWalletUi = (path: string) =>
  path.startsWith('/journeys') || path.startsWith('/dao') || path.startsWith('/debug/mint')

const SkillchainBannerInner = () => {
  const { userProgress, completeMission } = useJourneyStore()
  const { connected } = useWallet()
  const bannerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const element = bannerRef.current
    const root = document.documentElement

    if (!element) {
      root.style.setProperty('--skillchain-banner-offset', '0px')
      return
    }

    const updateOffset = () => {
      const { height } = element.getBoundingClientRect()
      const offset = height > 0
        ? Math.ceil(height + SKILLCHAIN_TOP_GAP + SKILLCHAIN_BOTTOM_GAP)
        : 0
      root.style.setProperty('--skillchain-banner-offset', `${offset}px`)
    }

    updateOffset()

    const handleResize = () => updateOffset()
    window.addEventListener('resize', handleResize)

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateOffset())
      observer.observe(element)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer?.disconnect()
      root.style.setProperty('--skillchain-banner-offset', '0px')
    }
  }, [])
  
  // Calculate progress based on completed phases
  const progress = Math.min((userProgress.totalXP / 500) * 100, 100)

  return (
    <motion.div
      id="skillchain-banner"
      ref={bannerRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed left-0 right-0 z-40 glass-effect border-b border-white/10 top-[calc(var(--header-height)+16px)]"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 group relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Pickaxe size={16} className="text-accent-cyan" />
              </motion.div>
              <span className="font-space font-semibold">
                Skillchain Mining™
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-primary-900 border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="text-xs">
                  <p className="font-semibold mb-1">Skillchain Mining™</p>
                  <p className="opacity-80">XP gained through the Cognitive Activation Protocol™ that transforms your skills into digital capital.</p>
                </div>
                <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-primary-900 border-r border-b border-white/20"></div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-primary"
                />
              </div>
              <span className="text-xs opacity-80">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Coins size={16} className="text-accent-gold" />
              <span className="font-mono text-accent-gold">
                {userProgress.mfaiTokens.toFixed(1)} $MFAI
              </span>
            </div>
            
            {connected && <WalletFaucetButton />}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={completeMission}
              className="text-xs bg-gradient-primary px-3 py-1 rounded-full text-white font-medium"
            >
              Complete mission
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const SkillchainBanner = () => {
  const location = useLocation()
  const enabled = shouldShowWalletUi(location.pathname)

  // Ensure layout offset is cleared on routes where the banner is disabled.
  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.setProperty('--skillchain-banner-offset', '0px')
    }
  }, [enabled])

  if (!enabled) return null
  return <SkillchainBannerInner />
}

export default SkillchainBanner

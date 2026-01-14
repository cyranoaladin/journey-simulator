/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { X, Loader, Sparkles } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import LazyWalletMultiButton from '../wallet/LazyWalletMultiButton'

const WALLET_TOP_GAP = 12
const WALLET_BOTTOM_GAP = 16

const shouldShowWalletUi = (path: string) =>
  path.startsWith('/journeys') || path.startsWith('/dao') || path.startsWith('/debug/mint')

const WalletConnectionBannerInner = () => {
  const { connected, connecting } = useWallet()
  const [isDismissed, setIsDismissed] = useState(false)
  const bannerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const root = document.documentElement

    if (connected || isDismissed) {
      root.style.setProperty('--wallet-banner-offset', '0px')
      return
    }

    const element = bannerRef.current
    if (!element) {
      root.style.setProperty('--wallet-banner-offset', '0px')
      return
    }

    const updateOffset = () => {
      const { height } = element.getBoundingClientRect()
      const offset = height > 0
        ? Math.ceil(height + WALLET_TOP_GAP + WALLET_BOTTOM_GAP)
        : 0
      root.style.setProperty('--wallet-banner-offset', `${offset}px`)
    }

    updateOffset()

    const handleResize = () => updateOffset()
    globalThis.window.addEventListener('resize', handleResize)

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateOffset())
      observer.observe(element)
    }

    return () => {
      globalThis.window.removeEventListener('resize', handleResize)
      observer?.disconnect()
      root.style.setProperty('--wallet-banner-offset', '0px')
    }
  }, [connected, isDismissed])

  if (connected || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={bannerRef}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed left-0 right-0 z-40 mx-4 top-[calc(var(--header-height)+var(--skillchain-banner-offset)+12px)]"
      >
        <div className="max-w-4xl mx-auto bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {connecting ? (
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Loader className="text-accent-cyan animate-spin" size={18} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center shadow-neon-ring-sm">
                  <Sparkles className="text-accent-cyan" size={18} />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white">
                  {connecting ? 'Establishing connection...' : 'Start your journey'}
                </h3>
                <p className="text-sm text-white/60">
                  {connecting
                    ? 'Check your wallet to confirm'
                    : 'Connect your wallet to enable mission tracking and rewards'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!connecting && (
                <div className="wallet-adapter-dropdown">
                  <LazyWalletMultiButton className="!bg-accent-cyan !text-black !px-5 !py-2.5 !rounded-xl !font-bold !hover:bg-cyan-400 !transition-all !flex !items-center !space-x-2 !shadow-neon-cyan" />
                </div>
              )}

              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

const WalletConnectionBanner = () => {
  const location = useLocation()
  const enabled = shouldShowWalletUi(location.pathname)

  // Ensure layout offset is cleared on routes where the wallet UI is disabled.
  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.setProperty('--wallet-banner-offset', '0px')
    }
  }, [enabled])

  if (!enabled) return null
  return <WalletConnectionBannerInner />
}

export default WalletConnectionBanner

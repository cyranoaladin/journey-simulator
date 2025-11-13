import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { AlertCircle, X, Loader } from 'lucide-react'
import { useState } from 'react'
import LazyWalletMultiButton from './wallet/LazyWalletMultiButton'

const WalletConnectionBanner = () => {
  const { connected, connecting } = useWallet()
  const [isDismissed, setIsDismissed] = useState(false)

  if (connected || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-0 right-0 z-40 mx-4"
      >
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {connecting ? (
                <div className="w-6 h-6 rounded-full bg-yellow-500/30 flex items-center justify-center">
                  <Loader className="text-yellow-400 animate-spin" size={16} />
                </div>
              ) : (
                <AlertCircle className="text-yellow-400 flex-shrink-0" size={20} />
              )}
              <div>
                <h3 className="font-semibold text-yellow-400">
                  {connecting ? 'Connecting wallet...' : 'Wallet not connected'}
                </h3>
                <p className="text-sm text-yellow-300/80">
                  {connecting 
                    ? 'Please approve the connection request in your wallet' 
                    : 'Connect your Solana wallet (set to Devnet) to unlock all features and start minting Proof-of-Skill™ NFTs'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!connecting && (
                <div className="wallet-adapter-dropdown">
                  <LazyWalletMultiButton className="!bg-yellow-500 !text-black !px-4 !py-2 !rounded-lg !font-medium !hover:bg-yellow-400 !transition-colors !flex !items-center !space-x-2" />
                </div>
              )}
              
              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} className="text-yellow-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WalletConnectionBanner
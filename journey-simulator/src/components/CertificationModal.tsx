import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award, Download, Share2, ExternalLink, Zap, AlertCircle } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Certification } from '../types/journey'
import NFTMintingModal from './NFTMintingModal'
import { useJourneyStore } from '../store/journeyStore'
import NFTProofModal from './NFTProofModal'
import { getProofType } from '../data/proofsData'
// import { api } from '../utils/api' // Will be used when backend is ready
import { logger } from '../utils/logger'

interface CertificationModalProps {
  certification: Certification
  onClose: () => void
}

const CertificationModal: React.FC<CertificationModalProps> = ({
  certification,
  onClose
}) => {
  const { connected } = useWallet()
  const { selectedPersona, loadUserProgress } = useJourneyStore()
  const [showMinting, setShowMinting] = useState(false)
  const [mintedAddress, setMintedAddress] = useState<string | null>(null)
  const [showProofModal, setShowProofModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract phase number from persona phases and certification metadata
  const getPhaseNumber = () => {
    if (!selectedPersona) return 1

    if (certification.phaseId) {
      const index = selectedPersona.phases.findIndex((phase) => phase.id === certification.phaseId)
      if (index !== -1) {
        return index + 1
      }
    }

    // Fallback to legacy ID parsing when phaseId is unavailable
    if (certification.id) {
      const matches = certification.id.match(/phase-(\d+)/)
      if (matches && matches[1]) {
        return parseInt(matches[1], 10)
      }
    }

    return 1
  }

  const phaseNumber = getPhaseNumber();

  // Handle certification download with backend tracking
  const handleDownload = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Track download in backend (simulated for now)
      logger.debug('Tracking certification download:', {
        certification_id: certification.id,
        phase: phaseNumber,
        user_persona: selectedPersona?.id,
        download_timestamp: new Date().toISOString()
      })

      // Simulate download
      const link = document.createElement('a')
      link.href = certification.imageUrl || '#'
      link.download = `${certification.name}_certification.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (err) {
      console.error('Failed to track download:', err)
      setError('Failed to track download. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle certification sharing with backend tracking
  const handleShare = async (platform: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Track share in backend (simulated for now)
      logger.debug('Tracking certification share:', {
        certification_id: certification.id,
        platform: platform,
        phase: phaseNumber,
        user_persona: selectedPersona?.id,
        share_timestamp: new Date().toISOString()
      })

      // Simulate sharing
      const shareUrl = `https://mfai.app/certification/${certification.id}`
      const shareText = `I just earned my ${certification.name} certification! 🎉 #MFAI #ProofOfSkill`

      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
      }

    } catch (err) {
      console.error('Failed to track share:', err)
      setError('Failed to track share. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle NFT minting completion
  const handleMintedNFT = async (mintAddress: string) => {
    try {
      setMintedAddress(mintAddress)
      setShowMinting(false)

      // Reload user progress to get updated NFT count
      await loadUserProgress()

    } catch (err) {
      console.error('Failed to reload progress after minting:', err)
    }
  }

  // Get proof type based on persona and certification
  const getProofTypeForCert = () => {
    if (!selectedPersona) return 'Skill';
    return getProofType(selectedPersona.id, certification.phaseId || certification.id);
  };

  const proofType = getProofTypeForCert();

  // Get persona-specific styling
  const getPersonaStyle = () => {
    if (!selectedPersona) return {}

    switch (selectedPersona.id) {
      case 'cognitive-activation-hub':
        return {
          bgGradient: 'from-sky-500 to-cyan-400',
          iconBg: 'bg-sky-500',
          textColor: 'text-cyan-300'
        }
      case 'capital-foundry':
        return {
          bgGradient: 'from-emerald-500 to-teal-500',
          iconBg: 'bg-emerald-500',
          textColor: 'text-emerald-300'
        }
      case 'system-architect':
        return {
          bgGradient: 'from-purple-500 to-indigo-500',
          iconBg: 'bg-purple-600',
          textColor: 'text-indigo-300'
        }
      case 'experience-studio':
        return {
          bgGradient: 'from-rose-500 to-fuchsia-500',
          iconBg: 'bg-rose-500',
          textColor: 'text-fuchsia-300'
        }
      case 'impact-engine':
        return {
          bgGradient: 'from-amber-500 to-lime-500',
          iconBg: 'bg-amber-500',
          textColor: 'text-lime-300'
        }
      case 'resilience-master':
        return {
          bgGradient: 'from-slate-500 to-cyan-600',
          iconBg: 'bg-slate-600',
          textColor: 'text-cyan-300'
        }
      default:
        return {
          bgGradient: 'from-sky-500 to-cyan-400',
          iconBg: 'bg-sky-500',
          textColor: 'text-cyan-300'
        }
    }
  }

  const personaStyle = getPersonaStyle()

  // Extract XP value from attributes
  const getXpValue = () => {
    const xpAttribute = certification.attributes.find(attr => attr.trait_type === 'XP Earned');
    return xpAttribute ? Number(xpAttribute.value) : 0;
  };

  // Extract phase from attributes
  const getPhaseValue = () => {
    const phaseAttribute = certification.attributes.find(attr => attr.trait_type === 'Phase');
    return phaseAttribute ? String(phaseAttribute.value) : '';
  };

  return (
    <>
      <AnimatePresence>
        {showProofModal ? (
          <NFTProofModal
            personaId={selectedPersona?.id}
            phaseId={certification.phaseId}
            proofType={proofType}
            title={certification.name}
            description={certification.description}
            imageUrl={certification.imageUrl}
            xpEarned={getXpValue()}
            phase={getPhaseValue()}
            phaseNumber={phaseNumber}
            completionDate={new Date().toLocaleDateString()}
            rarity={certification.rarity}
            onClose={() => setShowProofModal(false)}
            onViewSkillchain={() => {
              setShowProofModal(false);
              onClose();
              // Here you would navigate to or open the Skillchain Card view
            }}
          />
        ) : (
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
                <h2 className="text-xl font-space font-bold">Certification NFT</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  type="button"
                  aria-label="Close certification modal"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {/* NFT Card */}
              <div className={`relative border-2 rounded-xl p-4 mb-6 bg-gradient-to-br ${personaStyle.bgGradient} shadow-lg`}>
                {/* Persona Badge */}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/50 text-white capitalize">
                    {selectedPersona?.title || 'Certification'}
                  </span>
                </div>

                {/* NFT Image */}
                <div className="w-full h-48 bg-black/20 rounded-lg mb-4 flex items-center justify-center">
                  {certification.imageUrl ? (
                    <img
                      src={certification.imageUrl}
                      alt={certification.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className={`w-16 h-16 ${personaStyle.iconBg} rounded-full flex items-center justify-center`}>
                      <Award size={32} className="text-white" />
                    </div>
                  )}
                </div>

                {/* NFT Info */}
                <h3 className="font-space font-bold text-white mb-2">{certification.name}</h3>
                <p className="text-white/80 text-sm mb-4">{certification.description}</p>

                {/* Attributes */}
                <div className="space-y-2">
                  {certification.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-white/70">{attr.trait_type}:</span>
                      <span className="text-white font-semibold">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minting Status */}
              {mintedAddress && (
                <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-green-400 mb-2">NFT Minted!</h4>
                  <div className="text-xs">
                    <div className="opacity-70 mb-1">Address:</div>
                    <div className="font-mono break-all">{mintedAddress}</div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="text-red-400" size={16} />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={20} />
                  <span className="text-xs">{isLoading ? 'Downloading...' : 'Download'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={() => handleShare('twitter')}
                  disabled={isLoading}
                  className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 size={20} />
                  <span className="text-xs">{isLoading ? 'Sharing...' : 'Share'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (mintedAddress) {
                      window.open(`https://explorer.solana.com/address/${mintedAddress}?cluster=devnet`, '_blank')
                    }
                  }}
                  disabled={!mintedAddress}
                  className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <ExternalLink size={20} />
                  <span className="text-xs">Explorer</span>
                </motion.button>
              </div>

              {/* Mint Button */}
              {!mintedAddress && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProofModal(true)}
                  disabled={!connected}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-gradient-to-r ${personaStyle.bgGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Zap size={16} />
                  <span>{connected ? `Mint Proof-of-${proofType}™ NFT` : 'Connect Wallet to Mint'}</span>
                </motion.button>
              )}

              {/* Blockchain Info */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">Token ID:</span>
                  <span className="font-mono">#{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="opacity-70">Blockchain:</span>
                  <span>Solana Testnet</span>
                </div>
                {mintedAddress && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="opacity-70">Status:</span>
                    <span className="text-green-400">Minted</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Minting Modal */}
      <AnimatePresence>
        {showMinting && (
          <NFTMintingModal
            certification={certification}
            onClose={() => setShowMinting(false)}
            onMinted={handleMintedNFT}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default CertificationModal

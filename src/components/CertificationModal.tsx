import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award, Download, Share2, ExternalLink, Zap } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Certification } from '../types/journey'
import NFTMintingModal from './NFTMintingModal'
import { useJourneyStore } from '../store/journeyStore'
import NFTProofModal from './NFTProofModal'
import { getProofType } from '../data/proofsData'

interface CertificationModalProps {
  certification: Certification
  onClose: () => void
}

const CertificationModal: React.FC<CertificationModalProps> = ({
  certification,
  onClose
}) => {
  const { connected } = useWallet()
  const { selectedPersona } = useJourneyStore()
  const [showMinting, setShowMinting] = useState(false)
  const [mintedAddress, setMintedAddress] = useState<string | null>(null)
  const [showProofModal, setShowProofModal] = useState(false)

  // Extract phase number from certification ID
  const getPhaseNumber = () => {
    if (!certification.id) return 1;
    
    // Try to extract phase number from ID
    const matches = certification.id.match(/phase-(\d+)/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    
    // Fallback: check if ID contains phase names
    if (certification.id.includes('learn')) return 1;
    if (certification.id.includes('build')) return 2;
    if (certification.id.includes('prove')) return 3;
    if (certification.id.includes('activate')) return 4;
    if (certification.id.includes('scale')) return 5;
    
    return 1;
  };

  const phaseNumber = getPhaseNumber();

  // Get proof type based on persona and certification
  const getProofTypeForCert = () => {
    if (!selectedPersona) return 'Skill';
    return getProofType(selectedPersona.id, certification.id);
  };

  const proofType = getProofTypeForCert();

  // Get persona-specific styling
  const getPersonaStyle = () => {
    if (!selectedPersona) return {}
    
    switch (selectedPersona.id) {
      case 'investor':
        return {
          bgGradient: 'from-green-400 to-gold-500',
          iconBg: 'bg-gold-500',
          textColor: 'text-gold-500'
        }
      case 'web3-developer':
        return {
          bgGradient: 'from-purple-400 to-pink-500',
          iconBg: 'bg-purple-500',
          textColor: 'text-purple-500'
        }
      case 'content-creator':
        return {
          bgGradient: 'from-pink-400 to-purple-500',
          iconBg: 'bg-pink-500',
          textColor: 'text-pink-500'
        }
      case 'community-communicator':
        return {
          bgGradient: 'from-orange-400 to-red-500',
          iconBg: 'bg-orange-500',
          textColor: 'text-orange-500'
        }
      case 'project-manager':
        return {
          bgGradient: 'from-indigo-400 to-blue-500',
          iconBg: 'bg-indigo-500',
          textColor: 'text-indigo-500'
        }
      case 'defi-explorer':
        return {
          bgGradient: 'from-cyan-400 to-blue-500',
          iconBg: 'bg-cyan-500',
          textColor: 'text-cyan-500'
        }
      case 'nft-creator':
        return {
          bgGradient: 'from-pink-400 to-orange-500',
          iconBg: 'bg-pink-500',
          textColor: 'text-pink-500'
        }
      default:
        return {
          bgGradient: 'from-blue-400 to-cyan-500',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-500'
        }
    }
  }

  const personaStyle = getPersonaStyle()

  const handleMinted = (address: string) => {
    setMintedAddress(address)
    setShowMinting(false)
  }

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
                >
                  <X size={20} />
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

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Download size={20} />
                  <span className="text-xs">Download</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Share2 size={20} />
                  <span className="text-xs">Share</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (mintedAddress) {
                      window.open(`https://explorer.solana.com/address/${mintedAddress}?cluster=testnet`, '_blank')
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
            onMinted={handleMinted}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default CertificationModal
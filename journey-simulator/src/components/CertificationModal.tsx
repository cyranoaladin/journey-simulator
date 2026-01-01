import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Award, Download, ExternalLink, Share2, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { getProofType } from '../data/proofsData';
import { useJourneyStore } from '../store/journeyStore';
import { Certification } from '../types/journey';
import NFTMintingModal from './NFTMintingModal';
import NFTProofModal from './NFTProofModal';
// import { api } from '../utils/api' // Will be used when backend is ready
import { generateStableKey } from '../utils/generateStableKey';
import { logger } from '../utils/logger';
import { getPersonaStyle } from '../utils/personaStyles';

interface CertificationModalProps {
  certification: Certification;
  onClose: () => void;
}

const CertificationModal: React.FC<CertificationModalProps> = ({
  certification,
  onClose
}) => {
  const { connected } = useWallet();
  const { selectedPersona, loadUserProgress } = useJourneyStore();
  const [showMinting, setShowMinting] = useState(false);
  const [mintedAddress, setMintedAddress] = useState<string | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phaseNumber = (() => {
    if (!selectedPersona) return 1;
    if (certification.phaseId) {
      const index = selectedPersona.phases.findIndex((phase) => phase.id === certification.phaseId);
      if (index !== -1) return index + 1;
    }
    const matches = /phase-(\d+)/.exec(certification.id ?? '');
    if (matches?.[1]) return Number.parseInt(matches[1], 10);
    return 1;
  })();

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Track download in backend (simulated for now)
      logger.debug('Tracking certification download:', {
        certification_id: certification.id,
        phase: phaseNumber,
        user_persona: selectedPersona?.id,
        download_timestamp: new Date().toISOString()
      });

      // Simulate download
      const link = document.createElement('a');
      link.href = certification.imageUrl || '#';
      link.download = `${certification.name}_certification.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error('Failed to track download:', err);
      setError('Failed to track download. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Track share in backend (simulated for now)
      logger.debug('Tracking certification share:', {
        certification_id: certification.id,
        platform: platform,
        phase: phaseNumber,
        user_persona: selectedPersona?.id,
        share_timestamp: new Date().toISOString()
      });

      // Simulate sharing
      const shareUrl = `https://mfai.app/certification/${certification.id}`;
      const shareText = `I just earned my ${certification.name} certification! 🎉 #MFAI #ProofOfSkill`;
      const targets: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      };
      const targetUrl = targets[platform];
      if (targetUrl && globalThis.window) {
        globalThis.window.open(targetUrl, '_blank');
      }

    } catch (err) {
      console.error('Failed to track share:', err);
      setError('Failed to track share. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintedNFT = async (mintAddress: string) => {
    try {
      setMintedAddress(mintAddress);
      setShowMinting(false);

      // Reload user progress to get updated NFT count
      await loadUserProgress();

    } catch (err) {
      console.error('Failed to reload progress after minting:', err);
    }
  };

  const proofType = selectedPersona ? getProofType(selectedPersona.id, certification.phaseId || certification.id) : 'Skill';
  const personaStyle = getPersonaStyle(selectedPersona?.id);

  const getXpValue = () => {
    const xpAttribute = certification.attributes.find(attr => attr.trait_type === 'XP Earned');
    return xpAttribute ? Number(xpAttribute.value) : 0;
  };

  const getPhaseValue = () => {
    const phaseAttribute = certification.attributes.find(attr => attr.trait_type === 'Phase');
    return phaseAttribute ? String(phaseAttribute.value) : '';
  };

  const renderActionButton = ({
    label,
    icon,
    onClick,
    disabled,
    loadingLabel,
    primary,
  }: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loadingLabel?: string;
    primary?: boolean;
  }) => (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        primary ? 'bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan' : 'bg-white/10 hover:bg-white/20'
      }`}
    >
      {icon}
      <span className="text-xs">{disabled && loadingLabel ? loadingLabel : label}</span>
    </motion.button>
  );

  const renderActions = () => (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {renderActionButton({
        label: isLoading ? 'Downloading...' : 'Download',
        loadingLabel: 'Downloading...',
        icon: <Download size={20} />,
        onClick: () => {
          void handleDownload();
        },
        disabled: isLoading,
      })}
      {renderActionButton({
        label: isLoading ? 'Sharing...' : 'Share',
        loadingLabel: 'Sharing...',
        icon: <Share2 size={20} />,
        onClick: () => {
          void handleShare('twitter');
        },
        disabled: isLoading,
      })}
      {renderActionButton({
        label: mintedAddress ? 'Explorer' : 'Mint first',
        icon: <ExternalLink size={20} />,
        onClick: () => {
          if (mintedAddress) {
            globalThis.window.open(`https://explorer.solana.com/address/${mintedAddress}?cluster=devnet`, '_blank');
          }
        },
        disabled: !mintedAddress,
        primary: Boolean(mintedAddress),
      })}
    </div>
  );

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
                  {certification.attributes.map((attr) => {
                    const attrKey = generateStableKey(attr, 'cert-attribute', ['trait_type', 'value']);
                    return (
                      <div key={attrKey} className="flex justify-between text-sm">
                        <span className="text-white/70">{attr.trait_type}:</span>
                        <span className="text-white font-semibold">{attr.value}</span>
                      </div>
                    );
                  })}
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

              {renderActions()}

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
                  <span className="font-mono">#{Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
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
  );
};

export default CertificationModal;

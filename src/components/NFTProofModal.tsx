import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Download, 
  Share2, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  X, 
  Loader, 
  Zap, 
  Trophy,
  Twitter,
  Linkedin,
  MessageSquare,
  Wallet,
  ArrowUp
} from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useJourneyStore } from '../store/journeyStore';
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface NFTProofModalProps {
  proofType: 'Skill' | 'Vision' | 'Yield' | 'Build' | 'Creation' | 'Orchestration' | 'Design' | 'Invest';
  title: string;
  description: string;
  imageUrl?: string;
  xpEarned: number;
  phase: string;
  phaseNumber: number;
  completionDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onClose: () => void;
  onViewSkillchain?: () => void;
}

const NFTProofModal: React.FC<NFTProofModalProps> = ({
  proofType,
  title,
  description,
  imageUrl,
  xpEarned,
  phase,
  phaseNumber,
  completionDate = new Date().toLocaleDateString(),
  rarity = 'rare',
  onClose,
  onViewSkillchain
}) => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { selectedPersona, mintNFT } = useJourneyStore();
  const [isMinting, setIsMinting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mintedAddress, setMintedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Ref for the NFT card to capture for download
  const nftCardRef = useRef<HTMLDivElement>(null);
  // Ref for the modal content for scrolling
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position for "back to top" button
  const handleScroll = () => {
    if (modalContentRef.current) {
      setScrollPosition(modalContentRef.current.scrollTop);
    }
  };

  useEffect(() => {
    const currentRef = modalContentRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (!imageLoaded && !imageError && imageUrl) {
      const timer = setTimeout(() => {
        if (!imageLoaded) {
          setImageError(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, imageError, imageUrl]);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / 1000000000); // Convert lamports to SOL
        } catch (err) {
          console.error('Error fetching balance:', err);
          setWalletBalance(null);
        }
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  // Get persona-specific styling
  const getPersonaStyle = () => {
    if (!selectedPersona) return {};
    
    switch (selectedPersona.id) {
      case 'investor':
        return {
          bgGradient: 'from-green-400 to-gold-500',
          iconBg: 'bg-gold-500',
          textColor: 'text-gold-500',
          borderColor: 'border-gold-500'
        };
      case 'web3-developer':
        return {
          bgGradient: 'from-purple-400 to-pink-500',
          iconBg: 'bg-purple-500',
          textColor: 'text-purple-500',
          borderColor: 'border-purple-500'
        };
      case 'content-creator':
        return {
          bgGradient: 'from-pink-400 to-purple-500',
          iconBg: 'bg-pink-500',
          textColor: 'text-pink-500',
          borderColor: 'border-pink-500'
        };
      case 'community-communicator':
        return {
          bgGradient: 'from-orange-400 to-red-500',
          iconBg: 'bg-orange-500',
          textColor: 'text-orange-500',
          borderColor: 'border-orange-500'
        };
      case 'project-manager':
        return {
          bgGradient: 'from-indigo-400 to-blue-500',
          iconBg: 'bg-indigo-500',
          textColor: 'text-indigo-500',
          borderColor: 'border-indigo-500'
        };
      case 'defi-explorer':
        return {
          bgGradient: 'from-cyan-400 to-blue-500',
          iconBg: 'bg-cyan-500',
          textColor: 'text-cyan-500',
          borderColor: 'border-cyan-500'
        };
      case 'nft-creator':
        return {
          bgGradient: 'from-pink-400 to-orange-500',
          iconBg: 'bg-pink-500',
          textColor: 'text-pink-500',
          borderColor: 'border-pink-500'
        };
      default:
        return {
          bgGradient: 'from-blue-400 to-cyan-500',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-500',
          borderColor: 'border-blue-500'
        };
    }
  };

  const personaStyle = getPersonaStyle();
  const totalSteps = 4;

  // Get rarity styling
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          gradient: 'from-yellow-400 to-orange-500',
          border: 'border-yellow-400',
          shadow: 'shadow-yellow-400/30',
          text: 'text-yellow-400'
        };
      case 'epic':
        return {
          gradient: 'from-purple-400 to-pink-500',
          border: 'border-purple-400',
          shadow: 'shadow-purple-400/30',
          text: 'text-purple-400'
        };
      case 'rare':
        return {
          gradient: 'from-blue-400 to-cyan-500',
          border: 'border-blue-400',
          shadow: 'shadow-blue-400/30',
          text: 'text-blue-400'
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-600',
          border: 'border-gray-400',
          shadow: 'shadow-gray-400/30',
          text: 'text-gray-400'
        };
    }
  };

  const rarityStyle = getRarityStyle(rarity);

  // Get proof type icon
  const getProofTypeIcon = () => {
    switch (proofType) {
      case 'Skill': return <Award size={24} />;
      case 'Vision': return <Zap size={24} />;
      case 'Yield': return <Trophy size={24} />;
      case 'Build': return <Award size={24} />;
      case 'Creation': return <Award size={24} />;
      case 'Orchestration': return <Award size={24} />;
      case 'Design': return <Award size={24} />;
      case 'Invest': return <Award size={24} />;
      default: return <Award size={24} />;
    }
  };

  // Generate token ID
  const generateTokenId = () => {
    return `${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  };

  const tokenId = generateTokenId();

  // Handle minting
  const handleMint = async () => {
    if (!connected || !publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    setIsMinting(true);
    setError(null);
    
    try {
      // Simulate minting steps
      for (let step = 1; step <= totalSteps; step++) {
        setCurrentStep(step);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Call actual mint function
      const result = await mintNFT(title, { publicKey, signTransaction });
      setMintedAddress(result.mintAddress);

      // Set explorer URL
      const url = `https://explorer.solana.com/address/${result.mintAddress}?cluster=devnet`;
      setExplorerUrl(url);
      
    } catch (err: any) {
      console.error('Error minting NFT:', err);
      setError(err?.message || 'Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  // Get minting step text
  const getMintingStepText = () => {
    switch (currentStep) {
      case 1: return 'Preparing metadata...';
      case 2: return 'Connecting to Solana testnet...';
      case 3: return 'Creating on-chain token...';
      case 4: return `Finalizing Proof-of-${proofType}™ NFT...`;
      default: return 'Processing...';
    }
  };

  // Copy token ID
  const copyTokenId = async () => {
    await navigator.clipboard.writeText(tokenId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy explorer URL
  const copyExplorerUrl = async () => {
    if (!explorerUrl) return;
    
    await navigator.clipboard.writeText(explorerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download NFT image
  const downloadImage = async () => {
    if (!nftCardRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Add watermark text
      const dataUrl = await htmlToImage.toPng(nftCardRef.current, {
        quality: 0.95,
        backgroundColor: '#000000',
        canvasWidth: nftCardRef.current.offsetWidth * 2,
        canvasHeight: nftCardRef.current.offsetHeight * 2,
        pixelRatio: 2,
        skipFonts: true // Skip external fonts to avoid CORS issues
      });
      
      // Create a canvas to add watermark
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          saveAs(dataUrl, `Proof-of-${proofType}-${title}.png`);
          setIsDownloading(false);
          return;
        }
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(`Money Factory AI - Proof-of-${proofType}™`, canvas.width / 2, canvas.height - 30);
        
        // Convert to blob and save
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `Proof-of-${proofType}-${title}.png`);
          } else {
            saveAs(dataUrl, `Proof-of-${proofType}-${title}.png`);
          }
          setIsDownloading(false);
        });
      };
      
      img.onerror = () => {
        saveAs(dataUrl, `Proof-of-${proofType}-${title}.png`);
        setIsDownloading(false);
      };
      
      img.src = dataUrl;
    } catch (error) {
      console.error('Error downloading image:', error);
      setIsDownloading(false);
    }
  };

  // Share NFT
  const shareNFT = (platform: 'twitter' | 'linkedin' | 'discord') => {
    const text = `I just earned my Proof-of-${proofType}™ NFT "${title}" on Money Factory AI! #MoneyFactoryAI #ProofEconomy`;
    const url = explorerUrl || 'https://moneyfactory.ai';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case 'discord':
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('Link copied to clipboard! You can now paste it in Discord.');
        setShowShareOptions(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    setShowShareOptions(false);
  };

  // Format wallet address
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Scroll to top
  const scrollToTop = () => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

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
        className="bg-primary-900 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-primary-900 z-10 pb-2">
          <div className="flex items-center space-x-2">
            {getProofTypeIcon()}
            <h2 className="text-xl font-space font-bold">Proof-of-{proofType}™ NFT</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={modalContentRef} 
          className="overflow-y-auto flex-1 pr-1 -mr-1 scroll-smooth"
          onScroll={handleScroll}
        >
          {/* NFT Card */}
          <div 
            ref={nftCardRef}
            className={`relative border-2 rounded-xl p-4 mb-6 bg-gradient-to-br ${personaStyle.bgGradient} ${personaStyle.borderColor} shadow-lg`}
          >
            {/* Persona Badge */}
            <div className="absolute top-2 right-2 z-10">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/50 text-white capitalize">
                {selectedPersona?.title || 'Certification'}
              </span>
            </div>

            {/* Rarity Badge */}
            <div className="absolute top-2 left-2 z-10">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-black/50 ${rarityStyle.text} capitalize`}>
                {rarity}
              </span>
            </div>

            {/* NFT Image with Loading State */}
            <div className="w-full aspect-square bg-black/20 rounded-lg mb-4 overflow-hidden relative">
              {imageUrl && !imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="animate-spin text-white/50" size={32} />
                    </div>
                  )}
                  <img 
                    src={imageUrl} 
                    alt={title}
                    className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
                  <div className="text-center p-4">
                    <Award size={48} className="mx-auto mb-4 text-white/80" />
                    <h3 className="text-white font-bold text-lg mb-2">Proof-of-{proofType}™</h3>
                    <p className="text-white/80 text-sm">{title}</p>
                  </div>
                </div>
              )}
            </div>

            {/* NFT Info */}
            <h3 className="font-space font-bold text-white text-lg mb-2">{title}</h3>
            <p className="text-white/80 text-sm mb-4">{description}</p>

            {/* Attributes */}
            <div className="space-y-3 mb-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm flex items-center">
                  <Trophy size={14} className="mr-1" />
                  XP Earned:
                </span>
                <motion.span 
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: 0 }}
                  className="text-white font-semibold bg-green-500/20 px-2 py-0.5 rounded text-sm"
                >
                  +{xpEarned} XP
                </motion.span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Phase:</span>
                <span className="text-white font-semibold text-sm">
                  Step {phaseNumber}: {phase}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Completion Date:</span>
                <span className="text-white font-semibold text-sm">{completionDate}</span>
              </div>
            </div>
          </div>

          {/* Wallet Connection Status */}
          {!mintedAddress && !isMinting && (
            <div className="mb-6 p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold mb-3 flex items-center">
                <Wallet size={16} className="mr-2" />
                Wallet Status
              </h3>
              
              {connected ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Connected:</span>
                    <span className="text-sm font-mono bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                      {publicKey ? formatWalletAddress(publicKey.toString()) : 'Unknown'}
                    </span>
                  </div>
                  
                  {walletBalance !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-70">Balance:</span>
                      <span className="text-sm font-mono">
                        {walletBalance.toFixed(4)} SOL
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Network:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">Solana Testnet</span>
                      <img src="/images/solana.svg" alt="Solana" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <p className="text-sm text-center opacity-80 mb-2">
                    Connect your wallet to mint this Proof-of-{proofType}™ NFT
                  </p>
                  
                  <div className="wallet-adapter-dropdown">
                    <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !rounded-lg !py-2 !px-4 !text-white !font-medium" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Minting Status */}
          {isMinting && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Minting in Progress</h3>
                <span className="text-sm">{currentStep}/{totalSteps}</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <motion.div 
                  className={`h-full rounded-full bg-gradient-to-r ${personaStyle.bgGradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex items-center justify-center space-x-3 text-sm">
                <Loader className="animate-spin" size={16} />
                <span>{getMintingStepText()}</span>
              </div>
            </div>
          )}

          {/* Success State */}
          {mintedAddress && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="text-green-400" size={20} />
                <h3 className="font-semibold text-green-400">Proof-of-{proofType}™ Minted!</h3>
              </div>
              <p className="text-sm opacity-80 mb-3">
                Your Proof-of-{proofType}™ NFT has been successfully minted on Solana Testnet
              </p>
              <div className="bg-black/20 rounded-lg p-2">
                <div className="text-xs opacity-70 mb-1">NFT Address:</div>
                <div className="font-mono text-xs break-all">{mintedAddress}</div>
              </div>
              
              {onViewSkillchain && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onViewSkillchain}
                  className="w-full mt-3 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <Award size={16} />
                  <span>View on Skillchain Card™</span>
                </motion.button>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-2">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Blockchain Info */}
          <div className="p-3 bg-white/5 rounded-lg mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-70">Token ID:</span>
              <div className="flex items-center space-x-1">
                <span className="font-mono">{tokenId}</span>
                <button 
                  onClick={copyTokenId}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="Copy token ID"
                >
                  {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="opacity-70">Blockchain:</span>
              <div className="flex items-center space-x-1">
                <span>Solana Testnet</span>
                <span className="text-xs">(Devnet)</span>
              </div>
            </div>
            {mintedAddress && (
              <div className="flex justify-between text-sm mt-1">
                <span className="opacity-70">Status:</span>
                <span className="text-green-400">Minted</span>
              </div>
            )}
            {explorerUrl && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="opacity-70">Explorer URL:</span>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={copyExplorerUrl}
                    className="p-1 hover:bg-white/10 rounded transition-colors text-blue-400 hover:text-blue-300"
                    aria-label="Copy explorer URL"
                  >
                    {copied ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Minting Tutorial */}
          {!mintedAddress && !isMinting && (
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">How to mint your Proof-of-{proofType}™ NFT:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Connect your Phantom wallet in Devnet mode</li>
                <li>Click "Mint Proof-of-{proofType}™ NFT" button</li>
                <li>Approve the transaction in your wallet</li>
                <li>View your NFT on Solana Explorer</li>
                <li>Download or share your achievement</li>
                <li>Find your NFT in your Skillchain Card™</li>
              </ol>
            </div>
          )}
        </div>

        {/* Back to top button */}
        <AnimatePresence>
          {scrollPosition > 200 && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bottom-24 right-6 p-2 rounded-full bg-gradient-primary text-white shadow-lg"
              onClick={scrollToTop}
            >
              <ArrowUp size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Action Buttons - Fixed at bottom */}
        <div className="space-y-4 sticky bottom-0 bg-primary-900 pt-4 mt-4 border-t border-white/10">
          {/* Primary Action */}
          {!mintedAddress && !isMinting && connected && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMint}
              disabled={isMinting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-gradient-to-r ${personaStyle.bgGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Mint NFT"
            >
              <Zap size={16} />
              <span>Mint Proof-of-{proofType}™ NFT</span>
            </motion.button>
          )}

          {/* Secondary Actions */}
          {mintedAddress && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (explorerUrl) {
                  window.open(explorerUrl, '_blank');
                }
              }}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white"
              aria-label="View on Solana Explorer"
            >
              <ExternalLink size={16} />
              <span>View on Solana Explorer</span>
            </motion.button>
          )}

          {/* Utility Actions */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadImage}
              disabled={isDownloading}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Download NFT image"
            >
              {isDownloading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              <span className="text-sm">Download</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative"
              aria-label="Share NFT"
            >
              <Share2 size={20} />
              <span className="text-sm">Share</span>
              
              {/* Share Options Dropdown */}
              <AnimatePresence>
                {showShareOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 bg-primary-900 border border-white/20 rounded-lg p-2 w-32 z-10"
                  >
                    <button 
                      onClick={() => shareNFT('twitter')}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-white/10 rounded transition-colors flex items-center space-x-2"
                    >
                      <Twitter size={14} />
                      <span>Twitter</span>
                    </button>
                    <button 
                      onClick={() => shareNFT('linkedin')}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-white/10 rounded transition-colors flex items-center space-x-2"
                    >
                      <Linkedin size={14} />
                      <span>LinkedIn</span>
                    </button>
                    <button 
                      onClick={() => shareNFT('discord')}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-white/10 rounded transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare size={14} />
                      <span>Discord</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (explorerUrl) {
                  window.open(explorerUrl, '_blank');
                }
              }}
              disabled={!mintedAddress}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="View on explorer"
            >
              <ExternalLink size={20} />
              <span className="text-sm">Explorer</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NFTProofModal;

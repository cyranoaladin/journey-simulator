import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Award,
  Loader,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
// import { useWallet } from '@solana/wallet-adapter-react'
// import { PublicKey } from '@solana/web3.js'
import { Certification } from "../types/journey";
import { useJourneyStore } from "../store/journeyStore";
import { api } from "../utils/api";

interface NFTMintingModalProps {
  certification: Certification;
  onClose: () => void;
  onMinted: (mintAddress: string) => void;
}

const NFTMintingModal: React.FC<NFTMintingModalProps> = ({
  certification,
  onClose,
  onMinted,
}) => {
  const publicKey = null as any;
  const signTransaction = undefined as any;
  const { selectedPersona, loadUserProgress } = useJourneyStore();
  const [isMinting, setIsMinting] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [backendError, setBackendError] = useState<string | null>(null);
  const totalSteps = 4;

  // Handle NFT minting with backend sync
  const handleMintNFT = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsMinting(true);
      setError(null);
      setBackendError(null);
      setCurrentStep(1);

      // Step 1: Validate certification
      setCurrentStep(2);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Generate NFT metadata
      setCurrentStep(3);
      // Metadata generation (commented out for now)
      // const metadata = {
      //   name: certification.name,
      //   description: certification.description,
      //   image: certification.imageUrl,
      //   attributes: [
      //     { trait_type: 'Phase', value: certification.phase || 1 },
      //     { trait_type: 'Persona', value: selectedPersona?.title || 'Unknown' },
      //     { trait_type: 'Rarity', value: certification.rarity || 'rare' }
      //   ]
      // }

      // Step 3: Mint NFT (simulated)
      setCurrentStep(4);
      const simulatedMintAddress = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Step 4: Sync with backend
      try {
        await api.addNFTCertificateEnhanced({
          phase: 1, // Default phase
          title: certification.name,
          description: certification.description,
          image_url: certification.imageUrl,
          mint_address: simulatedMintAddress,
          rarity: certification.rarity || "rare",
          xp_earned: 100, // Default XP
        });

        // Reload user progress to get updated NFT count
        await loadUserProgress();
      } catch (backendErr) {
        console.error("Failed to sync NFT with backend:", backendErr);
        setBackendError(
          "NFT minted but failed to sync with backend. Please refresh the page.",
        );
      }

      setMintAddress(simulatedMintAddress);
      onMinted(simulatedMintAddress);
    } catch (err) {
      console.error("NFT minting failed:", err);
      setError("Failed to mint NFT. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  // Get persona-specific styling
  const getPersonaStyle = () => {
    if (!selectedPersona) return {};

    switch (selectedPersona.id) {
      case "investor":
        return {
          bgGradient: "from-green-400 to-gold-500",
          iconBg: "bg-gold-500",
          textColor: "text-gold-500",
        };
      case "web3-developer":
        return {
          bgGradient: "from-purple-400 to-pink-500",
          iconBg: "bg-purple-500",
          textColor: "text-purple-500",
        };
      case "content-creator":
        return {
          bgGradient: "from-pink-400 to-purple-500",
          iconBg: "bg-pink-500",
          textColor: "text-pink-500",
        };
      case "community-communicator":
        return {
          bgGradient: "from-orange-400 to-red-500",
          iconBg: "bg-orange-500",
          textColor: "text-orange-500",
        };
      case "project-manager":
        return {
          bgGradient: "from-indigo-400 to-blue-500",
          iconBg: "bg-indigo-500",
          textColor: "text-indigo-500",
        };
      case "defi-explorer":
        return {
          bgGradient: "from-cyan-400 to-blue-500",
          iconBg: "bg-cyan-500",
          textColor: "text-cyan-500",
        };
      case "nft-creator":
        return {
          bgGradient: "from-pink-400 to-orange-500",
          iconBg: "bg-pink-500",
          textColor: "text-pink-500",
        };
      default:
        return {
          bgGradient: "from-blue-400 to-cyan-500",
          iconBg: "bg-blue-500",
          textColor: "text-blue-500",
        };
    }
  };

  const personaStyle = getPersonaStyle();

  const handleMint = async () => {
    if (!publicKey || !signTransaction) {
      setError("Wallet not connected");
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      // Simulate NFT minting with steps
      for (let step = 1; step <= totalSteps; step++) {
        setCurrentStep(step);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Generate a simulated mint address
      const simulatedMintAddress = `mint_${Date.now()}`;
      setMintAddress(simulatedMintAddress);
      onMinted(simulatedMintAddress);
    } catch (err) {
      console.error("Error during minting:", err);
      setError("Error minting NFT");
    } finally {
      setIsMinting(false);
    }
  };

  const getMintingStepText = () => {
    switch (currentStep) {
      case 1:
        return "Preparing metadata...";
      case 2:
        return "Connecting to Solana testnet...";
      case 3:
        return "Creating on-chain token...";
      case 4:
        return "Finalizing Proof-of-Skill™ NFT...";
      default:
        return "Processing...";
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
        className="bg-primary-900 rounded-2xl p-6 max-w-md w-full border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-space font-bold">
            Mint Proof-of-Skill™ NFT
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NFT Preview */}
        <div
          className={`relative border-2 rounded-xl p-4 mb-6 bg-gradient-to-br ${personaStyle.bgGradient || "from-blue-400 to-cyan-500"} border-white/20`}
        >
          <div className="w-full h-48 bg-black/20 rounded-lg mb-4 flex items-center justify-center">
            {certification.imageUrl ? (
              <img
                src={certification.imageUrl}
                alt={certification.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div
                className={`w-16 h-16 ${personaStyle.iconBg || "bg-blue-500"} rounded-full flex items-center justify-center`}
              >
                <Award size={32} className="text-white" />
              </div>
            )}
          </div>
          <h3 className="font-space font-bold text-white mb-2">
            {certification.name}
          </h3>
          <p className="text-white/80 text-sm">{certification.description}</p>
        </div>

        {/* Minting Status */}
        {!mintAddress && !error && !isMinting && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Minting Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Network:</span>
                <span>Solana Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Minting fee:</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Persona:</span>
                <span className="capitalize">
                  {selectedPersona?.title || "None"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Minting Progress */}
        {isMinting && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Minting in Progress</h3>
              <span className="text-sm">
                {currentStep}/{totalSteps}
              </span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${personaStyle.bgGradient || "from-blue-400 to-cyan-500"}`}
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
        {mintAddress && (
          <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="text-green-400" size={20} />
              <h3 className="font-semibold text-green-400">
                Proof-of-Skill™ Minted!
              </h3>
            </div>
            <p className="text-sm opacity-80 mb-3">
              Your Proof-of-Skill™ NFT has been successfully minted on Solana
              Testnet
            </p>
            <div className="bg-black/20 rounded-lg p-2">
              <div className="text-xs opacity-70 mb-1">NFT Address:</div>
              <div className="font-mono text-xs break-all">{mintAddress}</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="text-red-400" size={16} />
              <h3 className="font-semibold text-red-400">Minting Error</h3>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Backend Error State */}
        {backendError && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="text-yellow-400" size={16} />
              <h3 className="font-semibold text-yellow-400">Sync Warning</h3>
            </div>
            <p className="text-sm">{backendError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!isMinting && !mintAddress && !error && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMintNFT}
              disabled={isMinting || !publicKey}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-gradient-to-r ${personaStyle.bgGradient || "from-blue-400 to-cyan-500"} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Award size={16} />
              <span>Mint Proof-of-Skill™ NFT</span>
            </motion.button>
          )}

          {mintAddress && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                window.open(
                  `https://explorer.solana.com/address/${mintAddress}?cluster=testnet`,
                  "_blank",
                );
              }}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white"
            >
              <ExternalLink size={16} />
              <span>View on Solana Explorer</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg font-medium transition-all border border-white/20 hover:bg-white/10"
          >
            {mintAddress ? "Close" : "Cancel"}
          </motion.button>
        </div>

        {/* Wallet Connection Warning */}
        {!publicKey && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              Connect your Solana wallet to mint this Proof-of-Skill™ NFT
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default NFTMintingModal;

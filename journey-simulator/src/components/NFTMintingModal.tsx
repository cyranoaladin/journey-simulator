/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState, useEffect, type FC, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  Loader,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Certificate } from "../types/journey";
import { useJourneyStore } from "../store/journeyStore";
import { api } from "../utils/api";
import { getPersonaStyle } from "../utils/personaStyles";

interface NFTMintingModalProps {
  certificate: Certificate;
  onClose: () => void;
  onMinted: (mintAddress: string) => void;
  debugRecipient?: string;
}

const NFTMintingModal: FC<NFTMintingModalProps> = ({
  certificate,
  onClose,
  onMinted,
  debugRecipient,
}) => {
  const { publicKey } = useWallet();
  const { selectedPersona, loadUserProgress } = useJourneyStore();
  const [isMinting, setIsMinting] = useState(false);
  const [mintTxSig, setMintTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [simDetails, setSimDetails] = useState<{
    estFeeLamports: number;
    riskScore: number;
    network: string;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const totalSteps = 4;

  // Auto-dismiss toast
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 6000);
    return () => clearTimeout(t);
  }, [showToast]);

  const handleMintNFT = async () => {
    const recipient =
      debugRecipient || (publicKey ? publicKey.toBase58() : null);
    if (!recipient) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsMinting(true);
      setError(null);
      setBackendError(null);
      setCurrentStep(1);

      // Step 1: simulate
      const simulatePayload = {
        recipient,
        name: certificate.name,
        symbol: "MFAI",
        uri: certificate.imageUrl || "https://example.com/metadata.json",
      };
      setCurrentStep(2);
      const sim = await api.solanaMintSimulate(simulatePayload);
      if (!sim?.ok || !sim?.sim?.ok) {
        throw new Error("Simulation failed");
      }
      setSimDetails({
        estFeeLamports: sim.sim.estFeeLamports,
        riskScore: sim.sim.riskScore,
        network: sim.sim.network,
      });

      // Step 2: execute
      setCurrentStep(3);
      const exec = await api.solanaMintExecute({ ...simulatePayload, ...sim.sim });
      if (!exec?.ok || !exec?.tx?.txSig) {
        throw new Error("Execution failed");
      }

      setCurrentStep(4);
      const txSig = exec.tx.txSig;
      setShowToast(true);

      try {
        await api.addNFTCertificateEnhanced({
          phase: 1,
          title: certificate.name,
          description: certificate.description,
          image_url: certificate.imageUrl,
          mint_address: txSig,
          rarity: certificate.rarity || "rare",
          xp_earned: 100,
        });

        await loadUserProgress();
      } catch (backendErr) {
        console.error("Failed to sync NFT with backend:", backendErr);
        setBackendError(
          "NFT minted but failed to sync with backend. Please refresh the page.",
        );
      }

      setMintTxSig(txSig);
      onMinted(txSig);
    } catch (err) {
      console.error("NFT minting failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mint NFT. Please try again.",
      );
    } finally {
      setIsMinting(false);
    }
  };

  // Use shared persona style utility
  const personaStyle = getPersonaStyle(selectedPersona?.id);

  const getMintingStepText = () => {
    switch (currentStep) {
      case 1:
        return "Preparing metadata...";
      case 2:
        return "Connecting to Solana testnet...";
      case 3:
        return "Creating on-chain token...";
      case 4:
        return "Finalizing Proof-of-Skill NFT...";
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
        onClick={(e: MouseEvent) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Mint Proof-of-Skill NFT"
        className="bg-primary-900 rounded-2xl p-6 max-w-md w-full border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-space font-bold">
            Mint Proof-of-Skill NFT
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            type="button"
            aria-label="Close minting modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div
          className={`relative border-2 rounded-xl p-4 mb-6 bg-gradient-to-br ${personaStyle.bgGradient || "from-blue-400 to-cyan-500"
            } border-white/20`}
        >
          <div className="w-full h-48 bg-black/20 rounded-lg mb-4 flex items-center justify-center">
            {certificate.imageUrl ? (
              <img
                src={certificate.imageUrl}
                alt={certificate.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div
                className={`w-16 h-16 ${personaStyle.iconBg || "bg-blue-500"
                  } rounded-full flex items-center justify-center`}
              >
                <Award size={32} className="text-white" />
              </div>
            )}
          </div>
          <h3 className="font-space font-bold text-white mb-2">
            {certificate.name}
          </h3>
          <p className="text-white/80 text-sm">{certificate.description}</p>
        </div>

        {!mintTxSig && !error && !isMinting && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Minting Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Network:</span>
                <span>Solana {simDetails?.network ?? "Testnet"}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Estimated fee:</span>
                <span className="text-green-400">
                  {simDetails ? `${simDetails.estFeeLamports} lamports` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Risk score:</span>
                <span>
                  {simDetails ? simDetails.riskScore.toFixed(2) : ""}
                </span>
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

        {mintTxSig && (
          <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="text-green-400" size={20} />
              <h3 className="font-semibold text-green-400">
                Proof-of-Skill Minted!
              </h3>
            </div>
            <p className="text-sm opacity-80 mb-3">
              Your Proof-of-Skill transaction has been submitted on Solana
            </p>
            <div className="bg-black/20 rounded-lg p-2">
              <div className="text-xs opacity-70 mb-1">
                Transaction Signature:
              </div>
              <div className="font-mono text-xs break-all" data-testid="mint-tx-signature">{mintTxSig}</div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4"
            data-testid="minting-error-banner"
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="text-red-400" size={16} />
              <h3 className="font-semibold text-red-400">Minting Error</h3>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {backendError && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="text-yellow-400" size={16} />
              <h3 className="font-semibold text-yellow-400">Sync Warning</h3>
            </div>
            <p className="text-sm">{backendError}</p>
          </div>
        )}

        <div className="space-y-3">
          {!isMinting && !mintTxSig && !error && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMintNFT}
              disabled={isMinting || (!publicKey && !debugRecipient)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-gradient-to-r ${personaStyle.bgGradient || "from-blue-400 to-cyan-500"
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Award size={16} />
              <span>Mint Proof-of-Skill NFT</span>
            </motion.button>
          )}

          {mintTxSig && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                globalThis.window.open(
                  `https://explorer.solana.com/tx/${mintTxSig}?cluster=devnet`,
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
            {mintTxSig ? "Close" : "Cancel"}
          </motion.button>
        </div>

        {!publicKey && !debugRecipient && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              Connect your Solana wallet to mint this Proof-of-Skill NFT
            </p>
          </div>
        )}
        {/* Success toast */}
        <AnimatePresence>
          {showToast && mintTxSig && (
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 40, y: 20 }}
              className="fixed bottom-4 right-4 z-[60] rounded-lg shadow-lg bg-primary-800 border border-white/20 p-4 w-[320px]"
            >
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-400 mt-0.5" size={18} />
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-1">
                    Proof-of-Skill minted
                  </div>
                  <div className="text-xs opacity-80 mb-2 break-all">
                    Tx: {mintTxSig}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        globalThis.window.open(
                          `https://explorer.solana.com/tx/${mintTxSig}?cluster=devnet`,
                          "_blank",
                        );
                      }}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <ExternalLink size={14} /> Explorer
                    </button>
                    <button
                      onClick={() => {
                        setShowToast(false);
                        try {
                          onClose();
                          setTimeout(() => {
                            const el =
                              document.getElementById("last-mint-card");
                            el?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }, 200);
                        } catch (closeError) {
                          console.warn(
                            "Failed to close mint modal gracefully",
                            closeError,
                          );
                        }
                      }}
                      className="text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10"
                    >
                      View in Profile
                    </button>
                    <button
                      onClick={() => setShowToast(false)}
                      className="text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default NFTMintingModal;

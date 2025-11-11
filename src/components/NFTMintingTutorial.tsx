import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Zap,
  CheckCircle,
  ExternalLink,
  Download,
  Share2,
  Award,
} from "lucide-react";

const NFTMintingTutorial: React.FC = () => {
  return (
    <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-400 mb-3">
        How to Mint Your Proof-of-Skill™ NFT
      </h3>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Connect Your Wallet</h4>
            <p className="text-sm opacity-80 mb-2">
              Connect your Phantom wallet in Devnet mode to mint on Solana
              devnet.
            </p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-blue-400">
              <Wallet size={12} />
              <span>Make sure you have some SOL devnet tokens</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">2</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Complete Your Mission</h4>
            <p className="text-sm opacity-80 mb-2">
              Finish the required phase tasks to unlock the minting capability.
            </p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-green-400">
              <CheckCircle size={12} />
              <span>Your mission is complete and ready for proof</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Mint Your Proof</h4>
            <p className="text-sm opacity-80 mb-2">
              Click the "Mint Proof" button and approve the transaction in your
              wallet.
            </p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-accent-purple">
              <Zap size={12} />
              <span>The minting process takes about 15 seconds</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">4</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Verify & Share</h4>
            <p className="text-sm opacity-80 mb-2">
              Check your NFT on Solana Explorer, download it, or share your
              achievement.
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-xs">
                <ExternalLink size={12} className="text-blue-400" />
                <span>Explorer</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <Download size={12} className="text-green-400" />
                <span>Download</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <Share2 size={12} className="text-purple-400" />
                <span>Share</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">5</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">View on Skillchain Card™</h4>
            <p className="text-sm opacity-80 mb-2">
              Your NFT is now part of your Skillchain Card™ collection.
            </p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-accent-gold">
              <Award size={12} />
              <span>All your proofs are visible in your Skillchain Card™</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NFTMintingTutorial;

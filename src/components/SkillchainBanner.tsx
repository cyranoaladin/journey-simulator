import React from "react";
import { motion } from "framer-motion";
import { Ticket as Pickaxe, Coins, Info } from "lucide-react";
import { useJourneyStore } from "../store/journeyStore";
// import { useWallet } from '@solana/wallet-adapter-react'
import WalletFaucetButton from "./WalletFaucetButton";

const SkillchainBanner = () => {
  const { userProgress, completeMission } = useJourneyStore();
  const connected = false;

  // Calculate progress based on completed phases
  const progress = Math.min((userProgress.totalXP / 500) * 100, 100);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed top-16 left-0 right-0 z-40 glass-effect border-b border-white/10"
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
                  <p className="opacity-80">
                    XP gained through the Cognitive Activation Protocol™ that
                    transforms your skills into digital capital.
                  </p>
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
              <span className="text-xs opacity-80">
                {Math.round(progress)}%
              </span>
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
  );
};

export default SkillchainBanner;

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const ENABLE_WALLET = (import.meta as any).env?.VITE_ENABLE_WALLET === "1";

const WalletConnectionGuide: React.FC = () => {
  const [WalletMultiButton, setWalletMultiButton] =
    useState<React.ComponentType<any> | null>(null);
  useEffect(() => {
    if (ENABLE_WALLET) {
      import("@solana/wallet-adapter-react-ui")
        .then((mod) => setWalletMultiButton(() => mod.WalletMultiButton))
        .catch(() => setWalletMultiButton(null));
    }
  }, []);
  return (
    <div className="p-6 bg-primary-900/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
      <h2 className="text-xl font-space font-bold mb-4 flex items-center">
        <Wallet className="mr-2 text-accent-cyan" size={20} />
        <span className="gradient-text">Skillchain Card™ Setup</span>
      </h2>
      <p className="text-sm opacity-80 mb-6">
        Connect your Solana wallet to activate your Skillchain Card™ and start
        your journey in the Proof Economy.
      </p>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Install a Solana Wallet</h4>
            <p className="text-sm opacity-80 mb-2">
              Install Phantom or Solflare wallet browser extension.
            </p>
            <div className="flex space-x-2">
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-gradient-primary hover:opacity-90 px-3 py-1 rounded-full flex items-center space-x-1 text-white"
              >
                <Download size={12} />
                <span>Phantom</span>
              </a>
              <a
                href="https://solflare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center space-x-1"
              >
                <Download size={12} />
                <span>Solflare</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">2</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Switch to Devnet</h4>
            <p className="text-sm opacity-80 mb-2">
              In your wallet settings, switch the network from "Mainnet" to
              "Devnet".
            </p>
            <div className="flex items-center space-x-2 text-xs text-yellow-400">
              <Settings size={12} />
              <span>Settings → Developer Settings → Network → Devnet</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Get Testnet SOL</h4>
            <p className="text-sm opacity-80 mb-2">
              You'll need some testnet SOL to pay for transaction fees.
            </p>
            <a
              href="https://solfaucet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-gradient-primary hover:opacity-90 px-3 py-1 rounded-full flex items-center space-x-1 inline-block text-white"
            >
              <Zap size={12} />
              <span>Solana Faucet</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start space-x-3"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">4</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Connect Your Wallet</h4>
            <p className="text-sm opacity-80 mb-2">
              Click the "Connect Wallet" button below and select your wallet.
            </p>
            <div className="flex items-center space-x-2">
              {ENABLE_WALLET && WalletMultiButton ? (
                <div className="wallet-adapter-dropdown">
                  <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !rounded-lg !py-2 !px-4 !text-white !font-medium" />
                </div>
              ) : (
                <button
                  className="bg-gradient-primary text-white rounded-lg py-2 px-4 opacity-80 cursor-not-allowed"
                  title="Wallet disabled in dev"
                >
                  Connect Wallet
                </button>
              )}
              <img src="/images/solana.svg" alt="Solana" className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 p-3 bg-gradient-primary/20 border border-primary-500/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-accent-cyan mt-0.5" size={16} />
          <div>
            <h4 className="text-sm font-semibold text-accent-cyan">
              Testnet Simulation
            </h4>
            <p className="text-xs opacity-80">
              This is a testnet simulation. No real tokens or NFTs are involved.
              All transactions are for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionGuide;

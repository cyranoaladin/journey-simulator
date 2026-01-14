/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Loader, CheckCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface WalletFaucetButtonProps {
  className?: string;
}

const WalletFaucetButton: React.FC<WalletFaucetButtonProps> = ({ className = '' }) => {
  const { connected } = useWallet();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const requestTestnetTokens = async () => {
    if (!connected || isRequesting) return;
    
    setIsRequesting(true);
    
    // Simulate faucet request
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSuccess(true);
    setIsRequesting(false);
    
    // Reset success state after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  if (!connected) return null;

  const buildButtonClass = () => {
    const base = 'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50';
    if (isSuccess) return `${base} bg-green-500 text-white ${className}`;
    return `${base} bg-blue-600 hover:bg-blue-500 text-white ${className}`;
  };

  const renderContent = () => {
    if (isRequesting) {
      return (
        <>
          <Loader size={14} className="animate-spin" />
          <span>Requesting...</span>
        </>
      );
    }
    if (isSuccess) {
      return (
        <>
          <CheckCircle size={14} />
          <span>Received SOL!</span>
        </>
      );
    }
    return (
      <>
        <Droplets size={14} />
        <img src="/images/solana.svg" alt="Solana" className="w-4 h-4 ml-1" />
        <span>Get Devnet SOL</span>
      </>
    );
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={requestTestnetTokens}
      disabled={isRequesting || isSuccess}
      className={buildButtonClass()}
    >
      {renderContent()}
    </motion.button>
  );
};

export default WalletFaucetButton;
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Wallet, Coins, ExternalLink, Copy, CheckCircle, Wifi, WifiOff, Loader, AlertCircle } from 'lucide-react';

interface WalletStatusDisplayProps {
  showBalance?: boolean;
  showNetwork?: boolean;
  className?: string;
}

const WalletStatusDisplay: React.FC<WalletStatusDisplayProps> = ({
  showBalance = true,
  showNetwork = true,
  className = ''
}) => {
  const { publicKey, connected, connecting } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey && connection) {
        setIsLoading(true);
        setError(null);
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / 1000000000); // Convert lamports to SOL
        } catch (err) {
          console.error('Error fetching balance:', err);
          setError('Failed to fetch balance');
          setBalance(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
    
    // Set up interval to refresh balance
    const interval = setInterval(fetchBalance, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy wallet address
  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open explorer
  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank');
    }
  };

  return (
    <div className={`p-4 rounded-lg border border-white/10 bg-white/5 ${className}`}>
      <h3 className="font-semibold mb-3 flex items-center">
        <Wallet size={16} className="mr-2" />
        Wallet Status
      </h3>
      
      {connected ? (
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-70">Status:</span>
            <div className="flex items-center space-x-1">
              <Wifi size={14} className="text-green-400" />
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>
          
          {/* Wallet Address */}
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-70">Address:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono">{formatAddress(publicKey!.toString())}</span>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Copy address"
              >
                {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          
          {/* Balance */}
          {showBalance && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-70">Balance:</span>
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <Loader size={14} className="animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-1 text-red-400">
                  <AlertCircle size={14} />
                  <span className="text-sm">{error}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Coins size={14} />
                  <span className="text-sm font-mono">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Unknown'}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Network */}
          {showNetwork && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-70">Network:</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Solana Devnet</span>
                <img src="/images/solana.svg" alt="Solana" className="w-4 h-4 ml-1" />
              </div>
            </div>
          )}
          
          {/* Explorer Link */}
          <button
            onClick={openExplorer}
            className="w-full mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center space-x-1"
          >
            <ExternalLink size={14} />
            <span>View on Explorer</span>
          </button>
        </div>
      ) : (
        <div className="text-center py-2">
          <div className="flex items-center justify-center space-x-1 mb-2">
            {connecting ? (
              <>
                <Loader size={16} className="animate-spin text-yellow-400" />
                <span className="text-sm text-yellow-400">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">Not Connected</span>
              </>
            )}
          </div>
          <p className="text-xs opacity-70">
            {connecting ? 'Please approve the connection request in your wallet' : 'Connect your wallet to view details'}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletStatusDisplay;
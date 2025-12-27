import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader,
  LogOut,
  RefreshCw,
  Wallet,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { useAuth } from '../contexts/AuthContext';
import { useJourneyStore } from '../store/journeyStore';
import { logger } from '../utils/logger';

const WalletButton = () => {
  const { publicKey, wallet, disconnect, connected, connecting, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const { userProgress, updateWalletConnection } = useJourneyStore(
    (state) => ({
      userProgress: state.userProgress,
      updateWalletConnection: state.updateWalletConnection,
    }),
    shallow
  );
  const { loginWithWallet, isAuthenticated } = useAuth();

  // Update store when connection changes
  useEffect(() => {
    const handleConnection = async () => {
      if (connected && publicKey) {
        updateWalletConnection(true, publicKey.toString());

        // Auto-login if not already authenticated
        if (!isAuthenticated) {
          const success = await loginWithWallet(publicKey.toString(), signMessage);
          if (!success) {
            // If login fails (e.g. user not found), we might want to redirect to register
            // or show a notification. For now, we just log it.
            logger.warn("Wallet login failed - user might need to register");
          }
        }
      } else if (!connected) {
        updateWalletConnection(false, undefined);
      }

      // Reset connecting state when connection status changes
      if (connected || (!connecting && isConnecting)) {
        setIsConnecting(false);
      }
    };

    handleConnection();
  }, [connected, publicKey, connecting, isConnecting, updateWalletConnection, isAuthenticated, loginWithWallet]);

  // Handle connection errors
  useEffect(() => {
    const handleError = (event: any) => {
      const error = event.detail;
      console.error('Wallet connection error:', error);
      setConnectError(error?.message || 'Connection failed');
      setIsConnecting(false);
    };

    window.addEventListener('walletError', handleError);
    return () => window.removeEventListener('walletError', handleError);
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    setConnectError(null);
    setVisible(true);
  };

  const handleRetry = () => {
    setConnectError(null);
    handleConnect();
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
    updateWalletConnection(false, undefined);
  };

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getWalletIcon = () => {
    if (!wallet?.adapter.icon) return <Wallet size={20} />;
    return (
      <img
        src={wallet.adapter.icon}
        alt={wallet.adapter.name}
        className="w-5 h-5"
      />
    );
  };

  const getConnectionStatus = () => {
    if (connectError) return {
      icon: <AlertCircle size={16} className="text-red-400" />,
      text: 'Connection failed',
      color: 'text-red-400'
    };
    if (connecting || isConnecting) return {
      icon: <Loader size={16} className="animate-spin" />,
      text: 'Connecting...',
      color: 'text-yellow-400'
    };
    if (connected) return {
      icon: <Wifi size={16} />,
      text: 'Connected',
      color: 'text-green-400'
    };
    return {
      icon: <WifiOff size={16} />,
      text: 'Disconnected',
      color: 'text-gray-400'
    };
  };

  const status = getConnectionStatus();

  if (!connected) {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConnect}
          disabled={connecting || isConnecting}
          className="flex items-center space-x-2 bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-70"
        >
          {connecting || isConnecting ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <div className="flex items-center space-x-2">
              <Wallet size={20} />
              <img src="/images/solana.svg" alt="Solana" className="w-5 h-5" />
            </div>
          )}
          <span>{connecting || isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </motion.button>

        {/* Error message */}
        <AnimatePresence>
          {connectError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full mt-2 right-0 bg-red-500/20 border border-red-500/30 rounded-lg p-2 z-50 w-64"
            >
              <div className="flex items-start space-x-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-400">{connectError}</p>
                  <button
                    onClick={handleRetry}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center"
                  >
                    <RefreshCw size={10} className="mr-1" />
                    Retry connection
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/20"
      >
        <div className="flex items-center space-x-2">
          {getWalletIcon()}
          <img src="/images/solana.svg" alt="Solana" className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">{formatAddress(publicKey!.toString())}</span>
        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-primary-900 border border-white/20 rounded-xl shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getWalletIcon()}
                  <span className="font-semibold">{wallet?.adapter.name}</span>
                </div>
                <div className={`flex items-center space-x-1 text-xs ${status.color}`}>
                  {status.icon}
                  <span>{status.text}</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-80">Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{formatAddress(publicKey!.toString())}</span>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {copied ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Info */}
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold mb-2">Network</h3>
              <div className="flex items-center justify-between">
                <span>Solana Devnet</span>
                <div className="flex items-center space-x-1 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs">Active</span>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold mb-3">Account Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-accent-gold">{userProgress.totalXP}</div>
                  <div className="text-xs opacity-70">Total XP</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-accent-gold">{userProgress.mfaiTokens.toFixed(1)}</div>
                  <div className="text-xs opacity-70">$MFAI</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-accent-purple">{userProgress.votingPower}</div>
                  <div className="text-xs opacity-70">Voting Power</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-accent-cyan">{userProgress.nfts.length}</div>
                  <div className="text-xs opacity-70">NFTs</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    globalThis.window.open(`https://explorer.solana.com/address/${publicKey!.toString()}?cluster=devnet`, '_blank');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>View on Solana Explorer</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isDropdownOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-transparent border-0 p-0 cursor-default"
          onClick={() => setIsDropdownOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setIsDropdownOpen(false);
            }
          }}
          aria-label="Close dropdown"
        />
      )}
    </div>
  );
};

export default WalletButton;

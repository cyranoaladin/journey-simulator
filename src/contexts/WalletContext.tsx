import { ReactNode, useMemo, FC } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletContextProviderProps {
  children: ReactNode
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Configuration for Solana Devnet
  const network = 'devnet'
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // Supported wallets configuration
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
    ],
    []
  )

  // Handle wallet errors
  const onError = (error: Error) => {
    console.error('Wallet error:', error);
    // Dispatch a custom event for error handling
    window.dispatchEvent(new CustomEvent('walletError', { detail: error }));
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false} onError={onError}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
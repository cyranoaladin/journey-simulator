/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { WalletAdapterNetwork, type WalletAdapter } from '@solana/wallet-adapter-base'
import { logger } from '../utils/logger'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletContextProviderProps {
  children: ReactNode
}

type WalletGlobals = Window & {
  __MFAI_SOLANA_NETWORK__?: WalletAdapterNetwork
  __MFAI_SOLANA_ENDPOINT__?: string
  __MFAI_WALLET_ADAPTERS__?: string[]
}

export const resolveNetwork = (): WalletAdapterNetwork => {
  const rawValue = (import.meta.env.VITE_SOLANA_NETWORK ?? '').toString().trim().toLowerCase()

  switch (rawValue) {
    case 'mainnet':
    case 'mainnet-beta':
      return WalletAdapterNetwork.Mainnet
    case 'testnet':
      return WalletAdapterNetwork.Testnet
    case 'devnet':
    default:
      return WalletAdapterNetwork.Devnet
  }
}

export const resolveEndpoint = (network: WalletAdapterNetwork): string => {
  const override = (import.meta.env.VITE_SOLANA_RPC_URL ?? '').toString().trim()
  if (override.length > 0) {
    return override
  }

  // Avoid importing @solana/web3.js just to get clusterApiUrl.
  // Keep the mapping explicit so the "solana" chunk loads only when we actually need web3 features.
  switch (network) {
    case WalletAdapterNetwork.Mainnet:
      return 'https://api.mainnet-beta.solana.com'
    case WalletAdapterNetwork.Testnet:
      return 'https://api.testnet.solana.com'
    case WalletAdapterNetwork.Devnet:
    default:
      return 'https://api.devnet.solana.com'
  }
}

export const WalletContextProvider = ({ children }: WalletContextProviderProps) => {
  const [wallets, setWallets] = useState<WalletAdapter[]>([])

  const network = useMemo(() => resolveNetwork(), [])
  const endpoint = useMemo(() => resolveEndpoint(network), [network])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const globals = window as WalletGlobals
      globals.__MFAI_SOLANA_NETWORK__ = network
      globals.__MFAI_SOLANA_ENDPOINT__ = endpoint
    }
  }, [endpoint, network])

  useEffect(() => {
    let isMounted = true

    void (async () => {
      try {
        const [
          { SolflareWalletAdapter },
          { TorusWalletAdapter }
        ] = await Promise.all([
          import('@solana/wallet-adapter-solflare'),
          import('@solana/wallet-adapter-torus')
        ])

        const adapters: WalletAdapter[] = [
          new SolflareWalletAdapter({ network }),
          new TorusWalletAdapter()
        ]

        if (isMounted) {
          setWallets(adapters)

          if (typeof window !== 'undefined') {
            const globals = window as WalletGlobals
            const adapterNames = adapters.map((adapter) => adapter.name)
            globals.__MFAI_WALLET_ADAPTERS__ = adapterNames

            window.dispatchEvent(
              new CustomEvent('walletAdaptersReady', {
                detail: adapterNames,
              })
            )
          }
        }
      } catch (error) {
        logger.error('Wallet adapter initialization failed:', error)

        if (typeof window !== 'undefined') {
          const detail = error instanceof Error ? error : new Error('Wallet initialization failed')
          window.dispatchEvent(new CustomEvent('walletError', { detail }))
        }

        if (isMounted) {
          setWallets([])
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [network])

  // Handle wallet errors
  const onError = (error: Error) => {
    logger.error('Wallet error:', error)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('walletError', { detail: error }))
    }
  }

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

import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletContextProvider, resolveEndpoint, resolveNetwork } from '../WalletContext'

describe('WalletContext helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('falls back to devnet when no network env is set', () => {
    vi.unstubAllEnvs()
    expect(resolveNetwork()).toBe(WalletAdapterNetwork.Devnet)
  })

  it('maps custom network values to adapter constants', () => {
    vi.stubEnv('VITE_SOLANA_NETWORK', 'testnet')
    expect(resolveNetwork()).toBe(WalletAdapterNetwork.Testnet)

    vi.stubEnv('VITE_SOLANA_NETWORK', 'mainnet-beta')
    expect(resolveNetwork()).toBe(WalletAdapterNetwork.Mainnet)
  })

  it('returns override endpoint when provided', () => {
    const customRpc = 'https://devnet-custom.solana.com'
    vi.stubEnv('VITE_SOLANA_RPC_URL', customRpc)

    expect(resolveEndpoint(WalletAdapterNetwork.Devnet)).toBe(customRpc)
  })
})

describe('WalletContextProvider integration', () => {
  afterEach(() => {
    const globals = globalThis as typeof globalThis & {
      __MFAI_WALLET_ADAPTERS__?: string[]
      __MFAI_SOLANA_NETWORK__?: WalletAdapterNetwork
      __MFAI_SOLANA_ENDPOINT__?: string
    }
    delete globals.__MFAI_WALLET_ADAPTERS__
    delete globals.__MFAI_SOLANA_NETWORK__
    delete globals.__MFAI_SOLANA_ENDPOINT__
  })

  it('announces available adapters after initialization', async () => {
    const adaptersPromise = new Promise<string[]>((resolve, reject) => {
      const globals = globalThis as typeof globalThis & {
        __MFAI_WALLET_ADAPTERS__?: string[]
        __MFAI_SOLANA_NETWORK__?: WalletAdapterNetwork
        __MFAI_SOLANA_ENDPOINT__?: string
      }

      if (Array.isArray(globals.__MFAI_WALLET_ADAPTERS__)) {
        resolve(globals.__MFAI_WALLET_ADAPTERS__)
        return
      }

      const handleReady = (event: Event) => {
        cleanup()
        resolve((event as CustomEvent<string[]>).detail)
      }

      const handleError = (event: Event) => {
        cleanup()
        const detail = (event as CustomEvent<Error | unknown>).detail
        reject(detail instanceof Error ? detail : new Error('walletError received'))
      }

      const cleanup = () => {
        globalThis.removeEventListener?.('walletAdaptersReady', handleReady)
        globalThis.removeEventListener?.('walletError', handleError)
      }

      globalThis.addEventListener?.('walletAdaptersReady', handleReady)
      globalThis.addEventListener?.('walletError', handleError)
    })

    await act(async () => {
      render(
        <WalletContextProvider>
          <div data-testid="wallet-context-child" />
        </WalletContextProvider>
      )
    })

    let adapters: string[] = []

    await act(async () => {
      adapters = await adaptersPromise
    })

    expect(adapters).toEqual(
      expect.arrayContaining(['Solflare', 'Torus'])
    )

    const globals = globalThis as typeof globalThis & {
      __MFAI_SOLANA_NETWORK__?: WalletAdapterNetwork
      __MFAI_SOLANA_ENDPOINT__?: string
    }

    expect(globals.__MFAI_SOLANA_NETWORK__).toBe(WalletAdapterNetwork.Devnet)
    expect(globals.__MFAI_SOLANA_ENDPOINT__).toMatch(/devnet/i)
  })
})

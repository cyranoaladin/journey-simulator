/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { useJourneyStore } from '../journeyStore'

describe('journeyStore wallet integration', () => {
  beforeEach(() => {
    useJourneyStore.setState((state) => ({
      ...state,
      userProgress: {
        ...state.userProgress,
        walletConnected: false,
        walletAddress: undefined,
      },
    }))
  })

  it('stores wallet details when connection succeeds', () => {
    const { updateWalletConnection } = useJourneyStore.getState()

    updateWalletConnection(true, 'test-public-key')

    const { userProgress } = useJourneyStore.getState()
    expect(userProgress.walletConnected).toBe(true)
    expect(userProgress.walletAddress).toBe('test-public-key')
  })

  it('clears wallet details when disconnecting', () => {
    const { updateWalletConnection } = useJourneyStore.getState()

    updateWalletConnection(true, 'test-public-key')
    updateWalletConnection(false)

    const { userProgress } = useJourneyStore.getState()
    expect(userProgress.walletConnected).toBe(false)
    expect(userProgress.walletAddress).toBeUndefined()
  })
})

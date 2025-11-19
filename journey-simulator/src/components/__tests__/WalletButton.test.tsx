import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  disconnect: vi.fn(),
  setVisible: vi.fn(),
}))

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
    wallet: null,
    disconnect: mocks.disconnect,
    connected: false,
    connecting: false,
  }),
}))

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({ setVisible: mocks.setVisible }),
}))

import WalletButton from '../WalletButton'

describe('WalletButton', () => {
  afterEach(() => {
    mocks.disconnect.mockReset()
    mocks.setVisible.mockReset()
  })

  it('shows wallet error feedback when walletError event fires', async () => {
    render(<WalletButton />)

    act(() => {
      window.dispatchEvent(new CustomEvent('walletError', { detail: new Error('Boom!') }))
    })

    expect(await screen.findByText('Boom!')).toBeInTheDocument()
  })

  it('tries to reconnect when the user selects retry', async () => {
    const user = userEvent.setup()
    render(<WalletButton />)

    act(() => {
      window.dispatchEvent(new CustomEvent('walletError', { detail: new Error('Network down') }))
    })

    const retryButton = await screen.findByRole('button', { name: /Retry connection/i })
    await user.click(retryButton)

    expect(mocks.setVisible).toHaveBeenCalledWith(true)
  })
})

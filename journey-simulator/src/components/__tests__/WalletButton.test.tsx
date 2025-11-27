import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../contexts/AuthContext'
import { MemoryRouter } from 'react-router-dom'

const mocks = vi.hoisted(() => ({
  disconnect: vi.fn(),
  setVisible: vi.fn(),
  useAuthMock: {
    user: { name: 'Test User', wallet_address: 'test123' },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  }
}))

vi.mock('../../contexts/AuthContext', async () => {
  const actual = await import('../../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => mocks.useAuthMock,
  }
})

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

// Create a wrapper with AuthProvider and MemoryRouter
const renderWithAuth = (ui: React.ReactElement, { ...renderOptions }: any = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  )
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

import WalletButton from '../WalletButton'

describe('WalletButton', () => {
  afterEach(() => {
    mocks.disconnect.mockReset()
    mocks.setVisible.mockReset()
  })

  it('shows wallet error feedback when walletError event fires', async () => {
    renderWithAuth(<WalletButton />)

    act(() => {
      window.dispatchEvent(new CustomEvent('walletError', { detail: new Error('Boom!') }))
    })

    expect(await screen.findByText('Boom!')).toBeInTheDocument()
  })

  it('tries to reconnect when the user selects retry', async () => {
    const user = userEvent.setup()
    renderWithAuth(<WalletButton />)

    act(() => {
      window.dispatchEvent(new CustomEvent('walletError', { detail: new Error('Network down') }))
    })

    const retryButton = await screen.findByRole('button', { name: /Retry connection/i })
    await user.click(retryButton)

    expect(mocks.setVisible).toHaveBeenCalledWith(true)
  })
})

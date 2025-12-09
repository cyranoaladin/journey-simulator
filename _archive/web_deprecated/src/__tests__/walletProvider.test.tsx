import { render, screen } from '@testing-library/react'
import WalletProvider from '@/components/WalletProvider'

jest.mock('@solana/wallet-adapter-react', () => ({
  ConnectionProvider: ({ children }: any) => <div data-testid="connection">{children}</div>,
  WalletProvider: ({ children }: any) => <div data-testid="wallet">{children}</div>,
  useWallet: jest.fn(() => ({
    publicKey: null,
    connected: false,
    signMessage: jest.fn(),
  })),
}))

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletModalProvider: ({ children }: any) => <div data-testid="modal">{children}</div>,
}))

jest.mock('@solana/wallet-adapter-phantom', () => ({
  PhantomWalletAdapter: function PW() {},
}))

describe('WalletProvider', () => {
  it('renders children inside providers', () => {
    render(
      <WalletProvider>
        <div>Child</div>
      </WalletProvider>
    )
    expect(screen.getByText('Child')).toBeInTheDocument()
    expect(screen.getByTestId('connection')).toBeInTheDocument()
    expect(screen.getByTestId('wallet')).toBeInTheDocument()
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })
})

import { render, screen, fireEvent } from '@testing-library/react'

jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => ({
    connection: { sendRawTransaction: jest.fn(), confirmTransaction: jest.fn() },
  }),
  useWallet: () => ({ publicKey: null }),
}))

// Mock web3 to avoid ESM parsing issues and heavy deps
jest.mock('@solana/web3.js', () => ({
  VersionedTransaction: { deserialize: jest.fn(() => ({})) },
}))

// Dynamic import to ensure mocks are applied
describe('TxPage', () => {
  it('shows message when wallet is not connected', async () => {
    const mod = await import('../../app/tx/page')
    const Component = mod.default
    render(<Component />)
    const button = screen.getByRole('button', { name: /préparer et envoyer/i })
    fireEvent.click(button)
    const msgs = await screen.findAllByText(/connectez un wallet/i)
    expect(msgs.length).toBeGreaterThan(0)
  })
})

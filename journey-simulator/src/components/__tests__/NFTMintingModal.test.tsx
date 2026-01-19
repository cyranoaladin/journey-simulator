/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NFTMintingModal from '../NFTMintingModal'
import type { Certificate } from '../../types/journey'
import { useJourneyStore } from '../../store/journeyStore'

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({ publicKey: { toBase58: () => 'F11111111111111111111111111111111111111111' } })
}))

vi.mock('../../utils/api', () => ({
  api: {
    solanaMintSimulate: vi.fn(async () => ({ ok: true, sim: { ok: true, estFeeLamports: 5000, riskScore: 0.12, network: 'devnet' } })),
    solanaMintExecute: vi.fn(async () => ({ ok: true, tx: { txSig: 'SIG123' } })),
    addNFTCertificateEnhanced: vi.fn(async () => ({})),
  }
}))

describe('NFTMintingModal', () => {
  const cert: Certificate = {
    id: 'phase-1-skill',
    name: 'Skill Proof',
    description: 'Test certification',
    imageUrl: 'https://example.com/img.png',
    attributes: [{ trait_type: 'XP Earned', value: '100' }, { trait_type: 'Phase', value: 'learn' }]
  } as any

  beforeEach(() => {
    // Ensure store has loadUserProgress to avoid side effects
    useJourneyStore.setState((s: any) => ({ ...s, loadUserProgress: vi.fn(async () => { }) }))
    window.open = vi.fn() as any
  })

  it('runs simulate then execute and shows tx signature + explorer link', async () => {
    const onMinted = vi.fn()
    const onClose = vi.fn()
    render(<NFTMintingModal certificate={cert} onClose={onClose} onMinted={onMinted} />)

    const button = screen.getByRole('button', { name: /Mint Proof-of-Skill/i })
    fireEvent.click(button)

    await waitFor(() => expect(screen.getByText(/Transaction Signature/i)).toBeInTheDocument())
    expect(screen.getByText('SIG123')).toBeInTheDocument()

    // Explorer button
    const explorerBtn = screen.getByText('View on Solana Explorer')
    fireEvent.click(explorerBtn)
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('/tx/SIG123?cluster=devnet'), '_blank')

    // API order
    const { api } = await import('../../utils/api')
    expect((api.solanaMintSimulate as any).mock.calls.length).toBe(1)
    expect((api.solanaMintExecute as any).mock.calls.length).toBe(1)
    expect(onMinted).toHaveBeenCalledWith('SIG123')
  })
})
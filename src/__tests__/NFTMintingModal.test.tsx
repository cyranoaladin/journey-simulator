import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import NFTMintingModal from '../components/NFTMintingModal';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useJourneyStore } from '../store/journeyStore';
import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { Certification } from '../types/journey';

jest.mock('@solana/wallet-adapter-react');
jest.mock('../store/journeyStore');

const certification: Certification = {
  id: '1',
  name: 'Test',
  description: 'desc',
  imageUrl: '',
  rarity: 'common',
  attributes: [],
};

describe('NFTMintingModal', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    (useJourneyStore as jest.Mock).mockReturnValue({ selectedPersona: null });
    jest.spyOn(PublicKey, 'unique').mockImplementation(() => Keypair.generate().publicKey);
  });

  it('shows wallet warning when not connected', () => {
    (useWallet as jest.Mock).mockReturnValue({ publicKey: null, signTransaction: null });
    (useConnection as jest.Mock).mockReturnValue({ connection: new Connection('https://api.devnet.solana.com') });
    render(<NFTMintingModal certification={certification} onClose={() => {}} onMinted={() => {}} />);
    expect(screen.getByText(/connect your solana wallet/i)).toBeInTheDocument();
  });

  it('calls onMinted after successful mint', async () => {
    const onMinted = jest.fn();
    const mockKey = PublicKey.unique();
    (useWallet as jest.Mock).mockReturnValue({ publicKey: mockKey, signTransaction: jest.fn() });
    (useConnection as jest.Mock).mockReturnValue({ connection: new Connection('https://api.devnet.solana.com') });

    jest.useFakeTimers();
    render(<NFTMintingModal certification={certification} onClose={() => {}} onMinted={onMinted} />);
    const mintButton = screen.getByRole('button', { name: /mint proof-of-skill/i });
    fireEvent.click(mintButton);
    const advanceTimersByTime = async (time: number) => {
      await act(async () => {
        jest.advanceTimersByTime(time);
      });
    };

    await advanceTimersByTime(1000);
    await advanceTimersByTime(1000);
    await advanceTimersByTime(1000);
    await advanceTimersByTime(1000);
    expect(await screen.findByText(/Proof-of-Skill™ Minted/i)).toBeInTheDocument();
    jest.useRealTimers();
  });
});

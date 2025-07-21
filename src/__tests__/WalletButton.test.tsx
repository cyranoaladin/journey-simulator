import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import WalletButton from '../components/WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useJourneyStore } from '../store/journeyStore';

jest.mock('@solana/wallet-adapter-react');
jest.mock('@solana/wallet-adapter-react-ui');
jest.mock('../store/journeyStore');

describe('WalletButton', () => {
  const mockSetVisible = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
      connecting: false,
    });
    (useWalletModal as jest.Mock).mockReturnValue({
      visible: false,
      setVisible: mockSetVisible,
    });
    (useJourneyStore as jest.Mock).mockReturnValue({
      userProgress: { totalXP: 0, mfaiTokens: 0, votingPower: 0, nfts: [] },
      updateWalletConnection: jest.fn(),
    });
  });

  it('renders connect wallet button', () => {
    render(<WalletButton />);
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });

  it('opens wallet modal on click', () => {
    render(<WalletButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });
});

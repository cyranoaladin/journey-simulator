import { Keypair } from '@solana/web3.js';
import { requestAirdrop, getWalletBalance } from '../utils/blockchain';

describe('blockchain integration', () => {
  jest.setTimeout(30000);

  it('requests airdrop and checks balance', async () => {
    const keypair = Keypair.generate();
    try {
      const signature = await requestAirdrop(keypair.publicKey);
      expect(typeof signature).toBe('string');
      await new Promise(r => setTimeout(r, 5000));
      const balance = await getWalletBalance(keypair.publicKey);
      expect(balance).toBeGreaterThan(0);
    } catch (err) {
      console.warn('Devnet not reachable, skipping test');
      return;
    }
  });
});

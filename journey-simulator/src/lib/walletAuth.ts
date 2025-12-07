import { auth } from '../api/mf-back';
import { LoginResponse } from '../utils/api';
import bs58 from 'bs58';

interface WalletLoginParams {
  walletPublicKey: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

export async function loginWithWalletFlow({
  walletPublicKey,
  signMessage,
}: WalletLoginParams): Promise<LoginResponse> {
  try {
    // 1. Get challenge from backend
    const { data: challengeData, error: challengeError } = await auth.getWalletChallenge(walletPublicKey);

    if (challengeError || !challengeData || !challengeData.message) {
      throw new Error(challengeError ? 'API Error' : 'Failed to obtain login challenge');
    }
    const { message } = challengeData;

    // 2. Sign the message using the wallet
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = await signMessage(messageBytes);
    const signature = bs58.encode(signatureBytes);

    // 3. Complete login with signature verification
    const { data: loginData, error: loginError } = await auth.loginWithWallet(walletPublicKey, message, signature);

    if (loginError || !loginData) {
      throw new Error(loginError ? 'Login failed' : 'No data received');
    }

    // Cast to legacy LoginResponse type for compatibility (they share structure)
    return loginData as unknown as LoginResponse;
  } catch (error) {
    console.error('[Wallet Auth] Login flow failed:', error);
    throw error;
  }
}

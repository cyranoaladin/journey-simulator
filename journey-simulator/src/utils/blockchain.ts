import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { logger } from './logger';
import { tokenStore } from './tokenStore';

// Constants
const SOLANA_CLUSTER = 'devnet';
const SOLANA_ENDPOINT = `https://api.${SOLANA_CLUSTER}.solana.com`;

// Initialize connection
export const getConnection = () => {
  return new Connection(SOLANA_ENDPOINT);
};

// Request airdrop of testnet SOL
export const requestAirdrop = async (publicKey: PublicKey): Promise<string> => {
  try {
    const connection = getConnection();
    const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    throw error;
  }
};

// Get wallet balance
export const getWalletBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const connection = getConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
};

export type MintProofOfSkillResult = {
  success: boolean
  mintAddress?: string
  signature?: string
  error?: string
}

type ProofMetadata = {
  name: string
  description: string
  image: string
  attributes?: { trait_type: string; value: string | number }[]
}

const buildMockMintResult = (): MintProofOfSkillResult => ({
  success: true,
  mintAddress: `DEMO_MINT_${Date.now()}`,
  signature: `DEMO_SIGNATURE_${Date.now()}`,
})

const shouldMockMintRequests = (error?: unknown): boolean => {
  const mockFlag = import.meta.env.VITE_SOLANA_MINT_MOCK

  if (mockFlag === 'false') {
    return false
  }

  if (mockFlag === 'true') {
    return true
  }

  if (typeof window !== 'undefined') {
    try {
      if (tokenStore.getAccessToken() === 'demo-token') {
        return true
      }
    } catch (storageError) {
      // Ignore storage access issues and continue with other heuristics
    }
  }

  const apiBase = import.meta.env.VITE_SOLANA_API_BASE_URL
  if (!apiBase) {
    return true
  }

  if (import.meta.env.DEV && apiBase.includes('127.0.0.1:3003')) {
    return true
  }

  if (error instanceof Error) {
    const message = error.message || ''
    if (message.includes('Failed to fetch') || message.includes('ECONNREFUSED')) {
      return true
    }
  }

  return false
}

// Helper pour reconstruire l’URL de base depuis le frontend
function getWebBaseUrl(): string {
  // In Vite, we use import.meta.env.VITE_SOLANA_API_BASE_URL
  // Default monorepo setup exposes mint API on http://127.0.0.1:3001/api/mint/
  return import.meta.env.VITE_SOLANA_API_BASE_URL || 'http://127.0.0.1:3001';
}

// Mint NFT (Proof-of-Skill™)
export const mintProofOfSkill = async (
  wallet: any,
  metadata: ProofMetadata
): Promise<MintProofOfSkillResult> => {
  const shouldMockInitial = shouldMockMintRequests()

  if (shouldMockInitial) {
    return buildMockMintResult()
  }

  try {
    if (!wallet || !wallet.publicKey) {
      return { success: false, error: 'WALLET_NOT_CONNECTED' }
    }

    const recipient = wallet.publicKey.toBase58()
    const symbol = 'MFAI' // Hardcoded for now, or env var
    const baseUrl = getWebBaseUrl()

    // Ici tu peux soit :
    //  - pointer vers une route dynamique Next qui renvoie le JSON de metadata
    //  - soit vers un bucket (Arweave / IPFS) : NEXT_PUBLIC_NFT_BASE_URI
    // For MVP we use a placeholder or dynamic route if implemented
    const baseUri = `${baseUrl}/api/metadata/proof-of-skill`

    const uri = `${baseUri}?name=${encodeURIComponent(
      metadata.name
    )}&description=${encodeURIComponent(metadata.description)}&image=${encodeURIComponent(metadata.image)}&wallet=${encodeURIComponent(recipient)}`

    // 1. simulate
    const simRes = await fetch(`${baseUrl}/api/mint/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient,
        name: metadata.name,
        symbol,
        uri,
      }),
    })

    if (!simRes.ok) {
      const txt = await simRes.text().catch(() => '')
      return {
        success: false,
        error: `SIMULATE_FAILED_HTTP_${simRes.status}: ${txt}`,
      }
    }

    const simJson: { ok: boolean; sim?: any; error?: string } =
      await simRes.json().catch(() => ({ ok: false }))
    if (!simJson.ok || !simJson.sim?.ok) {
      return {
        success: false,
        error: simJson.error || 'SIMULATE_FAILED_LOGIC',
      }
    }

    const sim = simJson.sim

    // 2. execute
    const execRes = await fetch(`${baseUrl}/api/mint/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': recipient // Simple tracking
      },
      body: JSON.stringify({
        spec: {
          recipient,
          type: 'CERT_NFT',
          name: metadata.name,
          symbol,
          uri,
        },
        sim,
      }),
    })

    if (!execRes.ok) {
      const txt = await execRes.text().catch(() => '')
      return {
        success: false,
        error: `EXECUTE_FAILED_HTTP_${execRes.status}: ${txt}`,
      }
    }

    const execJson: {
      ok: boolean
      tx?: { txSig?: string; mintAddress?: string }
      jobId?: string
      status?: string
      error?: string
    } = await execRes.json().catch(() => ({ ok: false }))

    if (!execJson.ok) {
      return {
        success: false,
        error: execJson.error || 'EXECUTE_FAILED_LOGIC',
      }
    }

    if (execJson.jobId) {
      // Queued mode
      return {
        success: true,
        mintAddress: 'QUEUED_JOB_' + execJson.jobId, // Placeholder, UI should handle this
        signature: 'QUEUED',
      }
    }

    if (!execJson.tx?.txSig || !execJson.tx.mintAddress) {
      return {
        success: false,
        error: 'EXECUTE_FAILED_NO_TX_DATA',
      }
    }

    return {
      success: true,
      mintAddress: execJson.tx.mintAddress,
      signature: execJson.tx.txSig,
    }
  } catch (e: any) {
    console.warn('mintProofOfSkill falling back to mock response', e)

    if (shouldMockMintRequests(e)) {
      return buildMockMintResult()
    }

    return {
      success: false,
      error: e?.message || 'UNKNOWN_ERROR',
    }
  }
}

// Stake $MFAI tokens
export const stakeMFAI = async (
  wallet: any,
  amount: number
): Promise<{ success: boolean; signature?: string; error?: string }> => {
  try {
    const { publicKey } = wallet || {};

    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // For simulation purposes, we'll log the intended stake amount and return a success response
    logger.debug(`Simulated staking of ${amount} $MFAI for wallet ${publicKey.toBase58()}`);
    return {
      success: true,
      signature: 'simulated_stake_' + Date.now()
    };
  } catch (error) {
    console.error('Error staking MFAI:', error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message
    };
  }
};

// Submit DAO vote
export const submitDAOVote = async (
  wallet: any,
  proposalId: string,
  vote: 'approve' | 'reject'
): Promise<{ success: boolean; signature?: string; proposalId?: string; vote?: 'approve' | 'reject'; error?: string }> => {
  try {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    // For simulation purposes, we'll just return a success response
    return {
      success: true,
      signature: 'simulated_vote_' + Date.now(),
      proposalId,
      vote
    };
  } catch (error) {
    console.error('Error submitting DAO vote:', error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message
    };
  }
};

// Get NFTs owned by wallet
export const getWalletNFTs = async (publicKey: PublicKey): Promise<any[]> => {
  try {
    logger.debug('Simulating NFT fetch for wallet', publicKey.toBase58());
    // In a real implementation, we would:
    // 1. Query the Solana blockchain for token accounts owned by the wallet
    // 2. Filter for NFTs (tokens with supply of 1)
    // 3. Fetch metadata for each NFT

    // For simulation purposes, we'll just return an empty array
    return [];
  } catch (error) {
    console.error('Error getting wallet NFTs:', error);
    throw error;
  }
};

// Verify transaction
export const verifyTransaction = async (signature: string): Promise<boolean> => {
  try {
    const connection = getConnection();
    const transaction = await connection.getTransaction(signature);
    return transaction !== null;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};

// Get transaction details
export const getTransactionDetails = async (signature: string): Promise<any> => {
  try {
    const connection = getConnection();
    const transaction = await connection.getTransaction(signature);
    return transaction;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
};

import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

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

// Mint NFT (Proof-of-Skill™)
export const mintProofOfSkill = async (
  wallet: any,
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  }
): Promise<{ success: boolean; signature?: string; mintAddress?: string; error?: string }> => {
  try {
    const { publicKey } = wallet || {};

    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const apiBaseUrl = import.meta.env.VITE_SOLANA_API_BASE_URL || 'http://localhost:3000';

    // 1. Simulate Mint (Prepare)
    const simResponse = await fetch(`${apiBaseUrl}/api/mint/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: publicKey.toBase58(),
        name: metadata.name,
        uri: 'https://example.com/placeholder-metadata.json' // In real app, upload metadata to Arweave/IPFS first
      })
    });

    if (!simResponse.ok) {
      throw new Error(`Simulation failed: ${simResponse.statusText}`);
    }

    const simData = await simResponse.json();
    if (!simData.ok) {
      throw new Error(simData.error || 'Simulation returned error');
    }

    // 2. Execute Mint (Sign & Send on Server)
    const execResponse = await fetch(`${apiBaseUrl}/api/mint/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': publicKey.toBase58() // Simple tracking for now
      },
      body: JSON.stringify({
        sim: simData
      })
    });

    if (!execResponse.ok) {
      const errText = await execResponse.text();
      throw new Error(`Execution failed: ${errText}`);
    }

    const execData = await execResponse.json();

    if (!execData.ok) {
      throw new Error(execData.error || 'Execution returned error');
    }

    return {
      success: true,
      signature: execData.tx.txSig,
      mintAddress: 'pending_on_chain', // We'd get this from the tx logs in a full implementation
    };

  } catch (error) {
    console.error('Error minting NFT:', error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message
    };
  }
};

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
    console.debug(`Simulated staking of ${amount} $MFAI for wallet ${publicKey.toBase58()}`);
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
    console.debug('Simulating NFT fetch for wallet', publicKey.toBase58());
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

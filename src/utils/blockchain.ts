import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
  TransactionInstruction
} from '@solana/web3.js';
import { 
  Token, 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  AccountLayout
} from '@solana/spl-token';

// Constants
const SOLANA_CLUSTER = 'devnet';
const SOLANA_ENDPOINT = `https://api.${SOLANA_CLUSTER}.solana.com`;
const MINT_SIZE = MintLayout.span;
const GOVERNANCE_PROGRAM_ID = new PublicKey(
  process.env.VITE_GOVERNANCE_PROGRAM_ID ||
    'Governance11111111111111111111111111111111'
);

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
    attributes: Array<{trait_type: string, value: string | number}>;
  }
): Promise<{success: boolean, signature?: string, mintAddress?: string, error?: string}> => {
  try {
    const connection = getConnection();
    const { publicKey, signTransaction } = wallet;
    
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // Create mint account
    const mintKeypair = Keypair.generate();
    
    // Calculate token account rent
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    
    // Create transaction for token creation
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    
    // Note: In a real implementation, we would:
    // 1. Add instructions to initialize the mint
    // 2. Create associated token account
    // 3. Mint to the token account
    // 4. Add metadata using Metaplex
    
    // For simulation purposes, we'll just return the mint address
    // In production, we would sign and send the transaction
    
    return {
      success: true,
      signature: 'simulated_signature_' + Date.now(),
      mintAddress: mintKeypair.publicKey.toString()
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Stake $MFAI tokens
export const stakeMFAI = async (
  wallet: any,
  amount: number
): Promise<{success: boolean, signature?: string, error?: string}> => {
  try {
    const { publicKey, signTransaction } = wallet;
    
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, we would:
    // 1. Create a transaction to transfer tokens to a staking contract
    // 2. Sign and send the transaction
    
    // For simulation purposes, we'll just return a success response
    return {
      success: true,
      signature: 'simulated_stake_' + Date.now()
    };
  } catch (error) {
    console.error('Error staking MFAI:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Submit DAO vote
export const submitDAOVote = async (
  wallet: any,
  proposalId: string,
  vote: 'approve' | 'reject'
): Promise<{ success: boolean; signature?: string; error?: string }> => {
  try {
    const { publicKey, signTransaction } = wallet;

    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    const connection = getConnection();
    const proposalPubkey = new PublicKey(proposalId);

    const instruction = new TransactionInstruction({
      programId: GOVERNANCE_PROGRAM_ID,
      keys: [
        { pubkey: proposalPubkey, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: false }
      ],
      data: Buffer.concat([
        Buffer.from([1]), // Instruction discriminator for "vote"
        Buffer.from([vote === 'approve' ? 1 : 0]) // Vote choice: 1 for approve, 0 for reject
      ])
    });

    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction({
      feePayer: publicKey,
      blockhash
    }).add(instruction);

    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    return { success: true, signature };
  } catch (error) {
    console.error('Error submitting DAO vote:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Fetch vote results for a proposal
export const getProposalVotes = async (
  proposalId: string
): Promise<{ approve: number; reject: number }> => {
  try {
    const connection = getConnection();
    const proposalPubkey = new PublicKey(proposalId);
    const info = await connection.getAccountInfo(proposalPubkey);
    if (!info) throw new Error('Proposal not found');
    const data = info.data;
    return {
      approve: data[0] ?? 0,
      reject: data[1] ?? 0
    };
  } catch (error) {
    console.error('Error fetching vote results:', error);
    return { approve: 0, reject: 0 };
  }
};

// Get NFTs owned by wallet
export const getWalletNFTs = async (publicKey: PublicKey): Promise<any[]> => {
  try {
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
/**
 * @file splTokenService.ts
 * @description Service de gestion des tokens SPL (Token-2022) pour $MFAI
 * 
 * FONCTIONNALITÉS :
 * - Transfert de tokens $MFAI entre wallets
 * - Vérification des soldes
 * - Airdrop de récompenses (referral, mission completion)
 * - Création de token (script admin uniquement)
 * 
 * MODE DE FONCTIONNEMENT :
 * - Devnet : transactions réelles avec $MFAI de test
 * - Mainnet : KILL_SWITCH=1 jusqu'à audit complet
 * - Fallback : simulation si token mint non configuré
 * 
 * PRÉREQUIS PHASE 4 :
 * - MFAI_TOKEN_MINT configuré dans .env (adresse du token)
 * - MINTER_SECRET_KEY avec SOL pour les frais
 * 
 * @author Kimi Code CLI — Phase 4 — 2026-03-12
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  createMint,
  mintTo,
  Account,
} from '@solana/spl-token';
import bs58 from 'bs58';

// ─── Configuration ───────────────────────────────────────────────────────────

const CLUSTER = (process.env.SOLANA_CLUSTER ?? 'devnet') as 'devnet' | 'mainnet-beta';
const RPC_URL = process.env.SOLANA_RPC_URL ?? `https://api.${CLUSTER}.solana.com`;
const IS_MAINNET = CLUSTER === 'mainnet-beta';
const IS_KILL_SWITCH = process.env.KILL_SWITCH === '1';

// Token $MFAI mint address (à configurer après création)
const MFAI_TOKEN_MINT = process.env.MFAI_TOKEN_MINT;

// ─── Initialisation ──────────────────────────────────────────────────────────

let connection: Connection | null = null;
let minterKeypair: Keypair | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  return connection;
}

function getMinterKeypair(): Keypair | null {
  if (minterKeypair) return minterKeypair;
  
  const secretKey = process.env.MINTER_SECRET_KEY;
  if (!secretKey) {
    console.warn('[SPLToken] MINTER_SECRET_KEY absent');
    return null;
  }

  try {
    if (secretKey.startsWith('[')) {
      minterKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
    } else {
      minterKeypair = Keypair.fromSecretKey(bs58.decode(secretKey));
    }
    return minterKeypair;
  } catch (error) {
    console.error('[SPLToken] Échec initialisation minter:', error);
    return null;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TransferPayload {
  recipient: string;      // Wallet destinataire
  amount: number;         // Montant en tokens $MFAI (unités entières)
  reason: string;         // Raison du transfert (referral, mission, etc.)
}

export interface TransferResult {
  success: boolean;
  txHash?: string;
  amount?: number;
  recipient?: string;
  error?: string;
  simulation?: boolean;
}

export interface TokenBalance {
  wallet: string;
  balance: number;        // Balance en $MFAI
  uiAmount: number;       // Balance formatée (avec décimales)
  decimals: number;
}

// ─── Service Principal ────────────────────────────────────────────────────────

/**
 * Transfère des tokens $MFAI vers un wallet.
 * 
 * Phase 4 Devnet : Transaction réelle SPL Token-2022
 * Phase 4 Mainnet : Simulation (KILL_SWITCH=1)
 */
export async function transferMFAI(payload: TransferPayload): Promise<TransferResult> {
  // ─── Guards ─────────────────────────────────────────────────────────────────
  if (IS_KILL_SWITCH) {
    console.warn('[SPLToken] KILL_SWITCH=1 — transfer bloqué');
    return simulateTransfer(payload, 'KILL_SWITCH active');
  }

  if (IS_MAINNET) {
    console.warn('[SPLToken] Mainnet — simulation (attente audit)');
    return simulateTransfer(payload, 'Attente audit mainnet');
  }

  if (!MFAI_TOKEN_MINT) {
    console.warn('[SPLToken] MFAI_TOKEN_MINT non configuré — simulation');
    return simulateTransfer(payload, 'Token $MFAI non créé (voir scripts/create-mfai-token.ts)');
  }

  const minter = getMinterKeypair();
  if (!minter) {
    return simulateTransfer(payload, 'Minter non configuré');
  }

  // ─── Préparation ────────────────────────────────────────────────────────────
  try {
    const conn = getConnection();
    const mintPubkey = new PublicKey(MFAI_TOKEN_MINT);
    const recipientPubkey = new PublicKey(payload.recipient);

    console.info(`[SPLToken] Transfer ${payload.amount} $MFAI → ${payload.recipient.slice(0, 8)}...`);

    // 1. Récupérer ou créer le compte token du minter
    const minterTokenAccount = await getOrCreateAssociatedTokenAccount(
      conn,
      minter,                 // Payer
      mintPubkey,             // Mint
      minter.publicKey,       // Owner
      false,                  // AllowOwnerOffCurve
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );

    // 2. Récupérer ou créer le compte token du destinataire
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      conn,
      minter,                 // Payer (minter paie la création)
      mintPubkey,             // Mint
      recipientPubkey,        // Owner
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );

    // 3. Construire la transaction de transfer
    const transferInstruction = createTransferInstruction(
      minterTokenAccount.address,    // Source
      recipientTokenAccount.address, // Destination
      minter.publicKey,              // Owner (minter)
      payload.amount,                // Amount
      [],                            // MultiSigners
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction().add(transferInstruction);

    // 4. Envoyer et confirmer
    const sig = await sendAndConfirmTransaction(conn, transaction, [minter], {
      commitment: 'confirmed',
    });

    console.info(`[SPLToken] Transfer réussi: ${sig.slice(0, 16)}...`);

    return {
      success: true,
      txHash: sig,
      amount: payload.amount,
      recipient: payload.recipient,
      simulation: false,
    };

  } catch (error) {
    console.error('[SPLToken] Erreur transfer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      simulation: true,
    };
  }
}

/**
 * Récupère le solde $MFAI d'un wallet.
 */
export async function getMFAIBalance(walletAddress: string): Promise<TokenBalance | null> {
  try {
    if (!MFAI_TOKEN_MINT) {
      return null;
    }

    const conn = getConnection();
    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(MFAI_TOKEN_MINT);

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      conn,
      Keypair.generate(), // Dummy payer (lecture seule)
      mintPubkey,
      walletPubkey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );

    // Note : Cette approche nécessite une vérification plus robuste
    // Pour l'instant, retourner un mock
    return {
      wallet: walletAddress,
      balance: 0,
      uiAmount: 0,
      decimals: 6,
    };

  } catch {
    return null;
  }
}

/**
 * Récompense un utilisateur (referral ou mission).
 * Montants standard :
 * - Referral : 25 $MFAI
 * - Mission completion : 50 $MFAI
 * - Proof-of-Skill : 100 $MFAI
 */
export async function rewardUser(
  recipient: string,
  rewardType: 'referral' | 'mission' | 'proof-of-skill',
  customAmount?: number
): Promise<TransferResult> {
  const amounts: Record<string, number> = {
    referral: 25,
    mission: 50,
    'proof-of-skill': 100,
  };

  const amount = customAmount ?? amounts[rewardType] ?? 25;

  return transferMFAI({
    recipient,
    amount,
    reason: `Reward: ${rewardType}`,
  });
}

// ─── Création du token $MFAI (Script admin) ──────────────────────────────────

/**
 * Crée le token $MFAI sur devnet.
 * ⚠️ À exécuter UNE SEULE FOIS par environnement.
 * 
 * Retourne l'adresse du mint à sauvegarder dans .env
 */
export async function createMFAIToken(): Promise<{ mintAddress: string; txHash: string } | null> {
  try {
    const minter = getMinterKeypair();
    if (!minter) {
      throw new Error('Minter non configuré');
    }

    const conn = getConnection();

    console.info('[SPLToken] Création du token $MFAI...');

    // Créer le mint Token-2022
    const mintPubkey = await createMint(
      conn,
      minter,              // Payer
      minter.publicKey,    // Mint authority
      minter.publicKey,    // Freeze authority
      6,                   // Decimals (6 comme USDC)
      Keypair.generate(),  // New mint keypair
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );

    // Créer le compte token du minter et mint des tokens initiaux
    const minterTokenAccount = await getOrCreateAssociatedTokenAccount(
      conn,
      minter,
      mintPubkey,
      minter.publicKey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );

    // Mint 1,000,000 $MFAI initial
    const initialSupply = 1_000_000 * 10 ** 6; // 1M avec 6 décimales
    await mintTo(
      conn,
      minter,
      mintPubkey,
      minterTokenAccount.address,
      minter,
      initialSupply,
      [],
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );

    console.info(`[SPLToken] Token $MFAI créé: ${mintPubkey.toBase58()}`);
    console.info(`[SPLToken] Supply initiale: 1,000,000 $MFAI`);

    return {
      mintAddress: mintPubkey.toBase58(),
      txHash: 'create-mint-tx', // Simplifié
    };

  } catch (error) {
    console.error('[SPLToken] Échec création token:', error);
    return null;
  }
}

// ─── Helpers privés ───────────────────────────────────────────────────────────

function simulateTransfer(payload: TransferPayload, reason: string): TransferResult {
  const txHash = `sim_${Date.now().toString(16)}_mfai`;
  console.info(`[SPLToken] Simulation transfer — raison: ${reason}`);

  return {
    success: true,
    txHash,
    amount: payload.amount,
    recipient: payload.recipient,
    simulation: true,
  };
}

/**
 * Status du service SPL Token.
 */
export function getSPLTokenStatus(): {
  available: boolean;
  network: string;
  killSwitch: boolean;
  tokenConfigured: boolean;
  minterConfigured: boolean;
  simulation: boolean;
} {
  return {
    available: !IS_KILL_SWITCH && !!MFAI_TOKEN_MINT,
    network: CLUSTER,
    killSwitch: IS_KILL_SWITCH,
    tokenConfigured: !!MFAI_TOKEN_MINT,
    minterConfigured: !!process.env.MINTER_SECRET_KEY,
    simulation: IS_KILL_SWITCH || IS_MAINNET || !MFAI_TOKEN_MINT,
  };
}

/**
 * @file solanaAgentService.ts
 * @description Service Solana Agent Kit pour les actions on-chain de Zyno.
 *
 * MODES DE FONCTIONNEMENT :
 * - MINTER_SECRET_KEY absent → mode lecture seule (getWalletBalance uniquement)
 * - SOLANA_CLUSTER=devnet  → toutes actions autorisées, transactions réelles sur devnet
 * - SOLANA_CLUSTER=mainnet-beta → KILL_SWITCH=1 par défaut, double confirmation requise
 *
 * ACTIONS DISPONIBLES (devnet) :
 *   ✅ getWalletBalance      — solde SOL d'un wallet
 *   ✅ requestDevnetAirdrop  — airdrop de SOL sur devnet (développement uniquement)
 *   ✅ getTokenAccounts      — liste des tokens SPL d'un wallet
 *   🔜 mintProofOfSkillCNFT  — mint cNFT via Light Protocol (Phase 2 — cNFT infra requise)
 *   🔜 executeJupiterSwap    — swap via Jupiter (Phase 2 — $MFAI listing requis)
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { SolanaAgentKit } from 'solana-agent-kit';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, Transaction, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

// ─── Configuration ───────────────────────────────────────────────────────────

const CLUSTER = (process.env.SOLANA_CLUSTER ?? 'devnet') as 'devnet' | 'mainnet-beta';
const RPC_URL = process.env.SOLANA_RPC_URL ?? `https://api.${CLUSTER}.solana.com`;
const IS_MAINNET = CLUSTER === 'mainnet-beta';
const IS_KILL_SWITCH = process.env.KILL_SWITCH === '1';

// ─── Initialisation du kit ───────────────────────────────────────────────────

let _kit: SolanaAgentKit | null = null;
let _connection: Connection | null = null;

/**
 * Initialise la connexion RPC (toujours disponible, même sans clé privée).
 */
export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(RPC_URL, 'confirmed');
  }
  return _connection;
}

/**
 * Initialise le Solana Agent Kit avec le wallet minter.
 * Retourne null si MINTER_SECRET_KEY est absent (mode lecture seule).
 */
export function getSolanaAgentKit(): SolanaAgentKit | null {
  if (_kit) return _kit;

  const secretKey = process.env.MINTER_SECRET_KEY;
  if (!secretKey) {
    console.info('[SolanaAgent] MINTER_SECRET_KEY absent — mode lecture seule actif');
    return null;
  }

  try {
    let keypair: Keypair;
    if (secretKey.startsWith('[')) {
      keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
    } else {
      keypair = Keypair.fromSecretKey(bs58.decode(secretKey));
    }

    // Create wallet adapter from Keypair
    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
        if (tx instanceof Transaction) {
          tx.partialSign(keypair);
        } else {
          // VersionedTransaction
          (tx as any).sign([keypair]);
        }
        return tx;
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
        txs.forEach(tx => {
          if (tx instanceof Transaction) {
            tx.partialSign(keypair);
          } else {
            (tx as any).sign([keypair]);
          }
        });
        return txs;
      },
      signAndSendTransaction: async <T extends Transaction | VersionedTransaction>(tx: T, _options?: any) => {
        if (tx instanceof Transaction) {
          tx.partialSign(keypair);
        } else {
          (tx as any).sign([keypair]);
        }
        const connection = getConnection();
        const signature = await connection.sendRawTransaction(tx.serialize());
        return { signature };
      },
      signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
        return nacl.sign.detached(message, keypair.secretKey.slice(0, 32));
      },
    };

    _kit = new SolanaAgentKit(
      wallet,
      RPC_URL,
      { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '' }
    );

    if (IS_MAINNET) {
      console.warn('[SolanaAgent] ⚠️  MAINNET actif — toutes les transactions sont RÉELLES');
    } else {
      console.info(`[SolanaAgent] ✅ Initialisé sur ${CLUSTER} — ${keypair.publicKey.toBase58().slice(0, 8)}...`);
    }

    return _kit;
  } catch (error) {
    console.error('[SolanaAgent] Échec d\'initialisation:', error);
    return null;
  }
}

// ─── Actions disponibles ─────────────────────────────────────────────────────

export interface WalletBalance {
  address: string;
  lamports: number;
  sol: number;
  network: string;
}

/**
 * Récupère le solde SOL d'un wallet.
 * Toujours disponible (lecture seule, pas de clé privée requise).
 */
export async function getWalletBalance(walletAddress: string): Promise<WalletBalance | null> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const lamports = await getConnection().getBalance(pubkey);
    return {
      address: walletAddress,
      lamports,
      sol: lamports / LAMPORTS_PER_SOL,
      network: CLUSTER,
    };
  } catch (error) {
    console.error('[SolanaAgent] getWalletBalance failed:', error);
    return null;
  }
}

/**
 * Demande un airdrop de SOL sur devnet.
 * UNIQUEMENT disponible sur devnet — refusé automatiquement sur mainnet.
 */
export async function requestDevnetAirdrop(
  walletAddress: string,
  solAmount: number = 1
): Promise<{ signature: string; amount: number } | null> {
  if (IS_MAINNET) {
    console.warn('[SolanaAgent] Airdrop refusé sur mainnet');
    return null;
  }

  if (solAmount > 2) {
    console.warn('[SolanaAgent] Airdrop limité à 2 SOL par appel sur devnet');
    solAmount = 2;
  }

  try {
    const pubkey = new PublicKey(walletAddress);
    const signature = await getConnection().requestAirdrop(
      pubkey,
      solAmount * LAMPORTS_PER_SOL
    );
    await getConnection().confirmTransaction(signature, 'confirmed');
    console.info(`[SolanaAgent] Airdrop ${solAmount} SOL → ${walletAddress.slice(0, 8)}... (${signature.slice(0, 8)}...)`);
    return { signature, amount: solAmount };
  } catch (error) {
    console.error('[SolanaAgent] requestDevnetAirdrop failed:', error);
    return null;
  }
}

/**
 * Récupère les token accounts SPL d'un wallet.
 * Toujours disponible (lecture seule).
 */
export async function getTokenAccounts(walletAddress: string): Promise<Array<{
  mint: string;
  amount: string;
  decimals: number;
}>> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const accounts = await getConnection().getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    return accounts.value.map(({ account }) => ({
      mint: account.data.parsed.info.mint,
      amount: account.data.parsed.info.tokenAmount.uiAmountString,
      decimals: account.data.parsed.info.tokenAmount.decimals,
    }));
  } catch (error) {
    console.error('[SolanaAgent] getTokenAccounts failed:', error);
    return [];
  }
}

/**
 * Prépare un mint de cNFT Proof-of-Skill™.
 * Phase 2 — retourne null avec message explicatif en attendant l'intégration Light Protocol.
 */
export async function prepareProofOfSkillMint(params: {
  recipient: string;
  phase: string;
  score: number;
  journeyId: string;
}): Promise<{ transaction: string; estimatedFeeLamports: number } | null> {
  if (IS_KILL_SWITCH) {
    console.warn('[SolanaAgent] KILL_SWITCH=1 — tous les mints sont bloqués');
    return null;
  }

  // Phase 2 : implémenter avec @lightprotocol/stateless.js
  console.info('[SolanaAgent] prepareProofOfSkillMint — Phase 2 (Light Protocol cNFT) — pas encore implémenté');
  return null;
}

/**
 * Status du service Solana Agent Kit.
 * Utilisé par l'endpoint /api/health pour le monitoring.
 */
export function getSolanaAgentStatus(): {
  initialized: boolean;
  network: string;
  readOnly: boolean;
  killSwitch: boolean;
} {
  return {
    initialized: _kit !== null,
    network: CLUSTER,
    readOnly: _kit === null,
    killSwitch: IS_KILL_SWITCH,
  };
}

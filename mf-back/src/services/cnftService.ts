/**
 * @file cnftService.ts
 * @description Service de minting cNFT (compressed NFT) via Light Protocol stateless.js.
 * Les cNFTs permettent de minter des NFT à coût quasi-nul sur Solana grâce à ZK Compression.
 *
 * MODE FAIL-SAFE :
 * - Si LIGHT_PROTOCOL_ENABLED=false ou clés manquantes → retourne simulation
 * - Devnet uniquement jusqu'à audit mainnet
 * - KILL_SWITCH bloque tous les mints
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import bs58 from 'bs58';

// Light Protocol - stateless.js (ZK Compression)
let lightModule: any = null;
try {
  lightModule = require('@lightprotocol/stateless.js');
} catch {
  console.warn('[cNFT] @lightprotocol/stateless.js non installé — mode simulation');
}

const CLUSTER = process.env.SOLANA_CLUSTER ?? 'devnet';
const RPC_URL = process.env.SOLANA_RPC_URL ?? `https://api.${CLUSTER}.solana.com`;
const IS_MAINNET = CLUSTER === 'mainnet-beta';
const IS_ENABLED = process.env.LIGHT_PROTOCOL_ENABLED === 'true' && !IS_MAINNET;
const IS_KILL_SWITCH = process.env.KILL_SWITCH === '1';

let connection: Connection | null = null;
let payerKeypair: Keypair | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  return connection;
}

function getPayer(): Keypair | null {
  if (payerKeypair) return payerKeypair;
  
  const secretKey = process.env.MINTER_SECRET_KEY;
  if (!secretKey) return null;
  
  try {
    if (secretKey.startsWith('[')) {
      payerKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
    } else {
      payerKeypair = Keypair.fromSecretKey(bs58.decode(secretKey));
    }
    return payerKeypair;
  } catch {
    return null;
  }
}

export interface CNFTMetadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints?: number;
}

export interface MintResult {
  success: boolean;
  signature?: string;
  mintAddress?: string;
  error?: string;
  simulation?: boolean;
}

/**
 * Mint un cNFT Proof-of-Skill™ sur Solana.
 * 
 * Phase 1 (actuelle) : Simulation — retourne adresse simulée
 * Phase 2 : Vrai mint via Light Protocol stateless.js
 */
export async function mintProofOfSkillCNFT(params: {
  recipient: string;
  phase: string;
  score: number;
  journeyId: string;
  metadata?: CNFTMetadata;
}): Promise<MintResult> {
  const { recipient, phase, score, journeyId, metadata } = params;

  // Vérifications sécurité
  if (IS_KILL_SWITCH) {
    return { success: false, error: 'KILL_SWITCH active — tous les mints bloqués' };
  }

  if (IS_MAINNET) {
    return { success: false, error: 'Mainnet non activé — attente audit Phase 3' };
  }

  if (!IS_ENABLED || !lightModule) {
    // Mode simulation Phase 1
    console.info(`[cNFT] Simulation mint pour ${recipient.slice(0, 8)}... (Phase 1)`);
    return {
      success: true,
      simulation: true,
      mintAddress: `SIM_${phase}_${Date.now()}`,
      signature: `sim_${Math.random().toString(36).substring(7)}`,
    };
  }

  const payer = getPayer();
  if (!payer) {
    return { success: false, error: 'MINTER_SECRET_KEY non configuré' };
  }

  try {
    // TODO: Phase 2 — Implémentation réelle avec stateless.js
    // const { createMint, mintTo } = lightModule;
    // const compressedNFT = await createMint(...)
    
    console.info(`[cNFT] Mint réel désactivé en Phase 1 — ${recipient.slice(0, 8)}...`);
    return {
      success: true,
      simulation: true,
      mintAddress: `PHASE2_${phase}_${Date.now()}`,
      signature: `pending_${Math.random().toString(36).substring(7)}`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[cNFT] Mint failed:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Crée les métadonnées JSON pour un cNFT Proof-of-Skill™.
 * Compatible avec le standard Metaplex + extensions MFAI.
 */
export function buildProofOfSkillMetadata(params: {
  phase: string;
  score: number;
  journeyId: string;
  userAddress: string;
}): CNFTMetadata {
  const { phase, score, journeyId, userAddress } = params;
  
  const level = score >= 90 ? 'Elite' : score >= 75 ? 'Advanced' : score >= 60 ? 'Intermediate' : 'Starter';
  
  return {
    name: `MFAI Proof-of-Skill™ — ${phase}`,
    symbol: 'MFAI-PoS',
    uri: `https://metadata.mfai.app/pos/${journeyId}/${phase}.json`,
    sellerFeeBasisPoints: 0, // Pas de royalties sur les certifications
  };
}

/**
 * Vérifie le statut du service cNFT.
 */
export function getCNFTStatus(): {
  enabled: boolean;
  network: string;
  lightProtocolInstalled: boolean;
  payerConfigured: boolean;
  killSwitch: boolean;
} {
  return {
    enabled: IS_ENABLED,
    network: CLUSTER,
    lightProtocolInstalled: !!lightModule,
    payerConfigured: !!getPayer(),
    killSwitch: IS_KILL_SWITCH,
  };
}

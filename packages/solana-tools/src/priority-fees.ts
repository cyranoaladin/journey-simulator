/**
 * @file priority-fees.ts
 * @description Calcul dynamique des priority fees Solana pour garantir l'inclusion
 * des transactions même en période de congestion réseau.
 * @author Kimi Code CLI — 2026-03-11
 */

import { Connection, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';

/** Percentile utilisé pour le calcul des fees (75 = bon équilibre coût/vitesse) */
const FEE_PERCENTILE = 0.75;

/** Fee minimum en microlamports pour les transactions non urgentes */
const MIN_FEE_MICROLAMPORTS = 1_000;

/** Fee minimum pour les transactions de mint (priorité haute) */
const MIN_MINT_FEE_MICROLAMPORTS = 10_000;

/** Compute units alloués par défaut pour les transactions de mint */
const DEFAULT_MINT_COMPUTE_UNITS = 200_000;

export interface PriorityFeeConfig {
  /** Urgence de la transaction : 'low' | 'normal' | 'high' */
  urgency?: 'low' | 'normal' | 'high';
  /** Surcharge maximale acceptable en microlamports */
  maxMicroLamports?: number;
}

/**
 * Récupère les fees de priorité récents et calcule le percentile recommandé.
 * Fournit un fallback sécurisé si l'appel RPC échoue.
 */
export async function getOptimalPriorityFee(
  connection: Connection,
  config: PriorityFeeConfig = {}
): Promise<number> {
  const { urgency = 'normal', maxMicroLamports = 1_000_000 } = config;

  try {
    const recentFees = await connection.getRecentPrioritizationFees();

    if (!recentFees || recentFees.length === 0) {
      console.warn('[PriorityFees] Aucune donnée de fee récente — utilisation du minimum');
      return urgency === 'high' ? MIN_MINT_FEE_MICROLAMPORTS : MIN_FEE_MICROLAMPORTS;
    }

    const sorted = recentFees
      .map(f => f.prioritizationFee)
      .sort((a, b) => a - b);

    const percentileMultiplier = urgency === 'high' ? 0.90 : urgency === 'low' ? 0.50 : FEE_PERCENTILE;
    const idx = Math.floor(sorted.length * percentileMultiplier);
    const fee = sorted[idx] ?? sorted[sorted.length - 1];

    const minFee = urgency === 'high' ? MIN_MINT_FEE_MICROLAMPORTS : MIN_FEE_MICROLAMPORTS;
    const optimalFee = Math.max(fee, minFee);

    return Math.min(optimalFee, maxMicroLamports);
  } catch (error) {
    console.error('[PriorityFees] Erreur lors de la récupération des fees:', error);
    return urgency === 'high' ? MIN_MINT_FEE_MICROLAMPORTS : MIN_FEE_MICROLAMPORTS;
  }
}

/**
 * Construit les instructions ComputeBudget à ajouter en tête de transaction.
 * Doit être ajouté comme PREMIÈRES instructions de chaque transaction.
 */
export async function buildPriorityFeeInstructions(
  connection: Connection,
  config: PriorityFeeConfig & { computeUnits?: number } = {}
): Promise<TransactionInstruction[]> {
  const { computeUnits = DEFAULT_MINT_COMPUTE_UNITS, ...feeConfig } = config;
  const microLamports = await getOptimalPriorityFee(connection, feeConfig);

  return [
    ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
  ];
}

/**
 * Attend un nombre de millisecondes.
 * Utilitaire pour les retries avec backoff.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  fee?: number;
}

/**
 * Envoie une transaction avec priority fee et retry logic.
 * @param connection - Connexion Solana
 * @param transaction - Transaction à envoyer (sera modifiée avec priority fees)
 * @param signers - Signataires de la transaction
 * @param priorityConfig - Configuration des priority fees
 * @param maxRetries - Nombre maximum de tentatives
 */
export async function sendTransactionWithPriority(
  connection: Connection,
  transaction: any,
  signers: any[],
  priorityConfig: PriorityFeeConfig = { urgency: 'high' },
  maxRetries: number = 3
): Promise<TransactionResult> {
  const { urgency = 'high', maxMicroLamports = 1_000_000 } = priorityConfig;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Récupérer le fee optimal à chaque tentative (le réseau peut changer)
      const microLamports = await getOptimalPriorityFee(connection, {
        urgency,
        maxMicroLamports: maxMicroLamports * attempt // Augmenter le max à chaque retry
      });

      // Ajouter les instructions ComputeBudget
      const priorityInstructions = await buildPriorityFeeInstructions(connection, {
        urgency,
        computeUnits: DEFAULT_MINT_COMPUTE_UNITS,
        maxMicroLamports
      });

      // Les instructions doivent être ajoutées en première position
      transaction.add(...priorityInstructions);

      const signature = await connection.sendTransaction(transaction, signers, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 1 // Retry au niveau RPC
      });

      // Confirmer la transaction
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      return {
        success: true,
        signature,
        fee: microLamports
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[PriorityFees] Attempt ${attempt}/${maxRetries} failed: ${errorMsg}`);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          error: errorMsg
        };
      }
      
      // Attendre avant retry avec backoff exponentiel
      await sleep(1000 * attempt);
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded'
  };
}

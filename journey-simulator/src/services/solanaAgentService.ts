/**
 * @file solanaAgentService.ts
 * @description Service pour interagir avec les agents Solana et le wallet
 */

import { getWalletBalance, getConnection } from '../utils/blockchain';
import { loadSolanaWeb3 } from '../utils/solanaWeb3';
import { tokenStore } from '../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002';

export interface WalletStats {
  balance: number;
  balanceInUSD: number;
  transactions: number;
  nfts: number;
  lastActivity: string;
}

export interface AEPOHistoryPoint {
  date: string;
  score: number;
  phase: string;
}

/**
 * Récupère le solde SOL d'un wallet
 */
export async function getWalletBalanceSOL(walletAddress: string): Promise<number> {
  try {
    const { PublicKey } = await loadSolanaWeb3();
    const pubKey = new PublicKey(walletAddress);
    const balance = await getWalletBalance(pubKey);
    return balance;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

/**
 * Récupère les statistiques complètes du wallet
 */
export async function getWalletStats(walletAddress: string): Promise<WalletStats> {
  try {
    const [balance, signatures] = await Promise.all([
      getWalletBalanceSOL(walletAddress),
      getRecentTransactions(walletAddress, 1),
    ]);

    // Prix SOL depuis CoinGecko API (public, fallback 150)
    let solPriceUSD = 150;
    try {
      const priceResp = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
        { signal: AbortSignal.timeout(3000) }
      );
      if (priceResp.ok) {
        const priceData = await priceResp.json();
        solPriceUSD = priceData?.solana?.usd ?? 150;
      }
    } catch {
      // fallback 150 conservé
    }
    
    return {
      balance,
      balanceInUSD: balance * solPriceUSD,
      transactions: signatures.length,
      nfts: 0, // Sera rempli par cnftService
      lastActivity: signatures[0]?.blockTime 
        ? new Date(signatures[0].blockTime * 1000).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    return {
      balance: 0,
      balanceInUSD: 0,
      transactions: 0,
      nfts: 0,
      lastActivity: new Date().toISOString(),
    };
  }
}

/**
 * Récupère l'historique AEPO d'un utilisateur
 */
export async function getAEPOHistory(userId?: string): Promise<AEPOHistoryPoint[]> {
  try {
    const token = tokenStore.getAccessToken();
    const response = await fetch(`${API_BASE}/api/user/aepo-history${userId ? `?userId=${userId}` : ''}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.history)) {
        return data.history;
      }
    }

    // Fallback: générer des données mockées déterministes
    return generateMockAEPOHistory(userId ? userId.length : 42);
  } catch (error) {
    return generateMockAEPOHistory(userId ? userId.length : 42);
  }
}

/**
 * Récupère les transactions récentes
 */
async function getRecentTransactions(walletAddress: string, limit: number = 10): Promise<any[]> {
  try {
    const connection = await getConnection();
    const { PublicKey } = await loadSolanaWeb3();
    const pubKey = new PublicKey(walletAddress);
    
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit });
    return signatures;
  } catch (error) {
    return [];
  }
}

/**
 * Génère un historique AEPO mocké déterministe (sans Math.random)
 * Utilisé uniquement en fallback quand le backend est inaccessible ou l'user non connecté.
 */
function generateMockAEPOHistory(seed: number = 42): AEPOHistoryPoint[] {
  const history: AEPOHistoryPoint[] = [];
  const phases = ['Learn', 'Build', 'Prove', 'Activate'];
  const base = 52 + (seed % 18);   // score de base déterministe : 52–69
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Progression linéaire déterministe — pas de Math.random
    const score = Math.min(100, Math.max(50, base + Math.floor((30 - i) * 0.45)));

    history.push({
      date: date.toISOString().split('T')[0],
      score,
      phase: phases[Math.min(Math.floor((30 - i) / 8), phases.length - 1)],
    });
  }

  return history;
}

/**
 * Vérifie si le réseau est accessible
 */
export async function checkNetworkHealth(_cluster: 'devnet' | 'mainnet' = 'devnet'): Promise<boolean> {
  try {
    const connection = await getConnection();
    const slot = await connection.getSlot();
    return slot > 0;
  } catch (error) {
    return false;
  }
}

export const solanaAgentService = {
  getWalletBalanceSOL,
  getWalletStats,
  getAEPOHistory,
  checkNetworkHealth,
};

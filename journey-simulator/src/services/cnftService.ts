/**
 * @file cnftService.ts
 * @description Service pour gérer les cNFTs (Proof-of-Skill™) MFAI
 */

import { getWalletNFTs, MintProofOfSkillResult } from '../utils/blockchain';
import { loadSolanaWeb3 } from '../utils/solanaWeb3';
import { tokenStore } from '../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002';

export interface ProofOfSkillNFT {
  mintAddress: string;
  name: string;
  description: string;
  image: string;
  phase: string;
  phaseNumber: number;
  score: number;
  walletAddress: string;
  createdAt: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

/**
 * Récupère les NFTs Proof-of-Skill d'un wallet
 */
export async function getProofOfSkillNFTs(walletAddress: string): Promise<ProofOfSkillNFT[]> {
  try {
    // Essayer d'abord l'API backend
    const token = tokenStore.getAccessToken();
    const response = await fetch(`${API_BASE}/api/cnft/wallet/${walletAddress}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.nfts)) {
        return data.nfts.map((nft: any) => ({
          mintAddress: nft.mintAddress || nft.mint,
          name: nft.name,
          description: nft.description,
          image: nft.image,
          phase: nft.phase || 'Unknown',
          phaseNumber: nft.phaseNumber || 0,
          score: nft.score || 0,
          walletAddress: nft.walletAddress || walletAddress,
          createdAt: nft.createdAt,
          attributes: nft.attributes || [],
        }));
      }
    }

    // Fallback: récupérer depuis la blockchain
    const { PublicKey } = await loadSolanaWeb3();
    const pubKey = new PublicKey(walletAddress);
    const nfts = await getWalletNFTs(pubKey);
    
    // Filtrer uniquement les NFTs MFAI Proof-of-Skill
    return nfts
      .filter((nft: any) => nft.name?.includes('Proof') || nft.symbol === 'MFAI')
      .map((nft: any) => ({
        mintAddress: nft.mint || nft.address,
        name: nft.name,
        description: nft.description || 'MFAI Proof-of-Skill',
        image: nft.image || '/default-nft.png',
        phase: nft.phase || 'Build',
        phaseNumber: nft.phaseNumber || 1,
        score: nft.score || 75,
        walletAddress,
        createdAt: nft.createdAt || new Date().toISOString(),
        attributes: nft.attributes || [],
      }));
  } catch (error) {
    console.warn('Failed to fetch NFTs:', error);
    return [];
  }
}

/**
 * Génère l'URL Blink pour partager un Proof-of-Skill
 */
export function getProofOfSkillBlinkUrl(mintAddress: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/blinks/proof-of-skill?mint=${mintAddress}`;
}

/**
 * Génère le lien Solana Explorer
 */
export function getExplorerUrl(mintAddress: string, cluster: 'devnet' | 'mainnet' = 'devnet'): string {
  return `https://explorer.solana.com/address/${mintAddress}?cluster=${cluster}`;
}

/**
 * Mint un nouveau Proof-of-Skill (wrapper avec typage)
 */
export async function mintProofOfSkillCNFT(
  wallet: any,
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes?: { trait_type: string; value: string | number }[];
  }
): Promise<MintProofOfSkillResult> {
  // Utiliser la fonction existante de blockchain.ts
  const { mintProofOfSkill } = await import('../utils/blockchain');
  return mintProofOfSkill(wallet, metadata);
}

export const cnftService = {
  getProofOfSkillNFTs,
  getProofOfSkillBlinkUrl,
  getExplorerUrl,
  mintProofOfSkillCNFT,
};

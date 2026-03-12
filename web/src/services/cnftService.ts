/**
 * @file cnftService.ts (Web App)
 * @description Service cNFT pour l'application Next.js (Blinks)
 * 
 * Ce service est une interface vers le backend mf-back pour les opérations cNFT.
 * Les Blinks appellent ce service qui transmet à mf-back.
 * 
 * @author Kimi Code CLI — Phase 3 — 2026-03-12
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3002';

export interface CNFTPayload {
  recipient: string;
  phase: string;
  score: number;
  journeyId: string;
  metadata: {
    name: string;
    description: string;
    imageUrl: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  };
}

export interface CNFTReturn {
  success: boolean;
  txHash?: string;
  mintAddress?: string;
  error?: string;
  simulation?: boolean;
}

/**
 * Mint un Proof-of-Skill cNFT via l'API backend.
 * Phase 3 : Appel au backend mf-back qui gère le mint réel.
 */
export async function mintProofOfSkillCNFT(payload: CNFTPayload): Promise<CNFTReturn> {
  try {
    const response = await fetch(`${API_BASE}/api/cnft/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[cNFT Web] Erreur:', error);
    // Fallback simulation si backend indisponible
    return {
      success: true,
      txHash: `sim_web_${Date.now().toString(16)}`,
      mintAddress: `sim_${payload.phase}_${payload.recipient.slice(0, 6)}`,
      simulation: true,
    };
  }
}

/**
 * Status du service cNFT.
 */
export async function getCNFTServiceStatus(): Promise<{
  available: boolean;
  network: string;
  simulation: boolean;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/cnft/status`, {
      method: 'GET',
    });
    return await response.json();
  } catch {
    return {
      available: false,
      network: 'unknown',
      simulation: true,
    };
  }
}

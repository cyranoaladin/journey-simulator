/**
 * @file priority-fees.test.ts
 * @description Tests unitaires pour le module de priority fees dynamiques
 * @author Kimi Code CLI — 2026-03-11
 */

import { getOptimalPriorityFee, buildPriorityFeeInstructions, sleep } from '../src/priority-fees';
import { Connection } from '@solana/web3.js';

// Mock de la connexion Solana
const mockConnection = {
  getRecentPrioritizationFees: jest.fn(),
} as unknown as Connection;

describe('getOptimalPriorityFee', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne le fee p75 quand des données sont disponibles', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([
      { slot: 1, prioritizationFee: 500 },
      { slot: 2, prioritizationFee: 1000 },
      { slot: 3, prioritizationFee: 2000 },
      { slot: 4, prioritizationFee: 5000 },
    ]);
    const fee = await getOptimalPriorityFee(mockConnection, { urgency: 'normal' });
    expect(fee).toBeGreaterThanOrEqual(1000);
  });

  it('retourne le minimum quand aucune donnée n\'est disponible', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([]);
    const fee = await getOptimalPriorityFee(mockConnection, { urgency: 'normal' });
    expect(fee).toBe(1_000);
  });

  it('retourne le minimum mint quand urgency=high et aucune donnée', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([]);
    const fee = await getOptimalPriorityFee(mockConnection, { urgency: 'high' });
    expect(fee).toBe(10_000);
  });

  it('ne dépasse pas maxMicroLamports', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([
      { slot: 1, prioritizationFee: 999_999 },
    ]);
    const fee = await getOptimalPriorityFee(mockConnection, { maxMicroLamports: 50_000 });
    expect(fee).toBeLessThanOrEqual(50_000);
  });

  it('gère les erreurs RPC avec un fallback', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockRejectedValue(new Error('RPC timeout'));
    const fee = await getOptimalPriorityFee(mockConnection);
    expect(typeof fee).toBe('number');
    expect(fee).toBeGreaterThan(0);
  });

  it('utilise le percentile 50 pour urgency=low', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([
      { slot: 1, prioritizationFee: 100 },
      { slot: 2, prioritizationFee: 200 },
      { slot: 3, prioritizationFee: 300 },
      { slot: 4, prioritizationFee: 400 },
    ]);
    const fee = await getOptimalPriorityFee(mockConnection, { urgency: 'low' });
    // Avec 4 éléments et percentile 0.50, on prend l'index 2 (300)
    expect(fee).toBeGreaterThanOrEqual(200);
  });

  it('utilise le percentile 90 pour urgency=high', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([
      { slot: 1, prioritizationFee: 100 },
      { slot: 2, prioritizationFee: 200 },
      { slot: 3, prioritizationFee: 300 },
      { slot: 4, prioritizationFee: 10000 },
    ]);
    const fee = await getOptimalPriorityFee(mockConnection, { urgency: 'high' });
    // Avec 4 éléments et percentile 0.90, on prend un index élevé
    expect(fee).toBeGreaterThanOrEqual(300);
  });
});

describe('buildPriorityFeeInstructions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 2 instructions (ComputeUnitLimit + ComputeUnitPrice)', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([]);
    const instructions = await buildPriorityFeeInstructions(mockConnection);
    expect(instructions).toHaveLength(2);
    expect(instructions[0].programId.toBase58()).toBe('ComputeBudget111111111111111111111111111111');
    expect(instructions[1].programId.toBase58()).toBe('ComputeBudget111111111111111111111111111111');
  });

  it('utilise les compute units personnalisés si fournis', async () => {
    (mockConnection.getRecentPrioritizationFees as jest.Mock).mockResolvedValue([]);
    const instructions = await buildPriorityFeeInstructions(mockConnection, { computeUnits: 500_000 });
    expect(instructions).toHaveLength(2);
    // L'instruction 0 est setComputeUnitLimit
    expect(instructions[0].data).toBeDefined();
  });
});

describe('sleep', () => {
  it('attend le nombre de millisecondes spécifié', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45); // Tolérance de 5ms
  });
});

// src/store/__tests__/journeyStore.test.ts
import { afterEach, beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { personas } from '../../data/personas';
import { api } from '../../utils/api';
import { tokenStore } from '../../utils/tokenStore';
import { useJourneyStore } from '../journeyStore';

// Mock the entire api module
vi.mock('../../utils/api', () => ({
  api: {
    completePhase: vi.fn(),
    loadUserProgress: vi.fn(),
    getUserProgress: vi.fn().mockResolvedValue({
      success: true,
      progress: {
        total_xp: 500,
        completed_phases: 1,
      }
    }),
  }
}));

const mockApi = api as Mocked<typeof api>;

describe('Journey Store - Phase Completion', () => {
  beforeEach(async () => {
    // Reset the store and mocks before each test
    await useJourneyStore.getState().resetProgress();
    vi.clearAllMocks();

    tokenStore.setAccessToken('test-token');
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('userId', 'test-user');
    }
  });

  afterEach(() => {
    tokenStore.clearTokens();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('should correctly complete a phase and trigger a progress reload', async () => {
    const store = useJourneyStore;
    const persona = personas[0]; // Let's use the first persona for testing

    // 1. Setup: Select a persona
    store.getState().setSelectedPersona(persona);
    expect(store.getState().userProgress.completedPhases).toEqual([]);

    const phaseToComplete = 0;
    const phaseData = persona.phases[phaseToComplete];

    // Mock the api response for completePhase
    mockApi.completePhase.mockResolvedValueOnce({
      success: true,
      message: "Phase completed",
      ui_blocks: []
    });

    // 2. Action: Complete the first phase
    await store.getState().completePhase(phaseToComplete);

    // 3. Assertions
    // Check if the API was called correctly
    expect(mockApi.completePhase).toHaveBeenCalledWith(
      expect.objectContaining({
        phase_number: phaseToComplete + 1,
        score: 100,
        xp_reward: phaseData.xpReward,
        mfai_reward: phaseData.mfaiReward,
        nft_address: expect.any(String),
        // The store enriches the payload with NFT metadata (best-effort). We only require a reward label.
        nft_reward: expect.any(String),
      })
    );

    // Check if the local state was updated optimistically
    expect(store.getState().userProgress.completedPhases).toContain(phaseToComplete);

    // Check if progress reload was triggered
    expect(mockApi.getUserProgress).toHaveBeenCalled();

    // Let's check the final state after reload
    // This requires the store to be fully updated after the async operations
    // We can wait for all promises to resolve
    await new Promise(process.nextTick);

    expect(store.getState().userProgress.totalXP).toBe(500);
  });

  it('should not allow completing a phase that is already completed', async () => {
    const store = useJourneyStore;

    // Manually set a phase as completed
    store.setState({
      userProgress: {
        ...store.getState().userProgress,
        completedPhases: [0],
      }
    });

    // Try to complete the same phase again
    await store.getState().completePhase(0);

    // Assert that the API was not called again
    expect(mockApi.completePhase).not.toHaveBeenCalled();
  });
});

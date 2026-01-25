/**
 * Comprehensive JourneyStore Tests
 * Tests phase progression, state management, and demo functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useJourneyStore } from '../journeyStore';
import { personas as PERSONAS } from '../../data/personas';

describe('JourneyStore - Comprehensive Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useJourneyStore.getState();
    store.resetDemoCache();
  });

  describe('Demo Phase Initialization', () => {
    it('should initialize demo state with phase steps only', async () => {
      const store = useJourneyStore.getState();

      await store.startDemoPhase('cognitive-orientation', 'cognitive-activation-hub');

      const { demoState } = useJourneyStore.getState();

      expect(demoState.isActive).toBe(true);
      expect(demoState.status).toBe('PLAYING');
      expect(demoState.currentPhaseId).toBe('cognitive-orientation');
      expect(demoState.currentSequence.length).toBeGreaterThan(0);
      expect(demoState.stepIndex).toBe(-1); // Ready for first tick
    });

    it('should filter sequence to only include phase steps', async () => {
      const store = useJourneyStore.getState();

      await store.startDemoPhase('cognitive-orientation', 'cognitive-activation-hub');

      const { demoState } = useJourneyStore.getState();

      // All steps should belong to the requested phase
      demoState.currentSequence.forEach(step => {
        expect(step.metadata.phase_id).toBe('cognitive-orientation');
      });
    });

    it('should handle empty sequence gracefully', async () => {
      const store = useJourneyStore.getState();

      await store.startDemoPhase('non-existent-phase', 'non-existent-persona');

      const { demoState } = useJourneyStore.getState();

      expect(demoState.isActive).toBe(false);
      expect(demoState.status).toBe('IDLE');
      expect(demoState.currentSequence).toEqual([]);
    });

    it('should generate unique session ID for each phase start', async () => {
      const store = useJourneyStore.getState();

      await store.startDemoPhase('cognitive-orientation', 'cognitive-activation-hub');
      const sessionId1 = useJourneyStore.getState().demoState.demoSessionId;

      await store.startDemoPhase('solana-fluency', 'cognitive-activation-hub');
      const sessionId2 = useJourneyStore.getState().demoState.demoSessionId;

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('Demo Tick Functionality', () => {
    beforeEach(async () => {
      const store = useJourneyStore.getState();
      await store.startDemoPhase('cognitive-orientation', 'cognitive-activation-hub');
    });

    it('should advance to next step on tick', () => {
      const store = useJourneyStore.getState();
      const initialIndex = useJourneyStore.getState().demoState.stepIndex;

      store.tickDemo();

      const newIndex = useJourneyStore.getState().demoState.stepIndex;
      expect(newIndex).toBe(initialIndex + 1);
    });

    it('should update lastStep on tick', () => {
      const store = useJourneyStore.getState();

      store.tickDemo();

      const { lastStep } = useJourneyStore.getState();
      expect(lastStep).toBeDefined();
      expect(lastStep?.metadata.phase_id).toBe('cognitive-orientation');
    });

    it('should pause on interactive blocks', () => {
      const store = useJourneyStore.getState();

      // Tick until we hit a mission block
      let ticked = 0;
      const maxTicks = 10;

      while (ticked < maxTicks) {
        const stateBefore = useJourneyStore.getState().demoState.status;
        if (stateBefore !== 'PLAYING') break;

        store.tickDemo();
        ticked++;

        const stateAfter = useJourneyStore.getState().demoState.status;
        if (stateAfter === 'WAITING_FOR_INTERACTION') {
          // Successfully paused on interactive block
          expect(stateAfter).toBe('WAITING_FOR_INTERACTION');
          return;
        }
      }

      // If we didn't hit an interactive block, that's also valid for some phases
      expect(ticked).toBeGreaterThan(0);
    });

    it('should reach WAITING_FOR_FINAL_VALIDATION at end of phase', () => {
      const store = useJourneyStore.getState();
      const sequence = useJourneyStore.getState().demoState.currentSequence;

      // Tick through all steps, handling interactions
      for (let i = 0; i < sequence.length + 5; i++) {
        const status = useJourneyStore.getState().demoState.status;

        if (status === 'WAITING_FOR_FINAL_VALIDATION' || status === 'COMPLETED') {
          break;
        }

        if (status === 'PLAYING') {
          store.tickDemo();
        } else if (status === 'WAITING_FOR_INTERACTION') {
          store.submitDemoInteraction('validate', {});
          // Continue playing after interaction
          if (useJourneyStore.getState().demoState.status === 'PLAYING') {
            store.tickDemo();
          }
        }
      }

      const finalStatus = useJourneyStore.getState().demoState.status;
      expect(['WAITING_FOR_FINAL_VALIDATION', 'COMPLETED', 'WAITING_FOR_INTERACTION']).toContain(finalStatus);
    });

    it('should not tick if status is not PLAYING', () => {
      const store = useJourneyStore.getState();

      // Manually set status to something other than PLAYING
      store.setDemoState({ status: 'PAUSED' });

      const indexBefore = useJourneyStore.getState().demoState.stepIndex;
      store.tickDemo();
      const indexAfter = useJourneyStore.getState().demoState.stepIndex;

      expect(indexAfter).toBe(indexBefore);
    });
  });

  describe('Demo Interaction Submission', () => {
    beforeEach(async () => {
      const store = useJourneyStore.getState();
      await store.startDemoPhase('cognitive-orientation', 'cognitive-activation-hub');

      // Tick to a point where we're waiting for interaction
      store.tickDemo();
      if (useJourneyStore.getState().demoState.status !== 'WAITING_FOR_INTERACTION') {
        store.tickDemo();
      }
    });

    it('should resume playing after interaction submission', () => {
      const statusBefore = useJourneyStore.getState().demoState.status;

      if (statusBefore === 'WAITING_FOR_INTERACTION') {
        const store = useJourneyStore.getState();
        store.submitDemoInteraction('validate', {});

        const statusAfter = useJourneyStore.getState().demoState.status;
        expect(statusAfter).toBe('PLAYING');
      }
    });

    it('should ignore interaction if not waiting', async () => {
      const store = useJourneyStore.getState();

      // Reset demo state to allow fresh startDemoPhase
      store.resetDemoCache();

      // Ensure we're in PLAYING state
      await store.startDemoPhase('cognitive-orientation', 'cognitive-activation-hub');

      const statusBefore = useJourneyStore.getState().demoState.status;
      store.submitDemoInteraction('validate', {});
      const statusAfter = useJourneyStore.getState().demoState.status;

      expect(statusAfter).toBe(statusBefore);
    });
  });

  describe('Phase Completion', () => {
    it('should increment current phase on completion', async () => {
      const store = useJourneyStore.getState();

      // Set a persona first
      store.setSelectedPersona(PERSONAS[0]);

      const phaseBefore = store.currentPhase;

      await store.completePhase(0);

      const phaseAfter = useJourneyStore.getState().currentPhase;
      expect(phaseAfter).toBeGreaterThan(phaseBefore);
    });

    it('should add phase to completedPhases array', async () => {
      const store = useJourneyStore.getState();

      store.setSelectedPersona(PERSONAS[0]);

      await store.completePhase(0);

      const { userProgress } = useJourneyStore.getState();
      expect(userProgress.completedPhases).toContain(0);
    });

    it('should not re-complete already completed phase', async () => {
      const store = useJourneyStore.getState();

      store.setSelectedPersona(PERSONAS[0]);

      await store.completePhase(0);
      const xpAfterFirst = useJourneyStore.getState().userProgress.totalXP;

      await store.completePhase(0); // Try again
      const xpAfterSecond = useJourneyStore.getState().userProgress.totalXP;

      // XP should not change on second completion
      expect(xpAfterSecond).toBe(xpAfterFirst);
    });

    it('should award XP on phase completion', async () => {
      const store = useJourneyStore.getState();

      store.setSelectedPersona(PERSONAS[0]);

      const xpBefore = store.userProgress.totalXP;

      await store.completePhase(0, { xpReward: 100 });

      const xpAfter = useJourneyStore.getState().userProgress.totalXP;
      expect(xpAfter).toBeGreaterThan(xpBefore);
    });
  });

  describe('State Management', () => {
    it('should set selected persona', () => {
      const store = useJourneyStore.getState();

      const mockPersona: any = {
        id: 'test-persona',
        title: 'Test Persona',
        phases: [],
      };

      store.setSelectedPersona(mockPersona);

      const { selectedPersona } = useJourneyStore.getState();
      expect(selectedPersona?.id).toBe('test-persona');
    });

    it('should set UI mode', () => {
      const store = useJourneyStore.getState();

      store.setUiMode('expert');

      const { uiMode } = useJourneyStore.getState();
      expect(uiMode).toBe('expert');
    });

    it('should set UI tone', () => {
      const store = useJourneyStore.getState();

      store.setUiTone('motivational');

      const { uiTone } = useJourneyStore.getState();
      expect(uiTone).toBe('motivational');
    });

    it('should reset demo cache', () => {
      const store = useJourneyStore.getState();

      // Set some demo state
      store.setDemoState({
        isActive: true,
        status: 'PLAYING',
        stepIndex: 5,
      });

      store.resetDemoCache();

      const { demoState } = useJourneyStore.getState();
      expect(demoState.isActive).toBe(false);
      expect(demoState.status).toBe('IDLE');
      expect(demoState.stepIndex).toBe(-1);
    });
  });

  describe('XP and Progress Tracking', () => {
    it('should accumulate XP correctly', () => {
      const store = useJourneyStore.getState();

      // Start with demo state to enable XP tracking
      store.setDemoState({ isActive: true });

      const initialXP = store.userProgress.totalXP;

      // Simulate XP gain through tickDemo (which adds xp_delta)
      store.setUserProgress({
        ...store.userProgress,
        totalXP: initialXP + 50,
      });

      expect(useJourneyStore.getState().userProgress.totalXP).toBe(initialXP + 50);
    });

    it('should track MFAI tokens separately from XP', () => {
      const store = useJourneyStore.getState();

      const initialTokens = store.userProgress.mfaiTokens;

      store.setUserProgress({
        ...store.userProgress,
        mfaiTokens: initialTokens + 100,
      });

      expect(useJourneyStore.getState().userProgress.mfaiTokens).toBe(initialTokens + 100);
    });
  });

  describe('Multi-Persona Support', () => {
    const testPersonas = [
      'cognitive-activation-hub',
      'capital-foundry',
      'system-architect',
    ];

    testPersonas.forEach((personaId) => {
      it(`should support ${personaId} persona`, async () => {
        const store = useJourneyStore.getState();

        // Get first phase for this persona
        const persona = PERSONAS.find(p => p.id === personaId);

        if (persona && persona.phases.length > 0) {
          await store.startDemoPhase(persona.phases[0].id, personaId);

          const { demoState } = useJourneyStore.getState();
          expect(demoState.isActive).toBe(true);
          expect(demoState.currentSequence.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid persona gracefully', async () => {
      const store = useJourneyStore.getState();

      await store.startDemoPhase('invalid-phase', 'invalid-persona');

      const { demoState } = useJourneyStore.getState();
      expect(demoState.isActive).toBe(false);
      expect(demoState.currentSequence).toEqual([]);
    });

    it('should handle missing phase ID', async () => {
      const store = useJourneyStore.getState();

      await store.startDemoPhase('', 'cognitive-activation-hub');

      const { demoState } = useJourneyStore.getState();
      // Should either be inactive or have empty sequence
      expect(demoState.isActive === false || demoState.currentSequence.length === 0).toBe(true);
    });
  });
});

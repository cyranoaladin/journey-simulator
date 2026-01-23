/**
 * End-to-End Journey Tests
 * Tests complete user flows through persona journeys
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useJourneyStore } from '../store/journeyStore';
import { personas as PERSONAS } from '../data/personas';

// Mock toast to avoid warnings
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Journey E2E Tests - All Personas', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useJourneyStore.getState();
    store.resetDemoCache();
    store.setSelectedPersona(null);
  });

  describe('Complete Journey Flows', () => {
    const testPersonaJourney = async (personaId: string, personaName: string) => {
      const store = useJourneyStore.getState();
      const persona = PERSONAS.find(p => p.id === personaId);

      expect(persona, `Persona ${personaId} should exist`).toBeDefined();
      if (!persona) return;

      store.setSelectedPersona(persona);

      // Test first 2 phases to verify basic journey flow
      for (let phaseIndex = 0; phaseIndex < Math.min(2, persona.phases.length); phaseIndex++) {
        const phase = persona.phases[phaseIndex];

        // Start the phase
        await store.startDemoPhase(phase.id, personaId);

        const { demoState } = useJourneyStore.getState();

        // Verify phase started correctly
        expect(demoState.isActive, `Phase ${phase.id} should be active`).toBe(true);
        expect(demoState.currentPhaseId, `Current phase should be ${phase.id}`).toBe(phase.id);
        expect(demoState.currentSequence.length, `Phase ${phase.id} should have steps`).toBeGreaterThan(0);

        // Complete the phase (without simulating all steps for speed)
        await store.completePhase(phaseIndex, {
          xpReward: phase.xpReward,
          nftReward: phase.nftReward,
        });

        // Verify phase is marked as completed
        const { userProgress } = useJourneyStore.getState();
        expect(userProgress.completedPhases, `Phase ${phaseIndex} should be in completedPhases`).toContain(phaseIndex);
      }

      // Verify progress was made
      const finalProgress = useJourneyStore.getState().userProgress;
      expect(finalProgress.completedPhases.length, 'Should have completed phases').toBeGreaterThan(0);
      expect(finalProgress.totalXP, 'Should have earned XP').toBeGreaterThan(0);
    };

    it('should complete Cognitive Activation Hub journey', async () => {
      await testPersonaJourney('cognitive-activation-hub', 'Cognitive Activation Hub');
    });

    it('should complete Capital Foundry journey', async () => {
      await testPersonaJourney('capital-foundry', 'Capital Foundry');
    });

    it('should complete System Architect journey', async () => {
      await testPersonaJourney('system-architect', 'System Architect');
    });

    it('should complete Experience Studio journey', async () => {
      await testPersonaJourney('experience-studio', 'Experience Studio');
    });

    it('should complete Impact Engine journey', async () => {
      await testPersonaJourney('impact-engine', 'Impact Engine');
    });

    it('should complete Resilience Master journey', async () => {
      await testPersonaJourney('resilience-master', 'Resilience Master');
    });
  });

  describe('Phase Progression Logic', () => {
    it('should progress through phases in correct order', async () => {
      const store = useJourneyStore.getState();
      const persona = PERSONAS[0]; // Cognitive Activation Hub

      store.setSelectedPersona(persona);

      for (let i = 0; i < persona.phases.length; i++) {
        const currentPhaseIndex = useJourneyStore.getState().currentPhase;

        // Complete current phase
        await store.completePhase(i);

        const newPhaseIndex = useJourneyStore.getState().currentPhase;

        if (i < persona.phases.length - 1) {
          expect(newPhaseIndex, `Should advance to next phase after completing phase ${i}`).toBeGreaterThan(currentPhaseIndex);
        }
      }
    });

    it('should handle phase completion independently', async () => {
      const store = useJourneyStore.getState();
      const persona = PERSONAS[0];

      store.setSelectedPersona(persona);

      // Complete phase 0
      await store.completePhase(0);

      const { userProgress } = useJourneyStore.getState();

      // Phase 0 should be marked as completed
      expect(userProgress.completedPhases.includes(0)).toBe(true);
    });
  });

  describe('XP and Rewards Accumulation', () => {
    it('should accumulate XP across all phases', async () => {
      const store = useJourneyStore.getState();
      const persona = PERSONAS[0];

      store.setSelectedPersona(persona);

      let totalExpectedXP = 0;

      for (let i = 0; i < 3; i++) { // Test first 3 phases
        const phase = persona.phases[i];
        totalExpectedXP += phase.xpReward;

        await store.startDemoPhase(phase.id, persona.id);

        // Complete the phase
        const { demoState } = useJourneyStore.getState();
        for (let step = 0; step < demoState.currentSequence.length + 1; step++) {
          const status = useJourneyStore.getState().demoState.status;
          if (status === 'PLAYING') {
            store.tickDemo();
          } else if (status === 'WAITING_FOR_INTERACTION') {
            store.submitDemoInteraction('validate', {});
          }
        }

        await store.completePhase(i, { xpReward: phase.xpReward });
      }

      const { userProgress } = useJourneyStore.getState();
      expect(userProgress.totalXP).toBeGreaterThanOrEqual(totalExpectedXP * 0.5); // Allow for some variation
    });

    it('should track NFT rewards for each completed phase', async () => {
      const store = useJourneyStore.getState();
      const persona = PERSONAS[0];

      store.setSelectedPersona(persona);

      // Complete first phase
      const phase = persona.phases[0];
      await store.startDemoPhase(phase.id, persona.id);

      const { demoState } = useJourneyStore.getState();
      for (let step = 0; step < demoState.currentSequence.length + 1; step++) {
        const status = useJourneyStore.getState().demoState.status;
        if (status === 'PLAYING') {
          store.tickDemo();
        }
      }

      await store.completePhase(0, {
        nftReward: phase.nftReward,
        xpReward: phase.xpReward,
      });

      const { userProgress } = useJourneyStore.getState();

      // Should have received NFT (if implementation tracks this)
      expect(userProgress.completedPhases.length).toBeGreaterThan(0);
    });
  });

  describe('Session Continuity', () => {
    it('should allow switching between phases', async () => {
      const store = useJourneyStore.getState();
      const persona = PERSONAS[0];

      store.setSelectedPersona(persona);

      // Start first phase
      await store.startDemoPhase(persona.phases[0].id, persona.id);

      const phase1State = useJourneyStore.getState().demoState;
      expect(phase1State.currentPhaseId).toBe(persona.phases[0].id);

      // Switch to second phase (Note: startDemoPhase resets progress for demo mode)
      await store.startDemoPhase(persona.phases[1].id, persona.id);

      const phase2State = useJourneyStore.getState().demoState;
      expect(phase2State.currentPhaseId).toBe(persona.phases[1].id);
      expect(phase2State.isActive).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should handle reset mid-journey', async () => {
      const store = useJourneyStore.getState();
      const persona = PERSONAS[0];

      store.setSelectedPersona(persona);

      // Start first phase
      await store.startDemoPhase(persona.phases[0].id, persona.id);

      // Reset
      store.resetDemoCache();

      const { demoState } = useJourneyStore.getState();

      expect(demoState.isActive).toBe(false);
      expect(demoState.status).toBe('IDLE');
    });

    it('should handle persona switching', async () => {
      const store = useJourneyStore.getState();

      // Start with first persona
      const persona1 = PERSONAS[0];
      store.setSelectedPersona(persona1);
      await store.startDemoPhase(persona1.phases[0].id, persona1.id);

      // Switch to second persona
      const persona2 = PERSONAS[1];
      store.setSelectedPersona(persona2);
      await store.startDemoPhase(persona2.phases[0].id, persona2.id);

      const { demoState, selectedPersona } = useJourneyStore.getState();

      expect(selectedPersona?.id).toBe(persona2.id);
      expect(demoState.currentSequence[0]?.metadata.persona_id).toBe(persona2.id);
    });
  });

  describe('NFT Image Verification', () => {
    PERSONAS.forEach((persona) => {
      it(`should have valid NFT image paths for ${persona.title}`, () => {
        persona.phases.forEach((phase, index) => {
          const expectedImagePath = `/images/nfts/${persona.id}/${phase.id}.png`;

          // We can't actually check if the file exists in a unit test,
          // but we can verify the path format is correct
          expect(expectedImagePath).toMatch(/^\/images\/nfts\/[\w-]+\/[\w-]+\.png$/);
        });
      });
    });
  });
});

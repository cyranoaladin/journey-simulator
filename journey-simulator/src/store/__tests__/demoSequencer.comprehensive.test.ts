/**
 * Comprehensive DemoSequencer Tests
 * Tests all 6 personas and all phases for completeness and validity
 */

import { describe, it, expect } from 'vitest';
import { getDemoSequence } from '../demoSequencer';

const ALL_PERSONAS = [
  'cognitive-activation-hub',
  'capital-foundry',
  'system-architect',
  'experience-studio',
  'impact-engine',
  'resilience-master',
];

const EXPECTED_PHASES_PER_PERSONA: Record<string, string[]> = {
  'cognitive-activation-hub': [
    'cognitive-orientation',
    'solana-fluency',
    'token-design-lab',
    'identity-proofing',
    'ecosystem-engagement',
    'launch-collaterize',
  ],
  'capital-foundry': [
    'capital-discovery',
    'program-forge',
    'oracle-integration',
    'risk-command',
    'capital-launchpad',
    'launch-collaterize',
  ],
  'system-architect': [
    'architecture-scan',
    'depin-studio',
    'onchain-ai',
    'systems-hardening',
    'synaptic-rollout',
    'launch-collaterize',
  ],
  'experience-studio': [
    'experience-discovery',
    'nft-systems-lab',
    'gameplay-lab',
    'ux-elevation',
    'experience-launch',
    'launch-collaterize',
  ],
  'impact-engine': [
    'impact-charter',
    'dao-design',
    'philanthropy-protocols',
    'identity-reputation',
    'synaptic-impact',
    'launch-collaterize',
  ],
  'resilience-master': [
    'security-baseline',
    'exploit-hunt',
    'defense-systems',
    'incident-response',
    'redblue-evolution',
    'launch-collaterize',
  ],
};

describe('DemoSequencer - All Personas', () => {
  describe('Sequence Generation', () => {
    ALL_PERSONAS.forEach((personaId) => {
      describe(`Persona: ${personaId}`, () => {
        it('should generate a non-empty sequence', () => {
          const sequence = getDemoSequence(personaId);
          expect(sequence).toBeDefined();
          expect(sequence.length).toBeGreaterThan(0);
        });

        it('should have all 6 expected phases', () => {
          const sequence = getDemoSequence(personaId);
          const expectedPhases = EXPECTED_PHASES_PER_PERSONA[personaId];

          const foundPhases = Array.from(new Set(sequence.map(step => step.metadata.phase_id)));

          expect(foundPhases).toHaveLength(6);
          expectedPhases.forEach(phaseId => {
            expect(foundPhases).toContain(phaseId);
          });
        });

        it('should have at least 1 step per phase', () => {
          const sequence = getDemoSequence(personaId);
          const expectedPhases = EXPECTED_PHASES_PER_PERSONA[personaId];

          expectedPhases.forEach(phaseId => {
            const phaseSteps = sequence.filter(step => step.metadata.phase_id === phaseId);
            expect(phaseSteps.length).toBeGreaterThanOrEqual(1);
          });
        });

        it('should have valid metadata for all steps', () => {
          const sequence = getDemoSequence(personaId);

          sequence.forEach((step, index) => {
            expect(step.metadata, `Step ${index} should have metadata`).toBeDefined();
            expect(step.metadata.phase_id, `Step ${index} should have phase_id`).toBeTruthy();
            expect(step.metadata.title, `Step ${index} should have title`).toBeTruthy();
            expect(step.metadata.mode, `Step ${index} should have mode`).toBeTruthy();
            expect(step.metadata.tone, `Step ${index} should have tone`).toBeTruthy();
            expect(step.metadata.language, `Step ${index} should have language`).toBe('en');
          });
        });

        it('should have UI blocks for all steps', () => {
          const sequence = getDemoSequence(personaId);

          sequence.forEach((step, index) => {
            expect(step.ui_blocks, `Step ${index} should have ui_blocks`).toBeDefined();
            expect(step.ui_blocks.length, `Step ${index} should have at least 1 UI block`).toBeGreaterThan(0);
          });
        });

        it('should have valid mission blocks with is_mandatory flag', () => {
          const sequence = getDemoSequence(personaId);

          sequence.forEach((step, index) => {
            const missionBlocks = step.ui_blocks.filter(b => b.kind === 'mission_block');

            missionBlocks.forEach((mission: any, mIndex) => {
              expect(mission.is_mandatory, `Step ${index}, Mission ${mIndex} should have is_mandatory`).toBe(true);
              expect(mission.title, `Step ${index}, Mission ${mIndex} should have title`).toBeTruthy();
              expect(mission.description, `Step ${index}, Mission ${mIndex} should have description`).toBeTruthy();
              expect(mission.mission_type, `Step ${index}, Mission ${mIndex} should have mission_type`).toBeTruthy();
              expect(mission.expected_input_type, `Step ${index}, Mission ${mIndex} should have expected_input_type`).toBeTruthy();
            });
          });
        });

        it('should have valid agent actions', () => {
          const sequence = getDemoSequence(personaId);

          sequence.forEach((step, index) => {
            if (step.agent_actions && step.agent_actions.length > 0) {
              step.agent_actions.forEach((action, aIndex) => {
                expect(action.agent_name, `Step ${index}, Action ${aIndex} should have agent_name`).toBeTruthy();
                expect(action.action, `Step ${index}, Action ${aIndex} should have action`).toBeTruthy();
                expect(action.reason, `Step ${index}, Action ${aIndex} should have reason`).toBeTruthy();
              });
            }
          });
        });

        it('should have valid next_state for all steps', () => {
          const sequence = getDemoSequence(personaId);

          sequence.forEach((step, index) => {
            expect(step.next_state, `Step ${index} should have next_state`).toBeDefined();
            expect(step.next_state.phase_id, `Step ${index} should have next_state.phase_id`).toBeTruthy();
            expect(step.next_state.xp_delta, `Step ${index} should have next_state.xp_delta`).toBeGreaterThanOrEqual(0);
          });
        });
      });
    });
  });

  describe('Phase Consistency', () => {
    ALL_PERSONAS.forEach((personaId) => {
      it(`${personaId}: all steps in a phase should have the same phase_id`, () => {
        const sequence = getDemoSequence(personaId);
        const expectedPhases = EXPECTED_PHASES_PER_PERSONA[personaId];

        expectedPhases.forEach(phaseId => {
          const phaseSteps = sequence.filter(step => step.metadata.phase_id === phaseId);

          phaseSteps.forEach(step => {
            expect(step.metadata.phase_id).toBe(phaseId);
          });
        });
      });
    });
  });

  describe('Collaterize Phase (Common to All)', () => {
    ALL_PERSONAS.forEach((personaId) => {
      it(`${personaId}: should have launch-collaterize phase with 3 steps`, () => {
        const sequence = getDemoSequence(personaId);
        const collaterizeSteps = sequence.filter(step => step.metadata.phase_id === 'launch-collaterize');

        expect(collaterizeSteps.length).toBe(3);
      });

      it(`${personaId}: collaterize phase should have introduction, simulation, and results steps`, () => {
        const sequence = getDemoSequence(personaId);
        const collaterizeSteps = sequence.filter(step => step.metadata.phase_id === 'launch-collaterize');

        const titles = collaterizeSteps.map(s => s.metadata.title);
        expect(titles.some(t => t.includes('Introduction') || t.includes('Simulation'))).toBe(true);
      });
    });
  });

  describe('UI Block Types', () => {
    const VALID_BLOCK_TYPES = [
      'text_block',
      'checklist_block',
      'quiz_block',
      'mission_block',
      'resource_block',
      'document_block',
      'evaluation_block',
      'action_suggestions_block',
      'xp_block',
      'diagram_block',
      'dao_dashboard_block',
      'project_selection_block',
      'narrative_choice_block',
      'indicator_block',
      'interactive_template_block',
      'hint_block',
      'bonding_curve_block',
      'code_auditor_block',
      'market_launchpad_block',
    ];

    ALL_PERSONAS.forEach((personaId) => {
      it(`${personaId}: all UI blocks should have valid types`, () => {
        const sequence = getDemoSequence(personaId);

        sequence.forEach((step, index) => {
          step.ui_blocks.forEach((block, bIndex) => {
            expect(
              VALID_BLOCK_TYPES.includes(block.kind),
              `Step ${index}, Block ${bIndex}: Invalid block type "${block.kind}"`
            ).toBe(true);
          });
        });
      });
    });
  });

  describe('Progression Logic', () => {
    ALL_PERSONAS.forEach((personaId) => {
      it(`${personaId}: steps should be in correct phase order`, () => {
        const sequence = getDemoSequence(personaId);
        const expectedPhases = EXPECTED_PHASES_PER_PERSONA[personaId];

        let lastPhaseIndex = -1;

        sequence.forEach((step) => {
          const currentPhaseIndex = expectedPhases.indexOf(step.metadata.phase_id);
          expect(currentPhaseIndex).toBeGreaterThanOrEqual(lastPhaseIndex);
          lastPhaseIndex = currentPhaseIndex;
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for unknown persona', () => {
      const sequence = getDemoSequence('non-existent-persona');
      expect(sequence).toEqual([]);
    });

    it('should handle hub alias for cognitive-activation-hub', () => {
      const sequence1 = getDemoSequence('cognitive-activation-hub');
      const sequence2 = getDemoSequence('hub');

      expect(sequence1.length).toBe(sequence2.length);
      expect(sequence1[0].metadata.phase_id).toBe(sequence2[0].metadata.phase_id);
    });
  });
});

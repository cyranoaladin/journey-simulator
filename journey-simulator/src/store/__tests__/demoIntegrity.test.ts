/**
 * Demo Scenario Integrity Test Suite
 * 
 * Validates that all demo scenarios generate valid, non-empty sequences
 * with properly structured UIBlocks that the renderer can consume.
 */

import { describe, it, expect } from 'vitest';
import { getDemoSequence } from '../demoSequencer';
import { personas } from '../../data/personas';
import { DEMO_SCENARIOS } from '../../config/demoScenarios';
import type { UIBlock, JourneyStepResponse } from '../../types/uiBlocks';

const VALID_BLOCK_KINDS = [
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
] as const;

const validateUIBlock = (block: UIBlock, context: string): string[] => {
  const errors: string[] = [];

  if (!block) {
    errors.push(`${context}: Block is undefined or null`);
    return errors;
  }

  if (!block.kind) {
    errors.push(`${context}: Block missing 'kind' property`);
    return errors;
  }

  if (!VALID_BLOCK_KINDS.includes(block.kind as any)) {
    errors.push(`${context}: Unknown block kind '${block.kind}'`);
  }

  if (!block.id) {
    errors.push(`${context}: Block missing 'id' property`);
  }

  switch (block.kind) {
    case 'text_block':
      if (!block.title) errors.push(`${context}: text_block missing 'title'`);
      if (!block.body_markdown) errors.push(`${context}: text_block missing 'body_markdown'`);
      break;

    case 'mission_block':
      if (!block.title) errors.push(`${context}: mission_block missing 'title'`);
      if (!block.description) errors.push(`${context}: mission_block missing 'description'`);
      if (typeof block.xp_reward !== 'number') errors.push(`${context}: mission_block missing 'xp_reward'`);
      break;

    case 'resource_block':
      if (!block.resources || !Array.isArray(block.resources)) {
        errors.push(`${context}: resource_block missing 'resources' array`);
      } else if (block.resources.length === 0) {
        errors.push(`${context}: resource_block has empty 'resources' array`);
      } else {
        block.resources.forEach((res, idx) => {
          if (!res.id) errors.push(`${context}: resource[${idx}] missing 'id'`);
          if (!res.label) errors.push(`${context}: resource[${idx}] missing 'label'`);
          if (!res.resource_type) errors.push(`${context}: resource[${idx}] missing 'resource_type'`);
        });
      }
      break;

    case 'code_auditor_block':
      if (!block.code) errors.push(`${context}: code_auditor_block missing 'code'`);
      if (!block.language) errors.push(`${context}: code_auditor_block missing 'language'`);
      if (!block.explanation) errors.push(`${context}: code_auditor_block missing 'explanation'`);
      break;

    case 'bonding_curve_block':
      if (!block.data) {
        errors.push(`${context}: bonding_curve_block missing 'data'`);
      } else {
        if (typeof block.data.currentSupply !== 'number') errors.push(`${context}: bonding_curve_block.data missing 'currentSupply'`);
        if (typeof block.data.basePrice !== 'number') errors.push(`${context}: bonding_curve_block.data missing 'basePrice'`);
        if (block.data.basePrice < 0) errors.push(`${context}: bonding_curve_block.data.basePrice is negative`);
      }
      break;

    case 'market_launchpad_block':
      if (!block.protocolName) errors.push(`${context}: market_launchpad_block missing 'protocolName'`);
      if (!block.ticker) errors.push(`${context}: market_launchpad_block missing 'ticker'`);
      break;
  }

  return errors;
};

const validateStep = (step: JourneyStepResponse, stepIndex: number, context: string): string[] => {
  const errors: string[] = [];
  const stepContext = `${context} Step[${stepIndex}]`;

  if (!step) {
    errors.push(`${stepContext}: Step is undefined`);
    return errors;
  }

  if (!step.metadata) {
    errors.push(`${stepContext}: Missing 'metadata'`);
  } else {
    if (!step.metadata.persona_id) errors.push(`${stepContext}: metadata.persona_id missing`);
    if (!step.metadata.phase_id) errors.push(`${stepContext}: metadata.phase_id missing`);
  }

  if (!step.ui_blocks || !Array.isArray(step.ui_blocks)) {
    errors.push(`${stepContext}: Missing 'ui_blocks' array`);
  } else if (step.ui_blocks.length === 0) {
    errors.push(`${stepContext}: Empty 'ui_blocks' array`);
  } else {
    step.ui_blocks.forEach((block, blockIdx) => {
      const blockErrors = validateUIBlock(block, `${stepContext} Block[${blockIdx}]`);
      errors.push(...blockErrors);
    });
  }

  if (!step.agent_actions || !Array.isArray(step.agent_actions)) {
    errors.push(`${stepContext}: Missing 'agent_actions' array`);
  }

  if (!step.next_state) {
    errors.push(`${stepContext}: Missing 'next_state'`);
  }

  return errors;
};

describe('Demo Scenario Integrity', () => {
  const allPersonaIds = personas.map(p => p.id);

  describe('All Personas x All Phases - Sequence Generation', () => {
    personas.forEach((persona) => {
      describe(`Persona: ${persona.id}`, () => {
        persona.phases.forEach((phase, phaseIndex) => {
          it(`Phase ${phaseIndex + 1}: ${phase.id} generates valid sequence`, () => {
            const sequence = getDemoSequence(phase.id, persona.id);

            expect(sequence).toBeDefined();
            expect(Array.isArray(sequence)).toBe(true);
            expect(sequence.length).toBeGreaterThan(0);

            const allErrors: string[] = [];

            sequence.forEach((step, stepIndex) => {
              const stepErrors = validateStep(step, stepIndex, `[${persona.id}/${phase.id}]`);
              allErrors.push(...stepErrors);
            });

            if (allErrors.length > 0) {
              console.error('Validation Errors:', allErrors);
            }

            expect(allErrors).toHaveLength(0);
          });
        });
      });
    });
  });

  describe('DEMO_SCENARIOS Persona ID Validation', () => {
    it('all persona IDs in DEMO_SCENARIOS exist in personas.ts', () => {
      const invalidPersonaIds: string[] = [];

      Object.keys(DEMO_SCENARIOS).forEach((personaId) => {
        if (!allPersonaIds.includes(personaId)) {
          invalidPersonaIds.push(personaId);
        }
      });

      if (invalidPersonaIds.length > 0) {
        console.error('Invalid Persona IDs in DEMO_SCENARIOS:', invalidPersonaIds);
      }

      expect(invalidPersonaIds).toHaveLength(0);
    });
  });

  describe('No Undefined Values in Sequences', () => {
    it('sequences contain no undefined blocks or actions', () => {
      const undefinedIssues: string[] = [];

      personas.forEach((persona) => {
        persona.phases.forEach((phase) => {
          const sequence = getDemoSequence(phase.id, persona.id);

          sequence.forEach((step, stepIdx) => {
            if (step.ui_blocks.some(b => b === undefined)) {
              undefinedIssues.push(`[${persona.id}/${phase.id}] Step ${stepIdx}: ui_blocks contains undefined`);
            }
            if (step.agent_actions.some(a => a === undefined)) {
              undefinedIssues.push(`[${persona.id}/${phase.id}] Step ${stepIdx}: agent_actions contains undefined`);
            }
          });
        });
      });

      if (undefinedIssues.length > 0) {
        console.error('Undefined Issues:', undefinedIssues);
      }

      expect(undefinedIssues).toHaveLength(0);
    });
  });

  describe('Interactive Block Requirements', () => {
    it('mission_blocks have required xp_reward', () => {
      const issues: string[] = [];

      personas.forEach((persona) => {
        persona.phases.forEach((phase) => {
          const sequence = getDemoSequence(phase.id, persona.id);

          sequence.forEach((step, stepIdx) => {
            step.ui_blocks.forEach((block, blockIdx) => {
              if (block.kind === 'mission_block') {
                if (typeof block.xp_reward !== 'number' || block.xp_reward <= 0) {
                  issues.push(`[${persona.id}/${phase.id}] Step ${stepIdx} Block ${blockIdx}: mission_block has invalid xp_reward`);
                }
              }
            });
          });
        });
      });

      expect(issues).toHaveLength(0);
    });
  });
});

describe('Summary Report', () => {
  it('generates summary of all scenarios', () => {
    let totalSteps = 0;
    let totalBlocks = 0;
    let totalActions = 0;
    const blockKindCounts: Record<string, number> = {};

    personas.forEach((persona) => {
      persona.phases.forEach((phase) => {
        const sequence = getDemoSequence(phase.id, persona.id);
        totalSteps += sequence.length;

        sequence.forEach((step) => {
          totalBlocks += step.ui_blocks.length;
          totalActions += step.agent_actions.length;

          step.ui_blocks.forEach((block) => {
            blockKindCounts[block.kind] = (blockKindCounts[block.kind] || 0) + 1;
          });
        });
      });
    });

    console.log('\n========== DEMO SCENARIO SUMMARY ==========');
    console.log(`Total Personas: ${personas.length}`);
    console.log(`Total Phases: ${personas.reduce((acc, p) => acc + p.phases.length, 0)}`);
    console.log(`Total Steps: ${totalSteps}`);
    console.log(`Total UI Blocks: ${totalBlocks}`);
    console.log(`Total Agent Actions: ${totalActions}`);
    console.log('\nBlock Kind Distribution:');
    Object.entries(blockKindCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([kind, count]) => {
        console.log(`  ${kind}: ${count}`);
      });
    console.log('============================================\n');

    expect(totalSteps).toBeGreaterThan(0);
  });
});

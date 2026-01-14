/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { personas } from '../data/personas';

export interface NextActionConfig {
  id: string;
  label: string;
  type: 'mission' | 'tool' | 'outcome';
}

export interface JourneyPhaseConfig {
  id: string; // e.g. 'phase-1', 'phase-2' (mapped from backend stepId)
  label: string;
  description: string;
  order: number;
  originalId: string; // id from personas.ts
  nextActions: NextActionConfig[];
}

export function getJourneyPhases(personaId: string): JourneyPhaseConfig[] {
  const persona = personas.find(p => p.id === personaId);
  if (!persona) return [];

  return persona.phases.map((p, index) => {
    const nextActions: NextActionConfig[] = [];

    // Add mission as primary action
    if (p.mission) {
      nextActions.push({
        id: `mission-${index}`,
        label: p.mission,
        type: 'mission'
      });
    }

    // Add tools as suggestions
    if (p.tools) {
      p.tools.forEach((tool, i) => {
        nextActions.push({
          id: `tool-${index}-${i}`,
          label: `Use ${tool}`,
          type: 'tool'
        });
      });
    }

    return {
      id: `phase-${index + 1}`,
      label: p.title,
      description: p.description,
      order: index + 1,
      originalId: p.id,
      nextActions
    };
  });
}

export function getPhaseFromStepId(personaId: string, stepId: string): JourneyPhaseConfig | undefined {
  const phases = getJourneyPhases(personaId);
  return phases.find(p => p.id === stepId || p.originalId === stepId);
}

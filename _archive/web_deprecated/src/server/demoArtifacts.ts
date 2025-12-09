import type { NextRequest } from 'next/server'

export const demoSteps = [
  {
    metadata: {
      persona_id: 'demo',
      journey_track: 'builder',
      phase_id: 'learn',
      language: 'fr',
      mode: 'discovery',
      tone: 'pedagogical',
      title: 'Découverte',
      summary: 'Étape de découverte',
    },
    ui_blocks: [
      {
        kind: 'text_block',
        id: 'tb1',
        title: 'Welcome',
        body_markdown: 'Découvrez les fondamentaux de Solana.',
      },
      {
        kind: 'checklist_block',
        id: 'cl1',
        title: 'Checklist',
        items: [
          { label: 'Installer Phantom', checked: false },
          { label: 'Créer un wallet', checked: false },
        ],
      },
      {
        kind: 'action_suggestions_block',
        id: 'asb1',
        title: 'Suite',
        suggestions: [{ label: 'Passer au build', action_id: 'go_build' }],
      },
    ],
    agent_actions: [],
    next_state: { phase_id: 'build', completed_missions: [], xp_delta: 5, notes: 'demo' },
  },
  {
    metadata: {
      persona_id: 'demo',
      journey_track: 'builder',
      phase_id: 'build',
      language: 'fr',
      mode: 'builder',
      tone: 'pedagogical',
      title: 'Build',
      summary: 'Atelier pratique',
    },
    ui_blocks: [
      {
        kind: 'mission_block',
        id: 'm1',
        title: 'Première transaction',
        description: 'Effectuez une transaction sur devnet et fournissez le lien Solscan.',
        mission_type: 'solana_transaction',
        expected_input_type: 'link',
        xp_reward: 20,
      },
      {
        kind: 'resource_block',
        id: 'rb1',
        title: 'Ressources',
        resources: [
          {
            id: 'r1',
            label: 'Doc Solana',
            description: 'Introduction',
            resource_type: 'article',
            agent_owner: 'GuideAgent',
            url: '',
          },
        ],
      },
      {
        kind: 'xp_block',
        id: 'xp1',
        title: 'Progression',
        current_xp: 10,
        gained_xp: 20,
        next_level_xp: 50,
      },
    ],
    agent_actions: [],
    next_state: { phase_id: 'build', completed_missions: [], xp_delta: 20, notes: 'demo' },
  },
]

export function getDemoStep(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const idx = Number(searchParams.get('idx') ?? 0)
  return demoSteps[Math.max(0, Math.min(demoSteps.length - 1, idx))]
}

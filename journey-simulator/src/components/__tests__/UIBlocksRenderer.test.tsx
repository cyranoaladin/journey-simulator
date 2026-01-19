/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import UIBlocksRenderer from '../UIBlocks/UIBlocksRenderer'
import type { JourneyStepResponse } from '../../types/uiBlocks'

const sample: JourneyStepResponse = {
  metadata: { persona_id: 'demo', journey_track: 'builder', phase_id: 'learn', language: 'fr' },
  ui_blocks: [
    { kind: 'quiz_block', id: 'qz', title: 'Quiz', questions: [{ id: 'q1', question: '2+2?', options: ['3', '4'], correct_option_index: 1, explanation: '2+2=4' }] },
    { kind: 'document_block', id: 'doc', title: 'Doc', doc_type: 'one_pager', content_markdown: '# Titre\n\n- a\n- b' }
  ],
  agent_actions: [],
  next_state: { phase_id: 'learn', completed_missions: [], xp_delta: 0 }
}

describe('UIBlocksRenderer', () => {
  it('renders quiz and shows explanation', () => {
    render(<UIBlocksRenderer response={sample} />)
    fireEvent.click(screen.getByText('Check Answers'))
    expect(screen.getByText(/Explanation/)).toBeInTheDocument()
  })

  it('renders document with basic markdown', () => {
    render(<UIBlocksRenderer response={sample} />)
    expect(screen.getByText('Titre')).toBeInTheDocument()
  })
})

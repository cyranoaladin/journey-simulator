/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import JourneyTimeline from '../JourneyTimeline'

// Mock store
vi.mock('../../../store/journeyStore', () => ({
    useJourneyStore: (selector: any) => selector({
        selectedPersona: null
    })
}))

describe('JourneyTimeline', () => {
    const mockPhases = [
        { id: '1', title: 'Phase 1', description: 'Desc 1' },
        { id: '2', title: 'Phase 2', description: 'Desc 2' },
        { id: '3', title: 'Phase 3', description: 'Desc 3' }
    ]

    it('renders phases correctly', () => {
        render(<JourneyTimeline phases={mockPhases} currentPhase={0} />)

        expect(screen.getByText('Phase 1')).toBeInTheDocument()
        expect(screen.getByText('Phase 2')).toBeInTheDocument()
        expect(screen.getByText('Phase 3')).toBeInTheDocument()
    })

    it('marks the current phase as active', () => {
        render(<JourneyTimeline phases={mockPhases} currentPhase={1} />)

        const buttons = screen.getAllByRole('button')
        expect(buttons[1]).toHaveAttribute('aria-current', 'step')
        expect(buttons[0]).not.toHaveAttribute('aria-current')
    })

    it('calls onPhaseChange when a completed or active phase is clicked', () => {
        const onPhaseChange = vi.fn()
        render(<JourneyTimeline phases={mockPhases} currentPhase={1} onPhaseChange={onPhaseChange} />)

        // Click Phase 1 (completed) - we need to find the clickable container
        // The text is inside the container.
        fireEvent.click(screen.getAllByRole('button')[0])
        expect(onPhaseChange).toHaveBeenCalledWith(0)

        // Click Phase 2 (active)
        fireEvent.click(screen.getAllByRole('button')[1])
        expect(onPhaseChange).toHaveBeenCalledWith(1)
    })

    it('does not call onPhaseChange when a locked phase is clicked', () => {
        const onPhaseChange = vi.fn()
        render(<JourneyTimeline phases={mockPhases} currentPhase={0} onPhaseChange={onPhaseChange} />)

        // Click Phase 2 (locked)
        fireEvent.click(screen.getAllByRole('button')[1])
        expect(onPhaseChange).not.toHaveBeenCalled()
    })
})

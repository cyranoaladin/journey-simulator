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

    it('highlights current phase', () => {
        render(<JourneyTimeline phases={mockPhases} currentPhase={1} />)

        const phase2Title = screen.getByText('Phase 2')
        expect(phase2Title).toHaveClass('text-accent-cyan')
    })

    it('calls onPhaseChange when a completed or active phase is clicked', () => {
        const onPhaseChange = vi.fn()
        render(<JourneyTimeline phases={mockPhases} currentPhase={1} onPhaseChange={onPhaseChange} />)

        // Click Phase 1 (completed) - we need to find the clickable container
        // The text is inside the container.
        fireEvent.click(screen.getByText('Phase 1'))
        expect(onPhaseChange).toHaveBeenCalledWith(0)

        // Click Phase 2 (active)
        fireEvent.click(screen.getByText('Phase 2'))
        expect(onPhaseChange).toHaveBeenCalledWith(1)
    })

    it('does not call onPhaseChange when a locked phase is clicked', () => {
        const onPhaseChange = vi.fn()
        render(<JourneyTimeline phases={mockPhases} currentPhase={0} onPhaseChange={onPhaseChange} />)

        // Click Phase 2 (locked)
        fireEvent.click(screen.getByText('Phase 2'))
        expect(onPhaseChange).not.toHaveBeenCalled()
    })
})

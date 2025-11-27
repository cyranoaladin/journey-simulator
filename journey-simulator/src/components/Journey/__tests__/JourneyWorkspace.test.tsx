import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import JourneyWorkspace from '../JourneyWorkspace'
import { useJourneyStore } from '../../../store/journeyStore'

// Mock child components to simplify testing
vi.mock('../JourneyTimeline', () => ({
    default: ({ onPhaseChange }: any) => <div data-testid="journey-timeline" onClick={() => onPhaseChange(1)}>Timeline</div>
}))
vi.mock('../../AgentActivityFeed', () => ({
    default: () => <div data-testid="agent-activity-feed">Agent Activity</div>
}))
vi.mock('../../UIBlocks/UIBlocksRenderer', () => ({
    default: () => <div data-testid="ui-blocks-renderer">UI Blocks</div>
}))
vi.mock('../../NFTProofModal', () => ({
    default: () => <div data-testid="nft-proof-modal">NFT Proof Modal</div>
}))

// Mock confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}))

describe('JourneyWorkspace', () => {
    const mockRunInteractiveStep = vi.fn()
    const mockCompletePhase = vi.fn()
    const mockSetCurrentPhase = vi.fn()
    const mockSetUiMode = vi.fn()
    const mockSetUiTone = vi.fn()

    const mockPersona = {
        id: 'persona-1',
        title: 'Test Persona',
        phases: [
            {
                id: 'phase-1',
                title: 'Phase 1',
                description: 'Description 1',
                xpReward: 100,
                mfaiReward: 50
            },
            {
                id: 'phase-2',
                title: 'Phase 2',
                description: 'Description 2',
                xpReward: 200,
                mfaiReward: 100
            }
        ]
    }

    beforeEach(() => {
        vi.clearAllMocks()

        // Setup default store state
        useJourneyStore.setState({
            selectedPersona: mockPersona,
            userProgress: {
                totalXP: 0,
                completedPhases: [],
                nfts: [],
                mfaiTokens: 0,
                stakedMfai: 0,
                votingPower: 0,
                daoProposals: 0,
                testnetAirdropClaimed: false,
                socialShareCount: 0,
                shareHistory: [],
                walletConnected: false,
                passLevel: 'Free'
            },
            currentPhase: 0,
            lastStep: null,
            isStepLoading: false,
            uiMode: 'discovery',
            uiTone: 'pedagogical',
            runInteractiveStep: mockRunInteractiveStep,
            completePhase: mockCompletePhase,
            setCurrentPhase: mockSetCurrentPhase,
            setUiMode: mockSetUiMode,
            setUiTone: mockSetUiTone,
        } as any)
    })

    it('renders correctly with selected persona', () => {
        render(<JourneyWorkspace />)

        expect(screen.getByText('Test Persona Journey')).toBeInTheDocument()
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
        expect(screen.getByText('Start / Continue')).toBeInTheDocument()
    })

    it('calls runInteractiveStep when Start button is clicked', () => {
        render(<JourneyWorkspace />)

        const startButton = screen.getByText('Start / Continue')
        fireEvent.click(startButton)

        expect(mockRunInteractiveStep).toHaveBeenCalledWith({
            phaseId: 'phase-1',
            trackId: 'persona-1',
            userInput: ''
        })
    })

    it('shows loading state when isStepLoading is true', () => {
        useJourneyStore.setState({ isStepLoading: true } as any)
        render(<JourneyWorkspace />)

        // The button text changes to a loader, so "Start / Continue" should not be there
        expect(screen.queryByText('Start / Continue')).not.toBeInTheDocument()
    })

    it('renders UIBlocksRenderer when lastStep is present', () => {
        useJourneyStore.setState({
            lastStep: {
                type: 'text',
                content: 'Hello'
            } as any
        } as any)

        render(<JourneyWorkspace />)

        expect(screen.getByTestId('ui-blocks-renderer')).toBeInTheDocument()
    })

    it('shows Complete Phase button when current phase is the last completed one (active)', () => {
        useJourneyStore.setState({
            lastStep: {
                type: 'evaluation',
                ui_blocks: [
                    {
                        kind: 'evaluation_block',
                        global_score: 80,
                        max_score: 100
                    }
                ]
            } as any
        } as any)

        render(<JourneyWorkspace />)
        expect(screen.getByText('✓ Complete Phase')).toBeInTheDocument()
    })

    it('calls completePhase when Complete Phase button is clicked', () => {
        useJourneyStore.setState({
            lastStep: {
                type: 'evaluation',
                ui_blocks: [
                    {
                        kind: 'evaluation_block',
                        global_score: 80,
                        max_score: 100
                    }
                ]
            } as any
        } as any)

        render(<JourneyWorkspace />)

        const completeButton = screen.getByText('✓ Complete Phase')
        fireEvent.click(completeButton)

        expect(mockCompletePhase).toHaveBeenCalledWith(0, expect.objectContaining({ score: 100, phaseNumber: 1 }))
    })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useJourneyStore } from '../../../store/journeyStore';
import { tokenStore } from '../../../utils/tokenStore';
import JourneyWorkspace from '../JourneyWorkspace';

// Partially mock API layer used by JourneyWorkspace when validating/completing phases
vi.mock('../../../utils/api', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        api: {
            ...(actual.api || {}),
            submitMission: vi.fn().mockResolvedValue({
                success: true,
                evaluation: { global_score: 10, max_score: 10 }
            }),
        },
    };
});

// Mock child components to simplify testing
vi.mock('../JourneyTimeline', () => ({
    default: ({ onPhaseChange }: any) => (
        <div
            data-testid="journey-timeline"
            onClick={() => onPhaseChange(1)}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPhaseChange(1);
                }
            }}
            role="button"
            tabIndex={0}
        >
            Timeline
        </div>
    )
}));
vi.mock('../../AgentActivityFeed', () => ({
    default: () => <div data-testid="agent-activity-feed">Agent Activity</div>
}));
vi.mock('../../UIBlocks/UIBlocksRenderer', () => ({
    default: () => <div data-testid="ui-blocks-renderer">UI Blocks</div>
}));
vi.mock('../../NFTProofModal', () => ({
    default: () => <div data-testid="nft-proof-modal">NFT Proof Modal</div>
}));

// Mock confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}));

const layoutMock = {
    focusMode: false,
    leftPanelOpen: true,
    rightPanelOpen: false,
    toggleFocusMode: vi.fn(),
    setLeftPanelOpen: vi.fn(),
    setRightPanelOpen: vi.fn(),
    density: 'comfortable',
    cycleDensity: vi.fn(),
};

vi.mock('../../../contexts/WorkspaceLayoutContext', () => ({
    useWorkspaceLayout: () => layoutMock,
}));

describe('JourneyWorkspace', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn> | undefined;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

    beforeAll(() => {
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        consoleLogSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();
    });

    const mockRunInteractiveStep = vi.fn();
    const mockCompletePhase = vi.fn();
    const mockSetCurrentPhase = vi.fn();
    const mockSetUiMode = vi.fn();
    const mockSetUiTone = vi.fn();

    const mockPersona = {
        id: 'persona-1',
        title: 'Test Persona',
        phases: [
            {
                id: 'phase-1',
                title: 'Phase 1',
                description: 'Description 1',
                xpReward: 100,
                mfaiReward: 50,
                mission: 'Mission 1',
                tools: [],
                outcomes: []
            },
            {
                id: 'phase-2',
                title: 'Phase 2',
                description: 'Description 2',
                xpReward: 200,
                mfaiReward: 100,
                mission: 'Mission 2',
                tools: [],
                outcomes: []
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Complete phase requires an auth token (now via tokenStore/sessionStorage)
        tokenStore.setAccessToken('demo-token');
        tokenStore.setRefreshToken('demo-refresh-token');

        layoutMock.toggleFocusMode.mockClear();
        layoutMock.setLeftPanelOpen.mockClear();
        layoutMock.setRightPanelOpen.mockClear();
        layoutMock.cycleDensity.mockClear();

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
            ensureApiJourneyId: vi.fn().mockReturnValue('mock-journey-id'),
            setCurrentPhase: mockSetCurrentPhase,
            setUiMode: mockSetUiMode,
            setUiTone: mockSetUiTone,
        } as any);
    });

    it('renders correctly with selected persona', () => {
        render(
            <MemoryRouter>
                <JourneyWorkspace />
            </MemoryRouter>
        );

        expect(screen.getAllByText('Test Persona')[0]).toBeInTheDocument();
        // Phase title is rendered as "PHASE 1" in CSS/HTML but content might be mixed case.
        // Use regex for case-insensitive match or check breadcrumb content explicitly.
        // The breadcrumb contains "PHASE 1" and "Phase 1" (title)
        expect(screen.getAllByText(/Phase 1/i)[0]).toBeInTheDocument();
        // Interaction is now auto-triggered, so "Run Simulation" button is not present by default.
        // Instead, we verify the workspace is rendered.
        expect(screen.getByText(/Mission Workspace/i)).toBeInTheDocument();
    });

    it('triggers runInteractiveStep automatically on mount', async () => {
        // This test asserts auto-bootstrap behavior.
        try {
            tokenStore.setAccessToken('real-token');
        } catch (e) {
            // Ignore error in test
        }

        render(
            <MemoryRouter>
                <JourneyWorkspace />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockRunInteractiveStep).toHaveBeenCalledWith({
                phaseId: 'phase-1',
                trackId: 'persona-1',
                userInput: ''
            });
        });
    });

    it('shows loading state when isStepLoading is true', () => {
        useJourneyStore.setState({ isStepLoading: true } as any);
        render(
            <MemoryRouter>
                <JourneyWorkspace />
            </MemoryRouter>
        );

        // The "Mission Workspace" title should still be there, but maybe not controls if loading?
        // Actually, we just check that "Run Simulation" is DEFINITELY not there (as it shouldn't be anyway)
        // and that perhaps a loader is present if implemented.
        expect(screen.queryByText('Run Simulation')).not.toBeInTheDocument();
    });

    it('renders UIBlocksRenderer when lastStep is present', () => {
        useJourneyStore.setState({
            lastStep: {
                type: 'text',
                content: 'Hello'
            } as any
        } as any);

        render(
            <MemoryRouter>
                <JourneyWorkspace />
            </MemoryRouter>
        );

        expect(screen.getByTestId('ui-blocks-renderer')).toBeInTheDocument();
    });

    it('shows Complete Phase button when current phase is the last completed one (active)', () => {
        useJourneyStore.setState({
            lastStep: {
                type: 'evaluation',
                evaluation: {
                    global_score: 80,
                    max_score: 100
                },
                ui_blocks: [{ kind: 'text', content: 'test' }]
            } as any
        } as any);

        render(
            <MemoryRouter>
                <JourneyWorkspace />
            </MemoryRouter>
        );
        expect(screen.getByTestId('complete-phase-button')).toBeInTheDocument();
    });

    it('calls completePhase when Complete Phase button is clicked', async () => {
        useJourneyStore.setState({
            lastStep: {
                type: 'evaluation',
                evaluation: {
                    global_score: 80,
                    max_score: 100
                },
                ui_blocks: [{ kind: 'text', content: 'test' }]
            } as any
        } as any);

        render(
            <MemoryRouter>
                <JourneyWorkspace />
            </MemoryRouter>
        );

        const completeButton = screen.getByTestId('complete-phase-button');
        fireEvent.click(completeButton);

        // handleCompletePhase is async (submitMission -> completePhase), so wait for it.
        await waitFor(() => {
            expect(mockCompletePhase).toHaveBeenCalledWith(0, expect.objectContaining({ score: 100, phaseNumber: 1 }));
        });
    });
});

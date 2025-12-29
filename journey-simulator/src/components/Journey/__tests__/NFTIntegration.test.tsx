import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JourneyWorkspace from '../JourneyWorkspace';
import { useJourneyStore } from '../../../store/journeyStore';
import { getPersonaProofData } from '../../../data/proofsData';
import { tokenStore } from '../../../utils/tokenStore';

// Partially mock API layer used by JourneyWorkspace when validating/completing phases
vi.mock('../../../utils/api', async (importOriginal) => {
    const actual: any = await importOriginal()
    return {
        ...actual,
        api: {
            ...(actual.api || {}),
            submitMission: vi.fn().mockResolvedValue({
                success: true,
                evaluation: { global_score: 10, max_score: 10 }
            }),
        },
    }
})

// Mock the store
vi.mock('../../../store/journeyStore');

// Mock the proofsData helper
vi.mock('../../../data/proofsData', async () => {
    const actual = await vi.importActual('../../../data/proofsData');
    return {
        ...actual,
        getPersonaProofData: vi.fn().mockReturnValue({ imageUrl: '/images/certificates/mock-cert.png' }),
        getProofType: vi.fn().mockReturnValue('Skill'),
    };
});

// Mock confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
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

// Mock child components to isolate testing
vi.mock('../../NFTProofModal', () => ({
    default: ({ title, imageUrl, onClose }: any) => (
        <div data-testid="nft-proof-modal">
            <h1>{title}</h1>
            <img src={imageUrl} alt="certificate" />
            <button onClick={onClose}>Close</button>
        </div>
    ),
}));

describe('NFT Integration in JourneyWorkspace', () => {
    const mockCompletePhase = vi.fn();
    const mockSetCurrentPhase = vi.fn();
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

    beforeEach(() => {
        vi.clearAllMocks();
        // Complete phase requires an auth token (now via tokenStore/sessionStorage)
        tokenStore.setAccessToken('real-token')
        tokenStore.setRefreshToken('demo-refresh-token')
        layoutMock.toggleFocusMode.mockClear();
        layoutMock.setLeftPanelOpen.mockClear();
        layoutMock.setRightPanelOpen.mockClear();
        layoutMock.cycleDensity.mockClear();
        const mockState = {
            selectedPersona: {
                id: 'cognitive-activation-hub',
                title: 'Cognitive Activation Hub',
                phases: [
                    {
                        id: 'phase-1',
                        title: 'Ecosystem Activation',
                        description: 'Phase 1 Description',
                        xpReward: 100,
                        nftReward: 'Proof-of-Skill™: Activation',
                        requirements: [],
                        tools: [],
                        outcomes: [],
                        mission: 'Mission text',
                        zynoTip: 'Tip text',
                    },
                ],
            },
            userProgress: {
                completedPhases: [],
                totalXP: 0,
                mfaiTokens: 0,
                nfts: [],
            },
            currentPhase: 0,
            lastStep: {
                ui_blocks: [
                    {
                        kind: 'evaluation_block',
                        global_score: 100,
                        max_score: 100,
                    },
                ],
            },
            isStepLoading: false,
            completePhase: mockCompletePhase,
            setCurrentPhase: mockSetCurrentPhase,
            uiMode: 'discovery',
            uiTone: 'pedagogical',
            ensureApiJourneyId: vi.fn().mockReturnValue('mock-journey-id'),
        };

        (useJourneyStore as any).mockImplementation((selector: any) => {
            return selector ? selector(mockState) : mockState;
        });
    });

    it('opens NFTProofModal with correct image URL after phase completion', async () => {
        render(
            <MemoryRouter>
                <JourneyWorkspace />
            </MemoryRouter>
        );

        // Find and click the Complete Phase button (stable test id; label can evolve)
        const completeButton = screen.getByTestId('complete-phase-button');
        fireEvent.click(completeButton);

        // completePhase is called after an async submitMission, so wait for it
        await waitFor(() => {
            expect(mockCompletePhase).toHaveBeenCalled();
        });

        // Wait for the modal to appear (it has a timeout in the component)
        await waitFor(() => {
            expect(screen.getByTestId('nft-proof-modal')).toBeInTheDocument();
        }, { timeout: 2000 });

        // Verify the image URL is passed correctly (based on our mock)
        const img = screen.getByAltText('certificate');
        expect(img).toHaveAttribute('src', '/images/certificates/mock-cert.png');

        // Verify getPersonaProofData was called with correct args
        expect(getPersonaProofData).toHaveBeenCalledWith(
            'cognitive-activation-hub',
            'phase-1',
            'Skill',
            100,
            'Ecosystem Activation',
            1
        );
    });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JourneyCard from '../JourneyCard';
import { useJourneyStore } from '../../../store/journeyStore';
import { api } from '../../../utils/api';

// Mock dependencies
vi.mock('../../../store/journeyStore');
vi.mock('../../../utils/api');
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
        article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    },
    useReducedMotion: () => false,
}));

describe('JourneyCard', () => {
    const mockPersona = {
        id: 'test-persona',
        title: 'Test Persona',
        name: 'Test Name',
        description: 'Test Description',
        icon: '🧪',
        role: 'Test Role',
        targetProfile: 'Testers',
        color: 'blue',
        motivation: 'Testing',
        passType: 'Free',
        phases: [
            {
                id: 'phase1',
                title: 'Phase 1',
                description: 'Desc 1',
                objectives: [],
                missions: [],
                mission: 'Mission 1',
                duration: '1h',
                xpReward: 100,
                tools: [],
                zynoTips: [],
                resources: [],
                outcomes: [],
                zynoTip: 'Tip'
            },
            {
                id: 'phase2',
                title: 'Phase 2',
                description: 'Desc 2',
                objectives: [],
                missions: [],
                mission: 'Mission 2',
                duration: '1h',
                xpReward: 100,
                tools: [],
                zynoTips: [],
                resources: [],
                outcomes: [],
                zynoTip: 'Tip'
            },
        ],
        skills: [],
        tools: [],
        outcomes: [],
    };

    const mockSetSelectedPersona = vi.fn();
    const mockSetUserProgress = vi.fn();
    const mockLoadUserProgress = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useJourneyStore as any).mockReturnValue({
            userProgress: {
                currentPersona: null,
                completedPhases: [],
                walletConnected: false,
            },
            setSelectedPersona: mockSetSelectedPersona,
            setUserProgress: mockSetUserProgress,
            loadUserProgress: mockLoadUserProgress,
        });
        (useJourneyStore as any).getState = vi.fn().mockReturnValue({
            setCurrentPhase: vi.fn(),
        });
    });

    it('should call api.loadDemoState and update store on "Load Demo State" click', async () => {
        // Mock API response
        (api.loadDemoState as any).mockResolvedValue({
            success: true,
            message: 'Success',
            journey: {},
            demo_state: {},
            progress: {
                total_xp: 1000,
                completed_phases: 2,
                nft_certificates: [],
                token_transactions: { mfai_tokens: 50 },
            },
        });

        render(
            <JourneyCard
                persona={mockPersona}
                demoMode={true}
                onSelected={mockSetSelectedPersona}
                setUserProgress={mockSetUserProgress}
            />
        );

        const demoButton = screen.getByRole('button', { name: /Load Demo State/i });
        fireEvent.click(demoButton);

        await waitFor(() => {
            expect(api.loadDemoState).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockSetSelectedPersona).toHaveBeenCalledWith(mockPersona);
        });

        await waitFor(() => {
            expect(mockSetUserProgress).toHaveBeenCalledWith(expect.objectContaining({
                totalXP: 1000,
                completedPhases: [0, 1],
                mfaiTokens: 50,
                currentPersona: 'test-persona',
            }));
        });
    });
});

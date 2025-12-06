import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { JSX } from 'react';
import JourneyCard from '../JourneyCard';
import { useJourneyStore } from '../../../store/journeyStore';
import { api } from '../../../utils/api';

// Mock dependencies
vi.mock('../../../store/journeyStore');
vi.mock('../../../utils/api');
const MOTION_PROP_KEYS = new Set([
    'animate',
    'initial',
    'exit',
    'variants',
    'transition',
    'whileHover',
    'whileTap',
    'whileInView',
    'whileFocus',
    'whileDrag',
    'viewport',
    'layout',
    'layoutId',
    'drag',
    'dragControls',
    'dragConstraints',
    'dragElastic',
    'dragMomentum',
    'dragTransition',
]);

const stripMotionProps = (props: Record<string, unknown>) => {
    return Object.fromEntries(
        Object.entries(props).filter(([key]) => !MOTION_PROP_KEYS.has(key))
    );
};

const createMotionComponent = (tag: keyof JSX.IntrinsicElements | string = 'div') => {
    const ElementTag = (typeof tag === 'string' ? tag : 'div') as keyof JSX.IntrinsicElements;
    const MockMotionComponent = ({ children, ...props }: any) => {
        const sanitizedProps = stripMotionProps(props);
        const Component = ElementTag as keyof JSX.IntrinsicElements;
        return <Component {...sanitizedProps}>{children}</Component>;
    };

    MockMotionComponent.displayName = `MockMotion(${String(tag)})`;
    return MockMotionComponent;
};

vi.mock('framer-motion', () => {
    const cache = new Map<PropertyKey, any>();

    const motionProxy = new Proxy(
        {},
        {
            get: (_target, prop: PropertyKey) => {
                if (!cache.has(prop)) {
                    cache.set(prop, createMotionComponent(typeof prop === 'string' ? prop : 'div'));
                }
                return cache.get(prop);
            },
        }
    );

    return {
        motion: motionProxy,
        useReducedMotion: () => false,
    };
});

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
    let consoleLogSpy: ReturnType<typeof vi.spyOn> | undefined;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
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

    afterEach(() => {
        consoleLogSpy?.mockRestore();
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

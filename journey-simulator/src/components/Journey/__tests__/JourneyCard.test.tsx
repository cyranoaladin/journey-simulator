import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { JSX } from 'react';
import JourneyCard from '../JourneyCard';
import { useJourneyStore } from '../../../store/journeyStore';

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

    it('does not expose demo controls in the real journeys list', async () => {
        render(
            <JourneyCard
                persona={mockPersona}
                onSelected={mockSetSelectedPersona}
            />
        );

        expect(screen.queryByRole('button', { name: /Load Demo State/i })).toBeNull();
    });
});

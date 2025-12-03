import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import Journey from '../pages/Journey';
import { useJourneyStore } from '../store/journeyStore';
import { personas } from '../data/personas';

// Mock the store
vi.mock('../store/journeyStore');

// Mock child components
vi.mock('../components/shared/WalletConnectionBanner', () => ({
    default: () => <div>WalletConnectionBanner</div>
}));

vi.mock('../components/SkillchainBanner', () => ({
    default: () => <div>SkillchainBanner</div>
}));

vi.mock('../components/HeroSection', () => ({
    default: () => <div>HeroSection</div>
}));

vi.mock('../components/AccessPassHolders', () => ({
    default: () => <div>AccessPassHolders</div>
}));

vi.mock('../components/JourneysPage', () => ({
    default: () => <div>JourneysPage</div>
}));

vi.mock('../contexts/TutorialContext', () => ({
    useTutorial: () => ({
        startTutorial: vi.fn()
    })
}));

describe('Journey Component - Deep Linking', () => {
    const mockSetSelectedPersona = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementation
        (useJourneyStore as any).mockReturnValue({
            selectedPersona: null,
            setSelectedPersona: mockSetSelectedPersona
        });
    });

    it('should auto-select persona when journeyId is in URL', async () => {
        // Render with a specific journey ID in the route
        render(
            <MemoryRouter initialEntries={['/journeys/capital-foundry']}>
                <Routes>
                    <Route path="/journeys/:journeyId" element={<Journey />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for the effect to run
        await waitFor(() => {
            expect(mockSetSelectedPersona).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'capital-foundry'
                })
            );
        });
    });

    it('should not auto-select if persona is already selected', async () => {
        // Mock with already selected persona
        (useJourneyStore as any).mockReturnValue({
            selectedPersona: personas[1],
            setSelectedPersona: mockSetSelectedPersona
        });

        render(
            <MemoryRouter initialEntries={['/journeys/capital-foundry']}>
                <Routes>
                    <Route path="/journeys/:journeyId" element={<Journey />} />
                </Routes>
            </MemoryRouter>
        );

        // Should not call setSelectedPersona if already selected
        await waitFor(() => {
            expect(mockSetSelectedPersona).not.toHaveBeenCalled();
        });
    });

    it('should handle invalid journey IDs gracefully', async () => {
        render(
            <MemoryRouter initialEntries={['/journeys/invalid-id']}>
                <Routes>
                    <Route path="/journeys/:journeyId" element={<Journey />} />
                </Routes>
            </MemoryRouter>
        );

        // Should not call setSelectedPersona for invalid ID
        await waitFor(() => {
            expect(mockSetSelectedPersona).not.toHaveBeenCalled();
        });
    });

    it('should render without journeyId parameter', () => {
        render(
            <MemoryRouter initialEntries={['/journeys']}>
                <Routes>
                    <Route path="/journeys" element={<Journey />} />
                </Routes>
            </MemoryRouter>
        );

        // Should render without errors
        expect(screen.getByText('JourneysPage')).toBeInTheDocument();
    });

    it('should work with all valid persona IDs', async () => {
        for (const persona of personas) {
            vi.clearAllMocks();

            (useJourneyStore as any).mockReturnValue({
                selectedPersona: null,
                setSelectedPersona: mockSetSelectedPersona
            });

            const { unmount } = render(
                <MemoryRouter initialEntries={[`/journeys/${persona.id}`]}>
                    <Routes>
                        <Route path="/journeys/:journeyId" element={<Journey />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mockSetSelectedPersona).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: persona.id
                    })
                );
            });

            unmount();
        }
    });
});

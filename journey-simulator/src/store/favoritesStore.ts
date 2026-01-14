/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteResource {
    _id?: string;
    userId: string;
    journeyId: string;
    resource: {
        id: string;
        label: string;
        description?: string;
        url?: string;
        resource_type?: string;
        agent_owner?: string;
    };
    savedAt?: Date;
    tags?: string[];
    notes?: string;
}

interface FavoritesState {
    favorites: FavoriteResource[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchFavorites: (userId?: string) => Promise<void>;
    addFavorite: (favorite: Omit<FavoriteResource, '_id' | 'savedAt'>) => Promise<void>;
    removeFavorite: (id: string, userId?: string) => Promise<void>;
    removeFavoriteByResourceId: (resourceId: string, userId?: string) => Promise<void>;
    updateFavorite: (id: string, updates: { tags?: string[]; notes?: string }, userId?: string) => Promise<void>;
    isFavorite: (resourceId: string) => boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://journey.mfai.app/api';

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],
            isLoading: false,
            error: null,

            fetchFavorites: async (userId = 'anonymous') => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE}/api/favorites?userId=${userId}`);
                    if (!response.ok) throw new Error('Failed to fetch favorites');
                    const data = await response.json();
                    set({ favorites: data, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            addFavorite: async (favorite) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE}/api/favorites`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(favorite),
                    });

                    if (response.status === 409) {
                        // Already in favorites
                        set({ error: 'Already in favorites', isLoading: false });
                        return;
                    }

                    if (!response.ok) throw new Error('Failed to add favorite');
                    const data = await response.json();
                    set((state) => ({
                        favorites: [data, ...state.favorites],
                        isLoading: false,
                    }));
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            removeFavorite: async (id, userId = 'anonymous') => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE}/api/favorites/${id}?userId=${userId}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) throw new Error('Failed to remove favorite');
                    set((state) => ({
                        favorites: state.favorites.filter((f) => f._id !== id),
                        isLoading: false,
                    }));
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            removeFavoriteByResourceId: async (resourceId, userId = 'anonymous') => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE}/api/favorites/resource/${resourceId}?userId=${userId}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) throw new Error('Failed to remove favorite');
                    set((state) => ({
                        favorites: state.favorites.filter((f) => f.resource.id !== resourceId),
                        isLoading: false,
                    }));
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateFavorite: async (id, updates, userId = 'anonymous') => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE}/api/favorites/${id}?userId=${userId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates),
                    });
                    if (!response.ok) throw new Error('Failed to update favorite');
                    const data = await response.json();
                    set((state) => ({
                        favorites: state.favorites.map((f) => (f._id === id ? data : f)),
                        isLoading: false,
                    }));
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            isFavorite: (resourceId) => {
                return get().favorites.some((f) => f.resource.id === resourceId);
            },
        }),
        {
            name: 'favorites-storage',
            partialize: (state) => ({ favorites: state.favorites }),
        }
    )
);

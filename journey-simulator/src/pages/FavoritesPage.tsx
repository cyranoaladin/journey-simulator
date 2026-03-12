/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useEffect } from 'react';
import { useFavoritesStore } from '../store/favoritesStore';
import { Star, ExternalLink, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FavoritesPage() {
    const { favorites, isLoading, fetchFavorites, removeFavorite } = useFavoritesStore();

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan mx-auto mb-4"></div>
                    <p className="text-slate-300">Loading favorites...</p>
                </div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <Star size={64} className="mx-auto mb-4 text-slate-600" />
                    <h2 className="text-2xl font-bold mb-2">No favorites</h2>
                    <p className="text-slate-400">
                        Resources you mark as favorites will appear here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Star size={32} className="text-accent-gold fill-accent-gold" />
                    <h1 className="text-3xl font-bold">My Favorite Resources</h1>
                </div>
                <p className="text-slate-400 mb-8">
                    {favorites.length} resource{favorites.length > 1 ? 's' : ''} saved
                </p>

                <div className="grid gap-4">
                    {favorites.map((fav, index) => (
                        <motion.div
                            key={fav._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-accent-cyan/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">{fav.resource.label}</h3>
                                    {fav.resource.description && (
                                        <p className="text-sm text-slate-300 mb-2">{fav.resource.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                        {fav.resource.agent_owner && (
                                            <span className="bg-white/5 px-2 py-1 rounded">
                                                Par {fav.resource.agent_owner}
                                            </span>
                                        )}
                                        {fav.resource.resource_type && (
                                            <span className="bg-white/5 px-2 py-1 rounded">
                                                {fav.resource.resource_type}
                                            </span>
                                        )}
                                        <span className="bg-white/5 px-2 py-1 rounded">
                                            {new Date(fav.savedAt || '').toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {fav.resource.url && (
                                        <a
                                            href={fav.resource.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-2 rounded-md bg-accent-cyan/20 hover:bg-accent-cyan/30 transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <ExternalLink size={14} />
                                            Open
                                        </a>
                                    )}
                                    <button
                                        onClick={() => fav._id && removeFavorite(fav._id)}
                                        className="px-3 py-2 rounded-md bg-red-500/20 hover:bg-red-500/30 transition-colors flex items-center gap-2 text-sm text-red-300"
                                        title="Remove from favorites"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

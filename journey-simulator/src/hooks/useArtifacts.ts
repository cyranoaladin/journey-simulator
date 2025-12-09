import { useState, useEffect } from 'react';
import { Artifact } from '../types/artifact';
import { api } from '../utils/api';
import { useJourneyStore } from '../store/journeyStore';

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const { apiJourneyId } = useJourneyStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        const data = await api.getJourneyArtifacts(apiJourneyId || 'default_journey');
        if (data.success && Array.isArray(data.artifacts)) {
          if (data.artifacts.length > 0) {
            const normalizedArtifacts = (data.artifacts as Artifact[]).map((artifact) => ({
              ...artifact,
              status: artifact.status ?? 'unlocked',
            }));
            setArtifacts(normalizedArtifacts);
            return;
          }
          // No artifacts returned even though call succeeded; fall back to static set for demo
          console.warn('Artifacts endpoint returned empty list, loading static demo assets instead.');
        }
        throw new Error(data?.message || 'Failed to fetch artifacts');
      } catch (err) {
        console.error('Error fetching artifacts:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');

        // Fallback to static JSON if API fails
        try {
          const staticArtifacts = await import('../data/artifacts.json');
          const fallbackArtifacts = (staticArtifacts.default as Artifact[]).map((artifact) => ({
            ...artifact,
            status: 'unlocked' as const,
          }));
          setArtifacts(fallbackArtifacts);
          setError(null);
        } catch (fallbackErr) {
          console.error('Error loading fallback artifacts:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, []);

  return { artifacts, loading, error };
};
import { useState, useEffect } from 'react';
import { Artifact } from '../types/artifact';
import { api } from '../utils/api';

export const useArtifacts = (options?: { fallbackToStatic?: boolean }) => {
  const fallbackToStatic = options?.fallbackToStatic ?? false;
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        const data = await api.getJourneyArtifacts();
        if (data.success && Array.isArray(data.artifacts)) {
          if (data.artifacts.length > 0) {
            const normalizedArtifacts = (data.artifacts as Artifact[]).map((artifact) => ({
              ...artifact,
              status: artifact.status ?? 'unlocked',
            }));
            setArtifacts(normalizedArtifacts);
            return;
          }
          // No artifacts returned even though call succeeded.
          if (!fallbackToStatic) {
            setArtifacts([]);
            setError(null);
            return;
          }
          console.warn('Artifacts endpoint returned empty list, loading static demo assets instead.');
        }
        throw new Error(data?.message || 'Failed to fetch artifacts');
      } catch (err) {
        console.error('Error fetching artifacts:', err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);

        // Optional fallback to static JSON
        if (fallbackToStatic) {
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
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, [fallbackToStatic]);

  return { artifacts, loading, error };
};

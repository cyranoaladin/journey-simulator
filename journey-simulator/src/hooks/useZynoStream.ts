/**
 * @file useZynoStream.ts
 * @description Hook React pour consommer le stream SSE des réponses Zyno.
 * Permet d'afficher les réponses de Zyno en temps réel (streaming token par token).
 *
 * @example
 * const { tokens, isStreaming, error, startStream } = useZynoStream();
 * // Appeler startStream({ journeyId, stepId, userInput }) pour démarrer
 * // tokens est mis à jour en temps réel
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { useState, useCallback, useRef } from 'react';

interface StreamOptions {
  journeyId: string;
  stepId: string;
  userInput?: string;
  persona?: string;
}

interface UseZynoStreamReturn {
  tokens: string;           // Texte accumulé token par token
  isStreaming: boolean;
  error: string | null;
  startStream: (options: StreamOptions) => void;
  stopStream: () => void;
  clearTokens: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export function useZynoStream(): UseZynoStreamReturn {
  const [tokens, setTokens] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearTokens = useCallback(() => {
    setTokens('');
    setError(null);
  }, []);

  const startStream = useCallback((options: StreamOptions) => {
    stopStream();
    clearTokens();

    const params = new URLSearchParams({
      journeyId: options.journeyId,
      stepId: options.stepId,
      ...(options.userInput ? { userInput: options.userInput } : {}),
      ...(options.persona ? { persona: options.persona } : {}),
    });

    const token = localStorage.getItem('mfai_jwt');
    const url = `${API_BASE}/api/zyno/stream?${params.toString()}`;

    abortControllerRef.current = new AbortController();

    fetch(url, {
      headers: { 
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept': 'text/event-stream',
      },
      signal: abortControllerRef.current.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        setIsStreaming(true);
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token') {
                setTokens(prev => prev + data.token);
              } else if (data.type === 'done') {
                setIsStreaming(false);
              } else if (data.type === 'error') {
                setError(data.message);
                setIsStreaming(false);
              } else if (data.type === 'start') {
                // Stream started successfully
                console.log('[ZynoStream] Stream started', { journeyId: data.journeyId, stepId: data.stepId });
              }
            } catch {
              // Ignorer les lignes SSE malformées
            }
          }
        }

        setIsStreaming(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
        setIsStreaming(false);
      });
  }, [stopStream, clearTokens]);

  return { tokens, isStreaming, error, startStream, stopStream, clearTokens };
}

export default useZynoStream;

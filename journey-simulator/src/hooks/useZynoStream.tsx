/**
 * @file useZynoStream.tsx
 * @description Hook + Context Provider pour le streaming Zyno SSE réel
 */

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { tokenStore } from '../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002';

export interface ZynoMessage {
  id:        string;
  role:      'user' | 'assistant' | 'system';
  content:   string;
  timestamp: Date;
  type?:     'thinking' | 'observation' | 'final' | 'error';
}

interface ZynoStreamContextValue {
  messages:     ZynoMessage[];
  isTyping:     boolean;
  error:        string | null;
  sendMessage:  (content: string, options?: { journeyId?: string; stepId?: string }) => void;
  clearHistory: () => void;
  stopStream:   () => void;
}

const ZynoStreamContext = createContext<ZynoStreamContextValue | undefined>(undefined);

export function ZynoStreamProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ZynoMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (content: string, options?: { journeyId?: string; stepId?: string }) => {
    // Stop any existing stream
    stopStream();

    // Add user message
    const userMsg: ZynoMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    // Create placeholder for assistant response
    const assistantMsgId = `z-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'thinking',
    }]);

    // Build SSE URL with parameters
    const params = new URLSearchParams({
      journeyId: options?.journeyId ?? 'demo',
      stepId: options?.stepId ?? 'build-1',
    });
    if (content.trim()) {
      params.append('userInput', content.trim());
    }

    const token = tokenStore.getAccessToken();
    const url = `${API_BASE}/api/zyno/stream?${params.toString()}`;

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Accept': 'text/event-stream',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

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
              accumulatedContent += data.token;
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: accumulatedContent, type: 'final' as const }
                  : m
              ));
            } else if (data.type === 'done') {
              setIsTyping(false);
            } else if (data.type === 'error') {
              setError(data.message || 'Streaming error');
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: data.message || 'Response error', type: 'error' as const }
                  : m
              ));
              setIsTyping(false);
            } else if (data.type === 'start') {
              // Stream started successfully
              console.log('[ZynoStream] Started:', { journeyId: data.journeyId, stepId: data.stepId });
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }

      setIsTyping(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection error';
      if (errorMsg !== 'AbortError') {
        setError(errorMsg);
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: `⚠️ ${errorMsg}. Réessayez dans un moment.`, type: 'error' as const }
            : m
        ));
      }
      setIsTyping(false);
    }
  }, [stopStream]);

  return (
    <ZynoStreamContext.Provider value={{ 
      messages, 
      isTyping, 
      error,
      sendMessage, 
      clearHistory,
      stopStream 
    }}>
      {children}
    </ZynoStreamContext.Provider>
  );
}

export function useZynoStream() {
  const ctx = useContext(ZynoStreamContext);
  if (!ctx) throw new Error('useZynoStream must be used within ZynoStreamProvider');
  return ctx;
}

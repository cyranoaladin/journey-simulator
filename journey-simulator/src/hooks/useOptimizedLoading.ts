import { useState, useEffect, useRef, useCallback } from 'react';

// Custom hook for optimized loading management
export const useOptimizedLoading = <T,>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  cacheKey?: string
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      // Check if data is in cache
      if (cacheKey) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // Cache valid for 5 minutes (300,000 ms)
          if (age < 300000) {
            setData(cachedData);
            setIsLoading(false);
            return cachedData;
          }
        }
      }

      const result = await asyncFunction();

      // Only update if request was not cancelled
      if (!controller.signal.aborted) {
        setData(result);

        // Save to cache if key provided
        if (cacheKey) {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data: result, timestamp: Date.now() })
          );
        }
      }

      return result;
    } catch (err: any) {
      // Only handle error if not due to cancellation
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err);
      }
      return null;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
      // Clean up controller if it's the same one
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, deps);

  useEffect(() => {
    execute();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  const refresh = useCallback(() => {
    if (cacheKey) {
      sessionStorage.removeItem(cacheKey);
    }
    execute();
  }, [execute, cacheKey]);

  return { data, isLoading, error, refresh, execute };
};

// Hook for progressive data loading
export const useProgressiveLoading = <T,>(steps: (() => Promise<T>)[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<T[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextStep = useCallback(async () => {
    if (currentStep >= steps.length || isLoading) return;

    setIsLoading(true);
    try {
      const result = await steps[currentStep]();
      setResults(prev => [...prev, result]);
      setCurrentStep(prev => prev + 1);

      if (currentStep === steps.length - 1) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error(`Error loading step ${currentStep + 1}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, isLoading, steps]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    const newResults: T[] = [];

    for (let i = 0; i < steps.length; i++) {
      try {
        const result = await steps[i]();
        newResults.push(result);
        setCurrentStep(i + 1);
      } catch (error) {
        console.error(`Error loading step ${i + 1}:`, error);
        break;
      }
    }

    setResults(newResults);
    setIsComplete(true);
    setIsLoading(false);
  }, [steps]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setResults([]);
    setIsComplete(false);
    setIsLoading(false);
  }, []);

  return {
    currentStep,
    results,
    isComplete,
    isLoading,
    loadNextStep,
    loadAll,
    reset,
    progress: currentStep / steps.length * 100
  };
};
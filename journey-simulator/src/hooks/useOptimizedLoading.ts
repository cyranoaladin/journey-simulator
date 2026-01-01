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

  const fromCache = (key: string) => {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    try {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      return age < 300000 ? cachedData : null;
    } catch {
      return null;
    }
  };

  const persistCache = (key: string, value: T) => {
    sessionStorage.setItem(
      key,
      JSON.stringify({ data: value, timestamp: Date.now() })
    );
  };

  const abortPrevious = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const execute = useCallback(async () => {
    abortPrevious();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      if (cacheKey) {
        const cachedData = fromCache(cacheKey);
        if (cachedData !== null) {
          setData(cachedData);
          setIsLoading(false);
          return cachedData;
        }
      }

      const result = await asyncFunction();

      if (!controller.signal.aborted) {
        setData(result);
        if (cacheKey) {
          persistCache(cacheKey, result);
        }
      }

      return result;
    } catch (err: any) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err);
      }
      return null;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [...deps, asyncFunction, cacheKey]);

  useEffect(() => {
    execute();
    return () => abortPrevious();
  }, [execute]);

  const refresh = useCallback(() => {
    if (cacheKey) {
      sessionStorage.removeItem(cacheKey);
    }
    execute();
  }, [cacheKey, execute]);

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
      console.error("Error loading step", { step: currentStep + 1, error });
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
        console.error("Error loading step", { step: i + 1, error });
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
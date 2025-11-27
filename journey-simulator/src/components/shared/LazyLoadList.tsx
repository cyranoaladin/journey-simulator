import { useState, useEffect, useCallback, useRef } from 'react';

interface LazyLoadProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemsPerBatch?: number;
  threshold?: number;
  containerHeight?: string;
  className?: string;
}

const LazyLoadList = <T,>({
  items,
  renderItem,
  itemsPerBatch = 10,
  threshold = 100,
  containerHeight = 'auto',
  className = ''
}: LazyLoadProps<T>) => {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [batchSize, setBatchSize] = useState(itemsPerBatch);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const allLoadedRef = useRef(false);

  const loadMoreItems = useCallback(() => {
    if (allLoadedRef.current) return;
    
    const nextBatch = items.slice(0, batchSize);
    setVisibleItems(nextBatch);

    if (nextBatch.length === items.length) {
      allLoadedRef.current = true;
    }
  }, [items, batchSize]);

  useEffect(() => {
    loadMoreItems();
  }, [loadMoreItems]);

  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !allLoadedRef.current) {
        setBatchSize(prev => prev + itemsPerBatch);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);
    
    // Observer le dernier élément visible
    if (visibleItems.length > 0 && visibleItems.length < items.length) {
      const lastItemIndex = visibleItems.length - 1;
      const lastItem = document.querySelector(`[data-lazy-item="${lastItemIndex}"]`);
      if (lastItem) {
        observerRef.current.observe(lastItem);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleItems, items, itemsPerBatch, threshold]);

  // Réinitialiser si la liste change
  useEffect(() => {
    allLoadedRef.current = false;
    setBatchSize(itemsPerBatch);
    setVisibleItems([]);
  }, [items, itemsPerBatch]);

  useEffect(() => {
    loadMoreItems();
  }, [batchSize, loadMoreItems]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ height: containerHeight, overflowY: 'auto' }}
    >
      {visibleItems.map((item, index) => (
        <div key={index} data-lazy-item={index}>
          {renderItem(item, index)}
        </div>
      ))}
      {visibleItems.length < items.length && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500" />
        </div>
      )}
    </div>
  );
};

export default LazyLoadList;
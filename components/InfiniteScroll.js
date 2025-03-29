import { useEffect, useRef, useCallback } from 'react';

export default function InfiniteScroll({ onLoadMore, hasMore, loadingMore, children }) {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loadingMore) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore]
  );
  
  useEffect(() => {
    // Creo una nuova istanza di Intersection Observer
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1, // trigger quando almeno il 10% dell'elemento è visibile
    };
    
    observerRef.current = new IntersectionObserver(handleObserver, options);
    
    // Osservo l'elemento di riferimento se esiste
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    // Pulizia al dismount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);
  
  return (
    <div className="infinite-scroll-container">
      {children}
      <div
        ref={loadMoreRef}
        className="load-more-trigger h-10 flex items-center justify-center"
      >
        {loadingMore && (
          <div className="cosmic-loader w-8 h-8 border-t-2 border-cosmic-accent rounded-full animate-spin"></div>
        )}
      </div>
    </div>
  );
} 
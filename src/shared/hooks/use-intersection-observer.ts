import { useEffect, useRef, type RefObject } from "react";

interface UseIntersectionObserverOptions {
  /** Margin around root to trigger callback before element enters viewport. @example '200px 0px' */
  rootMargin?: string;
  /** Threshold (0.0-1.0) at which to trigger. 0.0 = one pixel visible, 1.0 = fully visible. */
  threshold?: number;
  /** Whether the observer should be active. */
  enabled?: boolean;
  /** Debounce delay in milliseconds to prevent rapid-fire callbacks. */
  debounceMs?: number;
}

/**
 * Detects when an element enters the viewport using Intersection Observer API.
 * Useful for infinite scroll, lazy loading, and visibility tracking.
 *
 * @example
 * const sentinelRef = useIntersectionObserver(() => loadMoreItems(), {
 *   rootMargin: '200px 0px',
 *   enabled: hasMore && !isLoading
 * });
 * return <div>{items.map(item => <Item key={item.id} {...item} />)}<div ref={sentinelRef} /></div>;
 */
export function useIntersectionObserver(
  callback: () => void,
  options: UseIntersectionObserverOptions = {},
): RefObject<HTMLDivElement | null> {
  const {
    rootMargin = "0px",
    threshold = 0.0,
    enabled = true,
    debounceMs = 200,
  } = options;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const debouncedCallback = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        callbackRef.current();
      }, debounceMs);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            debouncedCallback();
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    observer.observe(sentinel);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      observer.disconnect();
    };
  }, [enabled, rootMargin, threshold, debounceMs]);

  return sentinelRef;
}

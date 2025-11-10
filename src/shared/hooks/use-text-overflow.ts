import { useEffect, useRef, useState } from "react";

/**
 * Detects if text content overflows its container horizontally.
 * Updates automatically when container resizes.
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 150ms)
 * @returns Tuple of [ref, isOverflowing] where ref should be attached to the text element
 *
 * @example
 * ```tsx
 * const [textRef, isOverflowing] = useTextOverflow(150);
 *
 * return (
 *   <span
 *     ref={textRef}
 *     className={cn("overflow-hidden", isOverflowing && "mask-r-from-80% mask-r-to-95%")}
 *   >
 *     {text}
 *   </span>
 * );
 * ```
 */
export function useTextOverflow(
  debounceMs: number = 150,
): [React.RefObject<HTMLElement | null>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkOverflow = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (element) {
          // Check horizontal overflow: scrollWidth > clientWidth means text is truncated
          const hasOverflow = element.scrollWidth > element.clientWidth;
          setIsOverflowing(hasOverflow);
        }
      }, debounceMs);
    };

    // Initial check
    checkOverflow();

    // Observe size changes using ResizeObserver
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(checkOverflow);
      resizeObserver.observe(element);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        resizeObserver.disconnect();
      };
    }

    // Fallback cleanup (ResizeObserver should be available in all modern browsers)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceMs]);

  return [elementRef, isOverflowing];
}

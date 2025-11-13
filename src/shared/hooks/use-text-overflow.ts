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

    const clearPendingCheck = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const checkOverflow = () => {
      clearPendingCheck();

      timeoutRef.current = setTimeout(() => {
        if (element) {
          const hasOverflow = element.scrollWidth > element.clientWidth;
          setIsOverflowing(hasOverflow);
        }
      }, debounceMs);
    };

    checkOverflow();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(checkOverflow);
      resizeObserver.observe(element);

      return () => {
        clearPendingCheck();
        resizeObserver.disconnect();
      };
    }

    return () => {
      clearPendingCheck();
    };
  }, [debounceMs]);

  return [elementRef, isOverflowing];
}

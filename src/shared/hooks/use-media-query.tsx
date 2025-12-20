/** Hook for responsive media query detection with SSR support. */

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query and returns whether it matches.
 * Handles SSR gracefully by returning false on server and syncing on mount.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Set initial value and subscribe to changes
    listener({ matches: media.matches } as MediaQueryListEvent);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

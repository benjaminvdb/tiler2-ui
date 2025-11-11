/**
 * Compatibility layer for Next.js navigation hooks
 * Maps Next.js navigation APIs to React Router equivalents
 */

import {
  useNavigate,
  useSearchParams as useReactRouterSearchParams,
  useLocation,
} from "react-router-dom";
import { useMemo } from "react";

/**
 * Next.js useRouter replacement using React Router
 */
export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(
    () => ({
      push: (url: string) => navigate(url),
      replace: (url: string) => navigate(url, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => window.location.reload(),
      pathname: location.pathname,
      query: Object.fromEntries(new URLSearchParams(location.search)),
    }),
    [navigate, location],
  );
}

/**
 * Next.js useSearchParams replacement using React Router
 * Returns a ReadonlyURLSearchParams-like object
 */
export function useSearchParams() {
  const [searchParams] = useReactRouterSearchParams();

  // Return the native URLSearchParams object which is compatible with Next.js API
  return searchParams;
}

/**
 * Next.js usePathname replacement using React Router
 */
export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

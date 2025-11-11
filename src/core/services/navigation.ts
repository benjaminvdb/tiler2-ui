/**
 * Navigation Service
 *
 * Centralized navigation service with type-safe routing and search params.
 * Provides a clean API for all navigation operations in the application.
 */

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ROUTES, type Route } from "@/core/routing/routes";
import { type SearchParams, mergeSearchParams } from "@/core/routing";

export interface NavigationService {
  // Page navigation
  navigateToHome: (options?: { threadId?: string }) => void;
  navigateToWorkflows: (params?: Partial<SearchParams>) => void;
  navigateToWorkflow: (workflowId: string) => void;

  // Route checking
  isHomePage: (pathname: string) => boolean;
  isWorkflowsPage: (pathname: string) => boolean;
}

export function createNavigationService(
  router: AppRouterInstance,
): NavigationService {
  const buildPreservedUrl = (
    route: Route,
    params?: Partial<SearchParams>,
  ): string => {
    const current =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    const merged = mergeSearchParams(current, params ?? {});
    const queryString = merged.toString();
    return queryString ? `${route}?${queryString}` : route;
  };

  const navigateToHome = (options?: { threadId?: string }) => {
    // When navigating home, always clear workflow and set threadId if provided
    // If no threadId provided, clear it (New Chat scenario)
    const params: Partial<SearchParams> = {
      threadId: options?.threadId,
      workflow: undefined,
    };
    const url = buildPreservedUrl(ROUTES.HOME, params);
    router.push(url);
  };

  const navigateToWorkflows = (params?: Partial<SearchParams>) => {
    const url = buildPreservedUrl(ROUTES.WORKFLOWS, params);
    router.push(url);
  };

  const navigateToWorkflow = (workflowId: string) => {
    const url = buildPreservedUrl(ROUTES.HOME, { workflow: workflowId });
    router.push(url);
  };

  const isHomePage = (pathname: string): boolean => {
    return pathname === ROUTES.HOME;
  };

  const isWorkflowsPage = (pathname: string): boolean => {
    return pathname === ROUTES.WORKFLOWS;
  };

  return {
    navigateToHome,
    navigateToWorkflows,
    navigateToWorkflow,
    isHomePage,
    isWorkflowsPage,
  };
}

/**
 * Open URL in new tab
 */
export function navigateExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

// Re-export for convenience
export { ROUTES, type Route };

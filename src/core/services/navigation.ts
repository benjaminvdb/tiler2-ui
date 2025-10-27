/**
 * Navigation Service
 *
 * Centralized navigation service with type-safe routing and search params.
 * Provides a clean API for all navigation operations in the application.
 */

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ROUTES, type Route } from "@/core/routing/routes";
import { buildUrl, type SearchParams } from "@/core/routing";

export interface NavigationService {
  // Page navigation
  navigateToHome: (params?: Partial<SearchParams>) => void;
  navigateToWorkflows: () => void;
  navigateToWorkflow: (workflowId: string) => void;

  // Route checking
  isHomePage: (pathname: string) => boolean;
  isWorkflowsPage: (pathname: string) => boolean;
}

export function createNavigationService(
  router: AppRouterInstance,
): NavigationService {
  const navigateToHome = (params?: Partial<SearchParams>) => {
    const url = buildUrl(ROUTES.HOME, params);
    router.push(url);
  };

  const navigateToWorkflows = () => {
    router.push(ROUTES.WORKFLOWS);
  };

  const navigateToWorkflow = (workflowId: string) => {
    const url = buildUrl(ROUTES.HOME, { workflow: workflowId });
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

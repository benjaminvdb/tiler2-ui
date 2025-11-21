/**
 * Navigation Service
 *
 * Centralized navigation service with type-safe routing and search params.
 * Provides a clean API for all navigation operations in the application.
 */

import { NavigateFunction } from "react-router-dom";
import { ROUTES, type Route } from "@/core/routing/routes";
import { type SearchParams, mergeSearchParams } from "@/core/routing";

export interface NavigationService {
  navigateToHome: (options?: { threadId?: string }) => void;
  navigateToWorkflows: (params?: Partial<SearchParams>) => void;
  navigateToWorkflow: (workflowId: string) => void;
  navigateToInsights: () => void;

  isHomePage: (pathname: string) => boolean;
  isWorkflowsPage: (pathname: string) => boolean;
  isInsightsPage: (pathname: string) => boolean;
}

export function createNavigationService(
  router: NavigateFunction,
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
    const params: Partial<SearchParams> = {
      threadId: options?.threadId,
      workflow: undefined,
    };
    const url = buildPreservedUrl(ROUTES.HOME, params);
    router(url);
  };

  const navigateToWorkflows = (params?: Partial<SearchParams>) => {
    const url = buildPreservedUrl(ROUTES.WORKFLOWS, params);
    router(url);
  };

  const navigateToWorkflow = (workflowId: string) => {
    const url = buildPreservedUrl(ROUTES.HOME, {
      workflow: workflowId,
      threadId: undefined,
    });
    router(url);
  };

  const navigateToInsights = () => {
    router(ROUTES.INSIGHTS);
  };

  const isHomePage = (pathname: string): boolean => {
    return pathname === ROUTES.HOME;
  };

  const isWorkflowsPage = (pathname: string): boolean => {
    return pathname === ROUTES.WORKFLOWS;
  };

  const isInsightsPage = (pathname: string): boolean => {
    return pathname === ROUTES.INSIGHTS;
  };

  return {
    navigateToHome,
    navigateToWorkflows,
    navigateToWorkflow,
    navigateToInsights,
    isHomePage,
    isWorkflowsPage,
    isInsightsPage,
  };
}

export function navigateExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export { ROUTES, type Route };

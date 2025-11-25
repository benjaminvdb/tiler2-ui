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
  navigateToWorkflows: (
    params?: Partial<SearchParams> & { category?: string },
  ) => void;
  navigateToWorkflow: (workflowId: string) => void;
  navigateToInsights: () => void;
  navigateToActivities: () => void;

  isHomePage: (pathname: string) => boolean;
  isWorkflowsPage: (pathname: string) => boolean;
  isInsightsPage: (pathname: string) => boolean;
  isActivitiesPage: (pathname: string) => boolean;
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

  const navigateToWorkflows = (
    params?: Partial<SearchParams> & { category?: string },
  ) => {
    const { category, ...searchParams } = params ?? {};
    const url = buildPreservedUrl(ROUTES.WORKFLOWS, searchParams);
    const urlWithHash = category
      ? `${url}#${encodeURIComponent(category)}`
      : url;
    router(urlWithHash);
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

  const navigateToActivities = () => {
    router(ROUTES.ACTIVITIES);
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

  const isActivitiesPage = (pathname: string): boolean => {
    return pathname === ROUTES.ACTIVITIES;
  };

  return {
    navigateToHome,
    navigateToWorkflows,
    navigateToWorkflow,
    navigateToInsights,
    navigateToActivities,
    isHomePage,
    isWorkflowsPage,
    isInsightsPage,
    isActivitiesPage,
  };
}

export function navigateExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export { ROUTES, type Route };

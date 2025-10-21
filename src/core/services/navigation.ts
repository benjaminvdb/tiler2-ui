import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface NavigationService {
  navigateToHome: () => void;
  navigateToWorkflows: () => void;
  navigateToWorkflow: (workflowId: string) => void;
  isHomePage: (pathname: string) => boolean;
  isWorkflowsPage: (pathname: string) => boolean;
}

export function createNavigationService(
  router: AppRouterInstance,
): NavigationService {
  const navigateToHome = () => {
    router.push("/");
  };

  const navigateToWorkflows = () => {
    router.push("/workflows");
  };

  const navigateToWorkflow = (workflowId: string) => {
    router.push(`/?workflow=${workflowId}`);
  };

  const isHomePage = (pathname: string): boolean => {
    return pathname === "/";
  };

  const isWorkflowsPage = (pathname: string): boolean => {
    return pathname === "/workflows";
  };

  return {
    navigateToHome,
    navigateToWorkflows,
    navigateToWorkflow,
    isHomePage,
    isWorkflowsPage,
  };
}

export function navigateExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export const ROUTES = {
  HOME: "/",
  WORKFLOWS: "/workflows",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

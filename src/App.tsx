import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { MotionConfigProvider } from "@/core/providers/motion-config-provider";
import { GlobalErrorBoundary } from "@/shared/components/error-boundary/global-error-boundary";
import { AsyncErrorBoundary } from "@/shared/components/error-boundary/async-error-boundary";
import { NetworkStatusProvider } from "@/core/providers/network-status-provider";
import { SentryUserContext } from "@/core/providers/sentry-user-context";
import {
  Auth0DevStatus,
  warnAuth0NotConfigured,
} from "@/features/auth/services/auth0-client";
import { AppLayout } from "@/app/app-layout";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import ThreadsPage from "@/app/page";
import WorkflowsPage from "@/app/workflows/page";

// Warn if Auth0 is not configured in development
warnAuth0NotConfigured();

/**
 * Route wrapper that requires authentication via Auth0.
 * Redirects to login if not authenticated, shows loading screen during auth check.
 * @param children - Components to render when user is authenticated
 * @returns Protected route content or loading screen
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * Auth0 callback page that handles post-login redirect.
 * Waits for authentication to complete, then navigates to home page.
 * This is a backup navigation in case onRedirectCallback doesn't trigger properly.
 * @returns Loading screen while processing auth callback
 */
const CallbackPage = (): React.JSX.Element => {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error("Auth0 callback error:", error);
        // Navigate to home on error - let ProtectedRoute handle re-auth
        navigate("/", { replace: true });
      } else if (isAuthenticated) {
        // Auth complete - navigate to home
        navigate("/", { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Authentication error occurred</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}


/**
 * Root application component.
 * Configures global providers: error boundaries, auth protection, observability, network monitoring.
 * Sets up React Router with protected routes.
 * @returns Application with all providers and routing
 */
export const App = () => {
  const { user } = useAuth0();

  return (
    <MotionConfigProvider>
      <GlobalErrorBoundary>
        <AsyncErrorBoundary>
          <NetworkStatusProvider>
            <SentryUserContext user={user ?? null} />
            <Auth0DevStatus />
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ThreadsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workflows"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <WorkflowsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/auth/callback"
                element={<CallbackPage />}
              />
              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />
            </Routes>
          </NetworkStatusProvider>
        </AsyncErrorBoundary>
      </GlobalErrorBoundary>
    </MotionConfigProvider>
  );
}

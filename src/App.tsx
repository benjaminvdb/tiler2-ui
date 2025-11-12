import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import * as Sentry from "@sentry/react";
import { MotionConfigProvider } from "@/core/providers/motion-config-provider";
import { GlobalErrorBoundary } from "@/shared/components/error-boundary/global-error-boundary";
import { AsyncErrorBoundary } from "@/shared/components/error-boundary/async-error-boundary";
import { NetworkStatusProvider } from "@/core/providers/network-status-provider";
import { AppLayout } from "@/app/app-layout";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import ThreadsPage from "@/app/page";
import WorkflowsPage from "@/app/workflows/page";

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
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

// Sentry User Context Component
function SentryUserContext() {
  const { user } = useAuth0();

  useEffect(() => {
    if (user) {
      const sentryUser: {
        id: string;
        email?: string;
        username?: string;
      } = {
        id: user.sub ?? "",
      };
      if (user.email) sentryUser.email = user.email;
      if (user.name) sentryUser.username = user.name;
      Sentry.setUser(sentryUser);
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return null;
}

export function App() {
  return (
    <MotionConfigProvider>
      <GlobalErrorBoundary>
        <AsyncErrorBoundary>
          <NetworkStatusProvider>
            <SentryUserContext />
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
                element={<LoadingScreen />}
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

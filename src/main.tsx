import "./instrumentation-client";
import React, { useCallback } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Auth0Provider, type AppState } from "@auth0/auth0-react";
import * as Sentry from "@sentry/react";
import { App } from "./App";
import { env } from "./env";
import "./app/globals.css";
import "@fontsource/comic-mono/400.css";
import "@fontsource/comic-mono/700.css";

/**
 * Auth0 provider wrapper that uses React Router's navigate for post-login redirects.
 * This ensures React Router properly handles navigation after Auth0 callback,
 * preventing the infinite loading spinner issue.
 */
// eslint-disable-next-line react-refresh/only-export-components -- Main entry point, not a module with exports
const Auth0ProviderWithNavigate = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const navigate = useNavigate();

  const onRedirectCallback = useCallback(
    (appState?: AppState) => {
      navigate(appState?.returnTo || window.location.pathname, {
        replace: true,
      });
    },
    [navigate],
  );

  return (
    <Auth0Provider
      domain={env.AUTH0_DOMAIN}
      clientId={env.AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,
        audience: env.AUTH0_AUDIENCE,
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>An error occurred</div>}>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <App />
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);

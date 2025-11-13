import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import * as Sentry from "@sentry/react";
import { App } from "./App";
import { env } from "./env";
import "./app/globals.css";
import "@fontsource/comic-mono/400.css";
import "@fontsource/comic-mono/700.css";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: import.meta.env.MODE,
    ...(env.APP_VERSION && {
      release: `agent-chat-ui@${env.APP_VERSION}`,
    }),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const onRedirectCallback = (appState: any) => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname,
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>An error occurred</div>}>
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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);

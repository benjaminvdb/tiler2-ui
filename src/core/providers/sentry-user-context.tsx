"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface SentryUserContextProps {
  user: {
    sub?: string;
    email?: string;
    name?: string;
    nickname?: string;
    picture?: string;
    org_id?: string;
    org_name?: string;
  } | null;
}

/**
 * Sets Sentry user context from Auth0 session
 * This component should be rendered once at the app root
 */
export const SentryUserContext: React.FC<SentryUserContextProps> = ({
  user,
}) => {
  useEffect(() => {
    if (user && user.sub) {
      // Set user context in Sentry
      Sentry.setUser({
        id: user.sub,
        ...(user.email && { email: user.email }),
        ...(user.nickname || user.name
          ? { username: user.nickname || user.name }
          : {}),
      });

      // Add organization context if available
      if (user.org_id || user.org_name) {
        Sentry.setContext("organization", {
          id: user.org_id,
          name: user.org_name,
        });
      }

      // Add user metadata as tags
      Sentry.setTags({
        user_has_email: !!user.email,
        user_has_picture: !!user.picture,
      });
    } else {
      // Clear user context when logged out
      Sentry.setUser(null);
    }

    // Cleanup on unmount (optional)
    return () => {
      // You can clear user context on unmount if desired
      // Sentry.setUser(null);
    };
  }, [user]);

  // This component doesn't render anything
  return null;
};

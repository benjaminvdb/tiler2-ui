import { useEffect } from "react";
import * as Sentry from "@sentry/react";

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
 * Keeps Sentry's user context in sync with the authenticated session.
 */
export const SentryUserContext: React.FC<SentryUserContextProps> = ({
  user,
}) => {
  useEffect(() => {
    if (!user?.sub) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      id: user.sub,
      ...(user.email && { email: user.email }),
      ...(user.nickname || user.name
        ? { username: user.nickname || user.name }
        : {}),
    });

    if (user.org_id || user.org_name) {
      Sentry.setContext("organization", {
        id: user.org_id,
        name: user.org_name,
      });
    }

    Sentry.setTags({
      user_has_email: !!user.email,
      user_has_picture: !!user.picture,
    });

    return () => {
      Sentry.setUser(null);
    };
  }, [user]);

  return null;
};

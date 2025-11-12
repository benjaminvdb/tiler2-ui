/**
 * React hook for observability with automatic context injection
 * Auto-injects userId from Auth0 and threadId from URL state
 */

import { useAuth0 } from "@auth0/auth0-react";
import { useSearchParams } from "react-router-dom";
import { observability } from "./client";
import type { ILogger, ObservabilityContext } from "./types";

/**
 * React hook for observability with auto-injected context
 * Automatically includes userId from Auth0 and threadId from URL params
 *
 * @param context - Additional context to merge with auto-injected values
 * @returns Logger instance with merged context
 *
 * @example
 * ```tsx
 * const logger = useObservability({ component: "FileUpload" });
 * logger.info("File uploaded", { fileName: file.name });
 * ```
 */
export function useObservability(context?: ObservabilityContext): ILogger {
  const { user } = useAuth0();
  const [searchParams] = useSearchParams();

  return observability.child({
    ...(user?.sub && { userId: user.sub }),
    ...(searchParams.get("threadId") && {
      threadId: searchParams.get("threadId")!,
    }),
    ...context,
  });
}

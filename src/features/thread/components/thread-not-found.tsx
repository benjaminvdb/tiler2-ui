/**
 * Thread Not Found Component
 *
 * Displays a user-friendly error message when a thread cannot be loaded,
 * typically because it was deleted or is no longer accessible.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareOff, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSearchParamState } from "@/core/routing/hooks";
import { useUIContext } from "@/features/chat/providers/ui-provider";

interface ThreadNotFoundProps {
  error: Error;
}

export const ThreadNotFound = ({
  error,
}: ThreadNotFoundProps): React.JSX.Element => {
  const navigate = useNavigate();
  const [goalId] = useSearchParamState("goalId");
  const { onNewThread } = useUIContext();

  const handleGoBack = useCallback(() => {
    if (goalId) {
      navigate(`/goals/${goalId}`);
    } else {
      navigate(-1);
    }
  }, [navigate, goalId]);

  const handleStartNew = useCallback(() => {
    onNewThread();
  }, [onNewThread]);

  // Determine if user came from a goal
  const fromGoal = Boolean(goalId);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
          <MessageSquareOff
            className="h-8 w-8 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        <h2 className="mb-3 text-xl font-medium text-[var(--foreground)]">
          Conversation not found
        </h2>

        {/* Description */}
        <p className="mb-6 text-[var(--muted-foreground)]">
          {fromGoal
            ? "This conversation is no longer available. It may have been removed during a database update. You can start a new conversation for this task."
            : "This conversation is no longer available. It may have been deleted or you may not have access to it."}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            onClick={handleGoBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            {fromGoal ? "Back to Goal" : "Go Back"}
          </Button>
          <Button
            variant="outline"
            onClick={handleStartNew}
            className="w-full sm:w-auto"
          >
            <Home
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Start New Conversation
          </Button>
        </div>

        {/* Debug info (only in development) */}
        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-xs text-[var(--muted-foreground)]">
              Error details
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-600">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

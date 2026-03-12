import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSearchParamState } from "@/core/routing/hooks";

interface ThreadLoadErrorProps {
  error: Error;
  onRetry: () => void;
}

export const ThreadLoadError = ({
  error,
  onRetry,
}: ThreadLoadErrorProps): React.JSX.Element => {
  const navigate = useNavigate();
  const [goalId] = useSearchParamState("goalId");

  const handleGoBack = () => {
    if (goalId) {
      navigate(`/goals/${goalId}`);
      return;
    }

    navigate(-1);
  };

  const handleStartNew = () => {
    navigate("/");
  };

  const fromGoal = Boolean(goalId);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
          <AlertTriangle
            className="h-8 w-8 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
        </div>

        <h2 className="mb-3 text-xl font-medium text-[var(--foreground)]">
          Conversation failed to load
        </h2>

        <p className="mb-6 text-[var(--muted-foreground)]">
          We could not load this conversation from the server. Try again, or
          start a new conversation if the problem persists.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            onClick={onRetry}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Retry
          </Button>
          <Button
            variant="outline"
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

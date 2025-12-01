/**
 * TaskThreadHeader Component
 *
 * Displays a header with task title, description, and back navigation
 * when viewing a thread that was opened from a goal details page.
 * Only renders when goalId is present in URL params.
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { useSearchParamState } from "@/core/routing/hooks";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { getTaskContext } from "@/features/goals/services/goals-api";
import type { TaskContextResponse } from "@/features/goals/types";

export const TaskThreadHeader = (): React.JSX.Element | null => {
  const navigate = useNavigate();
  const [goalId] = useSearchParamState("goalId");
  const [taskId] = useSearchParamState("taskId");
  const fetchWithAuth = useAuthenticatedFetch();
  const [taskContext, setTaskContext] = useState<TaskContextResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch task context when taskId is present
  useEffect(() => {
    if (!taskId) return;

    const fetchTaskContext = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const context = await getTaskContext(fetchWithAuth, taskId);
        setTaskContext(context);
      } catch (error) {
        console.error("Failed to fetch task context:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTaskContext();
  }, [taskId, fetchWithAuth]);

  const handleBack = useCallback(() => {
    if (goalId) {
      navigate(`/goals/${goalId}`);
    }
  }, [navigate, goalId]);

  // Only render if coming from goal details (goalId present)
  if (!goalId || isLoading || !taskContext) {
    return null;
  }

  return (
    <PageHeader
      title={taskContext.task_title}
      subtitle={taskContext.task_description ?? undefined}
      backButton={{
        label: "Back to Goal",
        onClick: handleBack,
      }}
      sticky={true}
    />
  );
};

/**
 * TaskThreadHeader Component
 *
 * Displays a header with task title, description, and back navigation
 * when viewing a thread that was opened from a goal details page.
 * Only renders when goalId is present in URL params.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { useSearchParamState } from "@/core/routing/hooks";
import { useTaskContext } from "@/features/goals/hooks";

export const TaskThreadHeader = (): React.JSX.Element | null => {
  const navigate = useNavigate();
  const [goalId] = useSearchParamState("goalId");
  const [taskId] = useSearchParamState("taskId");

  const { taskContext, isLoading } = useTaskContext(taskId);

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

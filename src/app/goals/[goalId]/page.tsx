/**
 * Goal Detail Page
 *
 * Displays a single goal with its milestones, tasks, and progress tracking.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Plus,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Link2,
  Zap,
  Pencil,
  Trash2,
  Play,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { useWorkflows } from "@/core/hooks/use-workflows";
import { useGoal } from "@/features/goals/hooks";
import {
  updateTask,
  deleteTask,
  deleteMilestone,
} from "@/features/goals/services";
import {
  CreateMilestoneDialog,
  CreateTaskDialog,
  EditMilestoneDialog,
  EditTaskDialog,
  TaskDependenciesDialog,
  DeleteConfirmationDialog,
  GoalGeneratingSkeleton,
} from "@/features/goals/components";
import { AddItemButton } from "@/features/goals/components/add-item-button";
import { TASK_STATUS_CONFIG } from "@/features/goals/constants";
import { getTaskBlockingInfo } from "@/features/goals/utils";
import type {
  GoalStatus,
  Milestone,
  Task,
  TaskStatus,
} from "@/features/goals/types";
import { Button } from "@/shared/components/ui/button";
import { IconBox } from "@/shared/components/ui/icon-box";
import { Page } from "@/shared/components/ui/page";
import { PageContent } from "@/shared/components/ui/page-content";
import { PageHeader } from "@/shared/components/ui/page-header";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  SectionCard,
  SectionCardHeader,
  SectionCardContent,
} from "@/shared/components/ui/section-card";

// =============================================================================
// Helper Functions
// =============================================================================

interface TaskStatusBadgeProps {
  status: TaskStatus;
  disabled?: boolean;
}

const TaskStatusBadge = ({
  status,
  disabled = false,
}: TaskStatusBadgeProps): React.JSX.Element => {
  const config = TASK_STATUS_CONFIG[status];
  const { Icon } = config;

  return (
    <div
      className={`flex min-w-28 shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${config.className} ${
        disabled ? "opacity-50" : ""
      }`}
      title={`Status: ${config.label}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </div>
  );
};

// =============================================================================
// Blocked Task Tooltip
// =============================================================================

interface BlockedTaskTooltipContentProps {
  blockingTasks: Array<{ id: string; title: string }>;
}

const BlockedTaskTooltipContent = ({
  blockingTasks,
}: BlockedTaskTooltipContentProps): React.JSX.Element => (
  <div className="text-left text-xs">
    <p className="mb-2 font-medium">
      To start this task, please complete the following tasks first:
    </p>
    <ol className="list-decimal space-y-1.5 pl-4 marker:font-medium marker:text-gray-500">
      {blockingTasks.map((task) => (
        <li
          key={task.id}
          className="pl-1 leading-relaxed"
        >
          {task.title}
        </li>
      ))}
    </ol>
  </div>
);

const calculateProgress = (
  milestones: Milestone[],
): { completed: number; total: number } => {
  let completed = 0;
  let total = 0;

  for (const milestone of milestones) {
    for (const task of milestone.tasks) {
      total++;
      if (task.status === "done") {
        completed++;
      }
    }
  }

  return { completed, total };
};

// =============================================================================
// Components
// =============================================================================

// eslint-disable-next-line max-lines-per-function -- Content-heavy presentational component
const AboutPlanSection = (): React.JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const hasSeen = localStorage.getItem("link-chat-about-plan-seen");
    if (hasSeen) {
      return false; // Returning user → collapsed
    }
    // First-time user → expanded, mark as seen
    localStorage.setItem("link-chat-about-plan-seen", "true");
    return true;
  });

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <SectionCard className="mb-6">
      <SectionCardHeader
        asChild
        className="px-5 py-4"
      >
        <button
          type="button"
          onClick={handleToggleExpanded}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <IconBox>
              <Lightbulb className="h-5 w-5" />
            </IconBox>
            <span className="text-base font-medium">About this plan</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
          )}
        </button>
      </SectionCardHeader>

      {isExpanded && (
        <SectionCardContent className="pt-4 pr-5 pb-5 pl-[4.25rem]">
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            This workplan breaks down your goal into{" "}
            <strong className="text-[var(--foreground)]">milestones</strong>.
            Each milestone contains specific{" "}
            <strong className="text-[var(--foreground)]">tasks</strong>. You
            work on completing tasks through conversations with the AI.
          </p>

          <ul className="mb-5 space-y-2 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>
                Some tasks have a{" "}
                <strong className="text-[var(--foreground)]">dependency</strong>{" "}
                (
                <span className="inline-flex items-center justify-center rounded bg-[var(--sage)]/10 p-1">
                  <Link2 className="h-3 w-3 text-[var(--sage)]" />
                </span>
                ) on other tasks—meaning they build on previous work and carry
                forward key insights.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>
                Complex tasks may include a{" "}
                <strong className="text-[var(--foreground)]">Workflow</strong> (
                <span className="inline-flex items-center justify-center rounded bg-[var(--copper)]/10 p-1">
                  <Zap className="h-3 w-3 text-[var(--copper)]" />
                </span>
                ) to guide you through structured steps.
              </span>
            </li>
          </ul>

          <h4 className="mb-3 text-sm font-medium">Using this page:</h4>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                <strong className="text-[var(--foreground)]">
                  Click on a task
                </strong>{" "}
                to start working on it through an AI conversation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                <strong className="text-[var(--foreground)]">
                  Mark tasks as done
                </strong>{" "}
                to track your progress toward the goal.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                <strong className="text-[var(--foreground)]">
                  Add or edit tasks
                </strong>{" "}
                as you go—plans are meant to evolve.
              </span>
            </li>
          </ul>
        </SectionCardContent>
      )}
    </SectionCard>
  );
};

interface TaskItemActionsProps {
  task: Task;
  onOpenDependencies: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskItemActions = ({
  task,
  onOpenDependencies,
  onEdit,
  onDelete,
}: TaskItemActionsProps): React.JSX.Element => {
  const handleComingSoon = useCallback(() => {
    toast.info("Coming soon");
  }, []);

  const handleOpenDeps = useCallback(() => {
    onOpenDependencies(task);
  }, [onOpenDependencies, task]);

  const handleEdit = useCallback(() => {
    onEdit(task);
  }, [onEdit, task]);

  const handleDelete = useCallback(() => {
    onDelete(task);
  }, [onDelete, task]);

  return (
    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/task:opacity-100">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleOpenDeps}
        title="Dependencies"
      >
        <Link2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleComingSoon}
        title="Move up"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleComingSoon}
        title="Move down"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleEdit}
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        onClick={handleDelete}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface TaskContentProps {
  task: Task;
  workflowTitle: string;
  onTitleClick: () => void;
  disabled?: boolean;
}

const getTaskTitleClassName = (disabled: boolean, isDone: boolean): string => {
  const base = "text-left font-medium";
  if (disabled)
    return `${base} text-[var(--muted-foreground)] cursor-not-allowed`;
  if (isDone)
    return `${base} cursor-pointer transition-colors hover:text-[var(--forest-green)] text-[var(--muted-foreground)]`;
  return `${base} cursor-pointer transition-colors hover:text-[var(--forest-green)]`;
};

const getTaskTitleHint = (disabled: boolean, hasThread: boolean): string => {
  if (disabled) return "Complete blocking tasks first";
  return hasThread ? "Continue conversation" : "Start conversation";
};

interface WorkflowBadgeProps {
  workflowTitle: string;
  disabled: boolean;
  onClick: () => void;
}

const WorkflowBadge = ({
  workflowTitle,
  disabled,
  onClick,
}: WorkflowBadgeProps): React.JSX.Element => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        className={`flex items-center justify-center rounded bg-[var(--copper)]/10 p-1 text-[var(--copper)] transition-colors ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-[var(--copper)]/20"
        }`}
        aria-disabled={disabled}
        aria-label={workflowTitle}
      >
        <Zap className="h-3 w-3" />
      </button>
    </TooltipTrigger>
    <TooltipContent>{workflowTitle}</TooltipContent>
  </Tooltip>
);

const TaskContent = ({
  task,
  workflowTitle,
  onTitleClick,
  disabled = false,
}: TaskContentProps): React.JSX.Element => {
  const dependencyCount = task.dependencies?.length ?? 0;
  const isDone = task.status === "done";

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={disabled ? undefined : onTitleClick}
          className={getTaskTitleClassName(disabled, isDone)}
          title={getTaskTitleHint(disabled, Boolean(task.thread_id))}
          aria-disabled={disabled}
        >
          {task.title}
        </button>
        {task.workflow_id && (
          <WorkflowBadge
            workflowTitle={workflowTitle}
            disabled={disabled}
            onClick={onTitleClick}
          />
        )}
        {dependencyCount > 0 && (
          <span
            className="flex items-center gap-1 rounded bg-[var(--sage)]/10 px-1.5 py-0.5 text-xs text-[var(--sage)]"
            title={`Builds upon ${dependencyCount} task${dependencyCount > 1 ? "s" : ""}`}
          >
            <Link2 className="h-3 w-3" />
            <span>{dependencyCount}</span>
          </span>
        )}
      </div>
      {task.description && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {task.description}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// Task Action Buttons
// =============================================================================

interface TaskActionButtonsProps {
  task: Task;
  isBlocked: boolean;
  onStart: () => void;
  onContinue: () => void;
  onMarkComplete: () => void;
}

/**
 * Action buttons for task cards.
 * Shows different buttons based on task state:
 * - Start: When task has no thread and is not blocked/done
 * - Continue + Mark complete: When task has thread and is not done
 * - Continue only: When task is done but has thread (for review)
 */
const TaskActionButtons = ({
  task,
  isBlocked,
  onStart,
  onContinue,
  onMarkComplete,
}: TaskActionButtonsProps): React.JSX.Element | null => {
  const hasThread = Boolean(task.thread_id);
  const isDone = task.status === "done";

  // No buttons if blocked
  if (isBlocked) {
    return null;
  }

  // Done task with thread: Show Continue only (to review conversation)
  if (isDone && hasThread) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onContinue}
            className="h-7 w-7"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sr-only">Continue</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Continue</TooltipContent>
      </Tooltip>
    );
  }

  // Done task without thread: No buttons
  if (isDone) {
    return null;
  }

  // Task with thread (not done): Show Continue + Mark complete
  if (hasThread) {
    return (
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onContinue}
              className="h-7 w-7"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">Continue</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Continue</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onMarkComplete}
              className="h-7 w-7"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="sr-only">Mark complete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark complete</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // Task without thread (not done): Show Start
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onStart}
          className="h-7 w-7"
        >
          <Play className="h-4 w-4" />
          <span className="sr-only">Start</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Start</TooltipContent>
    </Tooltip>
  );
};

// =============================================================================
// Task Item Component
// =============================================================================

interface TaskItemProps {
  task: Task;
  goalId: string;
  allTasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onOpenDependencies: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

// eslint-disable-next-line max-lines-per-function -- Complex task card with action buttons
const TaskItem = ({
  task,
  goalId,
  allTasks,
  onStatusChange,
  onOpenDependencies,
  onEdit,
  onDelete,
}: TaskItemProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { workflows } = useWorkflows();

  // Compute blocking state
  const { isBlocked, blockingTasks } = useMemo(
    () => getTaskBlockingInfo(task, allTasks),
    [task, allTasks],
  );

  const handleTitleClick = useCallback(() => {
    const targetUrl = task.thread_id
      ? `/?threadId=${task.thread_id}`
      : `/?goalId=${goalId}&taskId=${task.id}&taskTitle=${encodeURIComponent(task.title)}`;
    navigate(targetUrl);
  }, [navigate, task.thread_id, task.id, task.title, goalId]);

  // Handler for Start button - navigates to chat with task context
  const handleStart = useCallback(() => {
    const targetUrl = `/?goalId=${goalId}&taskId=${task.id}&taskTitle=${encodeURIComponent(task.title)}`;
    navigate(targetUrl);
  }, [navigate, goalId, task.id, task.title]);

  // Handler for Continue button - navigates to existing thread
  const handleContinue = useCallback(() => {
    navigate(`/?threadId=${task.thread_id}`);
  }, [navigate, task.thread_id]);

  // Handler for Mark complete button - sets status to done
  const handleMarkComplete = useCallback(() => {
    onStatusChange(task.id, "done");
  }, [task.id, onStatusChange]);

  const isDone = task.status === "done";
  const workflowTitle =
    workflows.find((w) => w.workflow_id === task.workflow_id)?.title ??
    "Workflow";

  // Compute container class based on state
  const getContainerClassName = (): string => {
    const baseClasses =
      "group/task flex flex-col gap-3 rounded-lg border p-4 transition-all";

    if (isBlocked) {
      return `${baseClasses} border-[var(--border)] bg-gray-50 opacity-70 cursor-not-allowed`;
    }
    if (isDone) {
      return `${baseClasses} border-[var(--border)] bg-[var(--sand)]/30 hover:border-[var(--sage)]`;
    }
    return `${baseClasses} border-[var(--border)] bg-white hover:border-[var(--sage)]`;
  };

  const taskContent = (
    <div
      className={getContainerClassName()}
      aria-disabled={isBlocked}
    >
      <div className="flex flex-1 items-start gap-3">
        <TaskStatusBadge
          status={task.status}
          disabled={isBlocked}
        />

        <TaskContent
          task={task}
          workflowTitle={workflowTitle}
          onTitleClick={handleTitleClick}
          disabled={isBlocked}
        />

        <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
          <TaskItemActions
            task={task}
            onOpenDependencies={onOpenDependencies}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <TaskActionButtons
            task={task}
            isBlocked={isBlocked}
            onStart={handleStart}
            onContinue={handleContinue}
            onMarkComplete={handleMarkComplete}
          />
        </div>
      </div>
    </div>
  );

  // Wrap with tooltip if blocked
  if (isBlocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed">{taskContent}</div>
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align="start"
            sideOffset={8}
            avoidCollisions={false}
            className="z-50 max-w-sm rounded-md border border-gray-200 bg-white p-3 text-gray-900 shadow-lg"
          >
            <BlockedTaskTooltipContent blockingTasks={blockingTasks} />
            <TooltipPrimitive.Arrow className="fill-white" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </Tooltip>
    );
  }

  return taskContent;
};

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  goalId: string;
  allTasks: Task[];
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddTask: (milestoneId: string, milestoneTitle: string) => void;
  onOpenDependencies: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestone: Milestone) => void;
}

// eslint-disable-next-line max-lines-per-function -- Milestone card with task list and actions
const MilestoneCard = ({
  milestone,
  index,
  goalId,
  allTasks,
  onTaskStatusChange,
  onAddTask,
  onOpenDependencies,
  onEditTask,
  onDeleteTask,
  onEditMilestone,
  onDeleteMilestone,
}: MilestoneCardProps): React.JSX.Element => {
  const completedTasks = milestone.tasks.filter(
    (t) => t.status === "done",
  ).length;
  const totalTasks = milestone.tasks.length;
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleMoveUp = useCallback(() => {
    toast.info("Coming soon");
  }, []);

  const handleMoveDown = useCallback(() => {
    toast.info("Coming soon");
  }, []);

  return (
    <SectionCard>
      {/* Header with subtle background */}
      <SectionCardHeader className="group/milestone-header flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Horizontal Progress Bar - LEFT of header text */}
          <div className="mt-1.5 h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--sand)]">
            <div
              className="h-full bg-[var(--forest-green)] transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div>
            <div className="mb-1 text-xs font-light tracking-wide text-[var(--muted-foreground)] uppercase">
              Milestone {index + 1}
            </div>
            <h3 className="text-lg font-semibold">{milestone.title}</h3>
            {milestone.description && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {milestone.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - TOP RIGHT (show on hover) */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/milestone-header:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleMoveUp}
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleMoveDown}
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            // eslint-disable-next-line react/jsx-no-bind -- Closure needed for milestone item
            onClick={() => onEditMilestone(milestone)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            // eslint-disable-next-line react/jsx-no-bind -- Closure needed for milestone item
            onClick={() => onDeleteMilestone(milestone)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </SectionCardHeader>

      {/* Tasks Content Area */}
      <SectionCardContent>
        {/* Tasks (always visible, no collapse) */}
        <div className="space-y-3">
          {milestone.tasks
            .sort((a, b) => a.order_index - b.order_index)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                goalId={goalId}
                allTasks={allTasks}
                onStatusChange={onTaskStatusChange}
                onOpenDependencies={onOpenDependencies}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
        </div>

        {/* Add Task Button */}
        <AddItemButton
          label="Add Task"
          size="sm"
          // eslint-disable-next-line react/jsx-no-bind -- Closure needed for milestone item
          onClick={() => onAddTask(milestone.id, milestone.title)}
          className="mt-4"
        />
      </SectionCardContent>
    </SectionCard>
  );
};

const LoadingState = (): React.JSX.Element => (
  <div className="flex h-full items-center justify-center bg-[var(--background)]">
    <div className="text-center">
      <Target className="mx-auto mb-2 h-8 w-8 animate-pulse text-[var(--muted-foreground)]" />
      <p className="text-[var(--muted-foreground)]">Loading goal...</p>
    </div>
  </div>
);

const ErrorState = ({
  error,
  onBack,
}: {
  error: Error;
  onBack: () => void;
}): React.JSX.Element => (
  <div className="flex h-full flex-col items-center justify-center bg-[var(--background)]">
    <div className="text-center">
      <Target className="mx-auto mb-4 h-12 w-12 text-[var(--destructive)]" />
      <h3 className="mb-2">Failed to load goal</h3>
      <p className="mx-auto mb-4 max-w-md text-sm text-[var(--muted-foreground)]">
        {error.message}
      </p>
      <Button onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Goals
      </Button>
    </div>
  </div>
);

// =============================================================================
// Main Component
// =============================================================================

// eslint-disable-next-line max-lines-per-function, complexity -- Page component with multiple dialogs
const GoalDetailPage = (): React.JSX.Element => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const fetchWithAuth = useAuthenticatedFetch();
  const { goal, isLoading, error, mutate } = useGoal(goalId);

  // Poll while goal is generating
  useEffect(() => {
    if (goal?.status !== "generating") return;

    const intervalId = setInterval(() => mutate(), 3000);
    return () => clearInterval(intervalId);
  }, [goal?.status, mutate]);

  // Track previous status to detect transition to failed
  const prevStatusRef = useRef<GoalStatus | undefined>(undefined);

  // Show toast when status changes from generating to failed
  useEffect(() => {
    if (prevStatusRef.current === "generating" && goal?.status === "failed") {
      toast.error(goal.error_message ?? "Failed to generate plan");
    }
    prevStatusRef.current = goal?.status;
  }, [goal?.status, goal?.error_message]);

  // Dialog state
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [dependenciesTask, setDependenciesTask] = useState<Task | null>(null);

  // Edit dialog state
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(
    null,
  );

  // Delete dialog state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = useCallback(() => {
    navigate("/goals");
  }, [navigate]);

  const handleAddMilestone = useCallback(() => {
    setIsMilestoneDialogOpen(true);
  }, []);

  const handleTaskStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      try {
        await updateTask(fetchWithAuth, taskId, { status });
        mutate();
        toast.success(`Task marked as ${status.replace("_", " ")}`);
      } catch (err) {
        console.error("Failed to update task:", err);
        toast.error("Failed to update task");
      }
    },
    [fetchWithAuth, mutate],
  );

  const handleAddTask = useCallback(
    (milestoneId: string, milestoneTitle: string) => {
      setSelectedMilestone({ id: milestoneId, title: milestoneTitle });
      setIsTaskDialogOpen(true);
    },
    [],
  );

  const handleOpenDependencies = useCallback((task: Task) => {
    setDependenciesTask(task);
  }, []);

  // Edit handlers
  const handleEditTask = useCallback((task: Task) => {
    setTaskToEdit(task);
  }, []);

  const handleEditMilestone = useCallback((milestone: Milestone) => {
    setMilestoneToEdit(milestone);
  }, []);

  // Delete handlers
  const handleDeleteTask = useCallback((task: Task) => {
    setTaskToDelete(task);
  }, []);

  const handleDeleteMilestone = useCallback((milestone: Milestone) => {
    setMilestoneToDelete(milestone);
  }, []);

  const handleConfirmDeleteTask = useCallback(async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(fetchWithAuth, taskToDelete.id);
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
      mutate();
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  }, [fetchWithAuth, taskToDelete, mutate]);

  const handleConfirmDeleteMilestone = useCallback(async () => {
    if (!milestoneToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMilestone(fetchWithAuth, milestoneToDelete.id);
      toast.success("Milestone deleted successfully");
      setMilestoneToDelete(null);
      mutate();
    } catch (err) {
      console.error("Failed to delete milestone:", err);
      toast.error("Failed to delete milestone");
    } finally {
      setIsDeleting(false);
    }
  }, [fetchWithAuth, milestoneToDelete, mutate]);

  // Compute all tasks from all milestones for dependency checking
  const allTasks = useMemo(() => {
    if (!goal) return [];
    return goal.milestones.flatMap((m) => m.tasks);
  }, [goal]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        onBack={handleBack}
      />
    );
  }

  // No goal found
  if (!goal) {
    return (
      <ErrorState
        error={new Error("Goal not found")}
        onBack={handleBack}
      />
    );
  }

  // Generating state - show skeleton while plan is being created
  if (goal.status === "generating") {
    const { completed, total } = calculateProgress(goal.milestones);
    const remaining = total - completed;

    return (
      <Page>
        <PageHeader
          title={goal.title}
          subtitle={goal.description}
          backButton={{
            label: "Back to Goals",
            onClick: handleBack,
          }}
          progress={{
            completed,
            total,
            label: `${completed} completed • ${remaining} remaining`,
          }}
        />
        <div className="mx-auto max-w-4xl px-6 py-6">
          <GoalGeneratingSkeleton />
        </div>
      </Page>
    );
  }

  // Failed state - show error message with back button
  if (goal.status === "failed") {
    const { completed, total } = calculateProgress(goal.milestones);
    const remaining = total - completed;

    return (
      <Page>
        <PageHeader
          title={goal.title}
          subtitle={goal.description}
          backButton={{
            label: "Back to Goals",
            onClick: handleBack,
          }}
          progress={{
            completed,
            total,
            label: `${completed} completed • ${remaining} remaining`,
          }}
        />
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-red-800">
              Plan Generation Failed
            </h3>
            <p className="mb-4 text-sm text-red-600">
              {goal.error_message ??
                "An error occurred while generating your plan"}
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Goals
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  const { completed, total } = calculateProgress(goal.milestones);
  const remaining = total - completed;

  return (
    <>
      <Page>
        <PageHeader
          title={goal.title}
          subtitle={goal.description}
          backButton={{
            label: "Back to Goals",
            onClick: handleBack,
          }}
          progress={{
            completed,
            total,
            label: `${completed} completed • ${remaining} remaining`,
          }}
        />
        <PageContent>
          {/* About this plan */}
          <AboutPlanSection />

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Milestones</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMilestone}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </div>

            {goal.milestones.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] py-12 text-center">
                <Target className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
                <h3 className="mb-2">No milestones yet</h3>
                <p className="mx-auto mb-4 max-w-md text-sm text-[var(--muted-foreground)]">
                  Add milestones to break down your goal into manageable phases.
                </p>
                <Button onClick={handleAddMilestone}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Milestone
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {goal.milestones
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((milestone, index) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      index={index}
                      goalId={goal.id}
                      allTasks={allTasks}
                      onTaskStatusChange={handleTaskStatusChange}
                      onAddTask={handleAddTask}
                      onOpenDependencies={handleOpenDependencies}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onEditMilestone={handleEditMilestone}
                      onDeleteMilestone={handleDeleteMilestone}
                    />
                  ))}

                {/* Add Milestone Button */}
                <AddItemButton
                  label="Add Milestone"
                  onClick={handleAddMilestone}
                />
              </div>
            )}
          </div>
        </PageContent>
      </Page>

      {/* Dialogs */}
      <CreateMilestoneDialog
        open={isMilestoneDialogOpen}
        onOpenChange={setIsMilestoneDialogOpen}
        goalId={goal.id}
        onMilestoneCreated={mutate}
      />

      {selectedMilestone && (
        <CreateTaskDialog
          open={isTaskDialogOpen}
          // eslint-disable-next-line react/jsx-no-bind -- Dialog state handler
          onOpenChange={(open) => {
            setIsTaskDialogOpen(open);
            if (!open) {
              setSelectedMilestone(null);
            }
          }}
          milestoneId={selectedMilestone.id}
          milestoneName={selectedMilestone.title}
          onTaskCreated={mutate}
        />
      )}

      {dependenciesTask && (
        <TaskDependenciesDialog
          open={!!dependenciesTask}
          // eslint-disable-next-line react/jsx-no-bind -- Dialog state handler
          onOpenChange={(open) => !open && setDependenciesTask(null)}
          task={dependenciesTask}
          allMilestones={goal.milestones}
          onDependenciesUpdated={mutate}
        />
      )}

      {/* Edit Task Dialog */}
      {taskToEdit && (
        <EditTaskDialog
          open={!!taskToEdit}
          // eslint-disable-next-line react/jsx-no-bind -- Dialog state handler
          onOpenChange={(open) => !open && setTaskToEdit(null)}
          task={taskToEdit}
          onTaskUpdated={mutate}
        />
      )}

      {/* Edit Milestone Dialog */}
      {milestoneToEdit && (
        <EditMilestoneDialog
          open={!!milestoneToEdit}
          // eslint-disable-next-line react/jsx-no-bind -- Dialog state handler
          onOpenChange={(open) => !open && setMilestoneToEdit(null)}
          milestone={milestoneToEdit}
          onMilestoneUpdated={mutate}
        />
      )}

      {/* Delete Task Confirmation Dialog */}
      {taskToDelete && (
        <DeleteConfirmationDialog
          open={!!taskToDelete}
          // eslint-disable-next-line react/jsx-no-bind -- Dialog state handler
          onOpenChange={(open) => !open && setTaskToDelete(null)}
          title="Delete task"
          description="This action cannot be undone."
          itemName={taskToDelete.title}
          onConfirm={handleConfirmDeleteTask}
          isDeleting={isDeleting}
        />
      )}

      {/* Delete Milestone Confirmation Dialog */}
      {milestoneToDelete && (
        <DeleteConfirmationDialog
          open={!!milestoneToDelete}
          // eslint-disable-next-line react/jsx-no-bind -- Dialog state handler
          onOpenChange={(open) => !open && setMilestoneToDelete(null)}
          title="Delete milestone"
          description="This will also delete all tasks within this milestone. This action cannot be undone."
          itemName={milestoneToDelete.title}
          onConfirm={handleConfirmDeleteMilestone}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default GoalDetailPage;

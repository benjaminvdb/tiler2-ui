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
  Target,
  Plus,
  ChevronDown,
  ChevronUp,
  Link2,
  Zap,
  Pencil,
  Trash2,
  Play,
  CheckCircle2,
  MessageSquare,
  ListChecks,
  OctagonAlert,
} from "lucide-react";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { useWorkflows } from "@/core/hooks/use-workflows";
import { useGoal } from "@/features/goals/hooks";
import {
  updateTask,
  updateMilestone,
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Page } from "@/shared/components/ui/page";
import { PageContent } from "@/shared/components/ui/page-content";
import {
  PageHeader,
  type StatItemConfig,
} from "@/shared/components/ui/page-header";
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

const calculateGoalStats = (
  milestones: Milestone[],
  allTasks: Task[],
): StatItemConfig[] => {
  const workflowsCount = allTasks.filter((t) => t.workflow_id).length;
  const blockedCount = allTasks.filter(
    (t) => getTaskBlockingInfo(t, allTasks).isBlocked,
  ).length;

  return [
    {
      icon: Target,
      value: milestones.length,
      label: "milestones",
      tooltip: "Major phases that organize your work",
      iconColor: "forest-green",
    },
    {
      icon: ListChecks,
      value: allTasks.length,
      label: "tasks",
      tooltip: "Individual tasks you work on through AI chats",
      iconColor: "forest-green",
    },
    {
      icon: Zap,
      value: workflowsCount,
      label: "workflows",
      tooltip: "Structured step-by-step guides for complex tasks",
      iconColor: "copper",
    },
    {
      icon: OctagonAlert,
      value: blockedCount,
      label: "blocked",
      tooltip: "Tasks waiting on dependencies to be completed",
      iconColor: "copper",
    },
  ];
};

// =============================================================================
// Components
// =============================================================================

interface TaskItemActionsProps {
  task: Task;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (task: Task) => void;
  onMoveDown: (task: Task) => void;
  onOpenDependencies: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskItemActions = ({
  task,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onOpenDependencies,
  onEdit,
  onDelete,
}: TaskItemActionsProps): React.JSX.Element => {
  const handleOpenDeps = useCallback(() => {
    onOpenDependencies(task);
  }, [onOpenDependencies, task]);

  const handleMoveUp = useCallback(() => {
    onMoveUp(task);
  }, [onMoveUp, task]);

  const handleMoveDown = useCallback(() => {
    onMoveDown(task);
  }, [onMoveDown, task]);

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
        onClick={handleMoveUp}
        disabled={isFirst}
        title="Move up"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleMoveDown}
        disabled={isLast}
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
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (task: Task) => void;
  onMoveDown: (task: Task) => void;
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
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
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
      ? `/?threadId=${task.thread_id}&goalId=${goalId}&taskId=${task.id}`
      : `/?goalId=${goalId}&taskId=${task.id}`;
    navigate(targetUrl);
  }, [navigate, task.thread_id, task.id, goalId]);

  // Handler for Start button - navigates to chat with task context
  const handleStart = useCallback(() => {
    const targetUrl = `/?goalId=${goalId}&taskId=${task.id}`;
    navigate(targetUrl);
  }, [navigate, goalId, task.id]);

  // Handler for Continue button - navigates to existing thread
  const handleContinue = useCallback(() => {
    navigate(`/?threadId=${task.thread_id}&goalId=${goalId}&taskId=${task.id}`);
  }, [navigate, task.thread_id, goalId, task.id]);

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
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
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
  isFirst: boolean;
  isLast: boolean;
  onMilestoneMove: (milestone: Milestone, direction: "up" | "down") => void;
  onTaskMove: (task: Task, direction: "up" | "down") => void;
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
  isFirst,
  isLast,
  onMilestoneMove,
  onTaskMove,
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
    onMilestoneMove(milestone, "up");
  }, [onMilestoneMove, milestone]);

  const handleMoveDown = useCallback(() => {
    onMilestoneMove(milestone, "down");
  }, [onMilestoneMove, milestone]);

  const handleTaskMoveUp = useCallback(
    (task: Task) => {
      onTaskMove(task, "up");
    },
    [onTaskMove],
  );

  const handleTaskMoveDown = useCallback(
    (task: Task) => {
      onTaskMove(task, "down");
    },
    [onTaskMove],
  );

  // Sort tasks by order_index for determining first/last
  const sortedTasks = useMemo(
    () => [...milestone.tasks].sort((a, b) => a.order_index - b.order_index),
    [milestone.tasks],
  );

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
            disabled={isFirst}
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleMoveDown}
            disabled={isLast}
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
             
            onClick={() => onEditMilestone(milestone)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
             
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
          {sortedTasks.map((task, taskIndex) => (
            <TaskItem
              key={task.id}
              task={task}
              goalId={goalId}
              allTasks={allTasks}
              isFirst={taskIndex === 0}
              isLast={taskIndex === sortedTasks.length - 1}
              onMoveUp={handleTaskMoveUp}
              onMoveDown={handleTaskMoveDown}
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

  // Move milestone up or down
  const handleMilestoneMove = useCallback(
    async (milestone: Milestone, direction: "up" | "down") => {
      if (!goal) return;

      const sortedMilestones = [...goal.milestones].sort(
        (a, b) => a.order_index - b.order_index,
      );
      const currentIndex = sortedMilestones.findIndex(
        (m) => m.id === milestone.id,
      );

      // Find the adjacent milestone
      const adjacentIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (adjacentIndex < 0 || adjacentIndex >= sortedMilestones.length) return;

      const adjacentMilestone = sortedMilestones[adjacentIndex];

      // Swap order_index values
      const currentOrderIndex = milestone.order_index;
      const adjacentOrderIndex = adjacentMilestone.order_index;

      try {
        // Update both milestones in parallel
        await Promise.all([
          updateMilestone(fetchWithAuth, milestone.id, {
            order_index: adjacentOrderIndex,
          }),
          updateMilestone(fetchWithAuth, adjacentMilestone.id, {
            order_index: currentOrderIndex,
          }),
        ]);
        mutate();
      } catch (err) {
        console.error("Failed to move milestone:", err);
        toast.error("Failed to move milestone");
      }
    },
    [fetchWithAuth, goal, mutate],
  );

  // Move task up or down within its milestone
  const handleTaskMove = useCallback(
    async (task: Task, direction: "up" | "down") => {
      if (!goal) return;

      // Find the milestone containing this task
      const milestone = goal.milestones.find((m) => m.id === task.milestone_id);
      if (!milestone) return;

      const sortedTasks = [...milestone.tasks].sort(
        (a, b) => a.order_index - b.order_index,
      );
      const currentIndex = sortedTasks.findIndex((t) => t.id === task.id);

      // Find the adjacent task
      const adjacentIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (adjacentIndex < 0 || adjacentIndex >= sortedTasks.length) return;

      const adjacentTask = sortedTasks[adjacentIndex];

      // Swap order_index values
      const currentOrderIndex = task.order_index;
      const adjacentOrderIndex = adjacentTask.order_index;

      try {
        // Update both tasks in parallel
        await Promise.all([
          updateTask(fetchWithAuth, task.id, {
            order_index: adjacentOrderIndex,
          }),
          updateTask(fetchWithAuth, adjacentTask.id, {
            order_index: currentOrderIndex,
          }),
        ]);
        mutate();
      } catch (err) {
        console.error("Failed to move task:", err);
        toast.error("Failed to move task");
      }
    },
    [fetchWithAuth, goal, mutate],
  );

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
    return (
      <Page>
        <PageHeader
          title={<Skeleton className="h-8 w-80" />}
          subtitle={
            <div className="space-y-2">
              <Skeleton className="h-5 w-full max-w-lg" />
              <Skeleton className="h-5 w-3/4 max-w-md" />
            </div>
          }
          backButton={{
            label: "Back to Goals",
            onClick: handleBack,
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
    const stats = calculateGoalStats(goal.milestones, allTasks);

    return (
      <Page>
        <PageHeader
          title={goal.title}
          subtitle={goal.description}
          backButton={{
            label: "Back to Goals",
            onClick: handleBack,
          }}
          stats={stats}
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
  const stats = calculateGoalStats(goal.milestones, allTasks);

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
          stats={stats}
          progress={{
            completed,
            total,
            label: `${completed} completed • ${remaining} remaining`,
          }}
        />
        <PageContent>
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
                  .map((milestone, index, sortedArray) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      index={index}
                      goalId={goal.id}
                      allTasks={allTasks}
                      isFirst={index === 0}
                      isLast={index === sortedArray.length - 1}
                      onMilestoneMove={handleMilestoneMove}
                      onTaskMove={handleTaskMove}
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
           
          onOpenChange={(open) => !open && setTaskToEdit(null)}
          task={taskToEdit}
          onTaskUpdated={mutate}
        />
      )}

      {/* Edit Milestone Dialog */}
      {milestoneToEdit && (
        <EditMilestoneDialog
          open={!!milestoneToEdit}
           
          onOpenChange={(open) => !open && setMilestoneToEdit(null)}
          milestone={milestoneToEdit}
          onMilestoneUpdated={mutate}
        />
      )}

      {/* Delete Task Confirmation Dialog */}
      {taskToDelete && (
        <DeleteConfirmationDialog
          open={!!taskToDelete}
           
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

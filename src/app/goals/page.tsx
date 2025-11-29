/**
 * Goals List Page
 *
 * Displays all user goals with progress indicators and allows creating new goals.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Target, Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useGoals } from "@/features/goals/hooks";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import {
  CreateGoalWizard,
  DeleteConfirmationDialog,
} from "@/features/goals/components";
import {
  getCategoryById,
  ICON_MAP,
  FallbackIcon,
} from "@/features/goals/constants";
import { deleteGoal } from "@/features/goals/services";
import type {
  GoalListItem,
  GoalCategory,
  GoalStatus,
} from "@/features/goals/types";

const getCategoryIcon = (category: GoalCategory): React.ReactNode => {
  const categoryDef = getCategoryById(category);
  if (!categoryDef) return <FallbackIcon className="h-4 w-4" />;
  const Icon = ICON_MAP[categoryDef.icon];
  if (!Icon) return <FallbackIcon className="h-4 w-4" />;
  return <Icon className="h-4 w-4" />;
};

const getCategoryLabel = (category: GoalCategory): string => {
  const categoryDef = getCategoryById(category);
  return categoryDef?.name ?? "Other";
};

const getStatusStyles = (
  status: GoalStatus,
): { bg: string; text: string; label: string; className?: string } => {
  switch (status) {
    case "generating":
      return {
        bg: "bg-[var(--sage)]/20",
        text: "text-[var(--sage)]",
        label: "Generating...",
        className: "animate-pulse",
      };
    case "failed":
      return {
        bg: "bg-red-100",
        text: "text-red-600",
        label: "Failed",
      };
    case "planning":
      return {
        bg: "bg-[var(--sand)]",
        text: "text-[var(--charcoal)]",
        label: "Planning",
      };
    case "in-progress":
      return {
        bg: "bg-[var(--sage)]/20",
        text: "text-[var(--forest-green)]",
        label: "In Progress",
      };
    case "completed":
      return {
        bg: "bg-[var(--forest-green)]/20",
        text: "text-[var(--forest-green)]",
        label: "Completed",
      };
    default:
      return {
        bg: "bg-[var(--sand)]",
        text: "text-[var(--charcoal)]",
        label: status,
      };
  }
};

const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

const STATUS_SECTIONS: Array<{
  status: GoalStatus;
  label: string;
}> = [
  { status: "generating", label: "Generating" },
  { status: "failed", label: "Failed" },
  { status: "in-progress", label: "In Progress" },
  { status: "planning", label: "Planning" },
  { status: "completed", label: "Completed" },
];

const groupGoalsByStatus = (
  goals: GoalListItem[],
): Record<GoalStatus, GoalListItem[]> => {
  const grouped: Record<GoalStatus, GoalListItem[]> = {
    generating: [],
    planning: [],
    "in-progress": [],
    completed: [],
    failed: [],
  };

  // Group goals by status
  goals.forEach((goal) => {
    grouped[goal.status].push(goal);
  });

  return grouped;
};

interface GoalsHeaderProps {
  count: number;
  onCreateGoal: () => void;
}

const GoalsHeader = ({
  count,
  onCreateGoal,
}: GoalsHeaderProps): React.JSX.Element => (
  <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-5">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Goals</h1>
          <p className="text-[var(--muted-foreground)]">
            Track your sustainability objectives with structured plans
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Target
              className="h-4 w-4"
              style={{ color: "var(--forest-green)" }}
            />
            <span className="text-[var(--muted-foreground)]">
              {count} goal{count !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onCreateGoal}
            className="flex items-center gap-2 rounded-lg bg-[var(--forest-green)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--forest-green)]/90"
          >
            <Plus className="h-4 w-4" />
            Create Goal
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface EmptyStateProps {
  onCreateGoal: () => void;
}

const EmptyState = ({ onCreateGoal }: EmptyStateProps): React.JSX.Element => (
  <div className="py-16 text-center">
    <Target className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
    <h3 className="mb-2">No goals created yet</h3>
    <p className="mx-auto mb-6 max-w-md text-[var(--muted-foreground)]">
      Create your first sustainability goal to start tracking progress with
      structured milestones and tasks.
    </p>
    <button
      type="button"
      onClick={onCreateGoal}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--forest-green)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--forest-green)]/90"
    >
      <Plus className="h-4 w-4" />
      Create Your First Goal
    </button>
  </div>
);

const LoadingState = (): React.JSX.Element => (
  <div className="flex h-full items-center justify-center bg-[var(--background)]">
    <div className="text-center">
      <Target className="mx-auto mb-2 h-8 w-8 animate-pulse text-[var(--muted-foreground)]" />
      <p className="text-[var(--muted-foreground)]">Loading goals...</p>
    </div>
  </div>
);

const GoalCardProgress = ({
  goal,
  isGenerating,
}: {
  goal: GoalListItem;
  isGenerating: boolean;
}): React.JSX.Element => {
  if (isGenerating) {
    return (
      <div
        className="mb-3"
        aria-live="polite"
      >
        <Skeleton className="mb-2 h-2 w-full rounded-full" />
        <div className="flex items-center justify-between text-xs">
          <span className="animate-pulse text-[var(--sage)]">
            Generating plan...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mb-3"
      aria-live="polite"
    >
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-[var(--sand)]">
        <div
          className="h-full rounded-full bg-[var(--forest-green)] transition-all duration-300"
          style={{
            width: `${calculateProgress(goal.tasks_completed, goal.tasks_total)}%`,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>
          {goal.tasks_completed} of {goal.tasks_total} tasks completed
        </span>
        <span>
          {calculateProgress(goal.tasks_completed, goal.tasks_total)}%
        </span>
      </div>
    </div>
  );
};

const GoalCardFooter = ({
  goal,
  isGenerating,
}: {
  goal: GoalListItem;
  isGenerating: boolean;
}): React.JSX.Element => (
  <div className="border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-foreground)]">
    {isGenerating ? (
      <Skeleton className="h-4 w-24" />
    ) : (
      <span>
        {goal.milestones_total} milestone
        {goal.milestones_total !== 1 ? "s" : ""}
      </span>
    )}
  </div>
);

interface GoalCardProps {
  goal: GoalListItem;
  onClick: () => void;
  onDelete: () => void;
}

const GoalCard = ({
  goal,
  onClick,
  onDelete,
}: GoalCardProps): React.JSX.Element => {
  const isGenerating = goal.status === "generating";
  const isFailed = goal.status === "failed";

  const handleClick = useCallback(() => {
    // Prevent navigation when generating
    if (!isGenerating) {
      onClick();
    }
  }, [isGenerating, onClick]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete],
  );

  return (
    <div
      role={isGenerating ? "status" : "button"}
      aria-busy={isGenerating}
      tabIndex={isGenerating ? -1 : 0}
      onClick={handleClick}
      // eslint-disable-next-line react/jsx-no-bind -- Keyboard accessibility handler
      onKeyDown={(e) => {
        if (!isGenerating && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
      className={cn(
        "group relative flex h-full w-full flex-col rounded-lg border bg-white p-5 text-left transition-all duration-200",
        isGenerating && "cursor-default border-[var(--border)]",
        isFailed &&
          "cursor-pointer border-red-300 hover:border-red-400 hover:shadow-sm",
        !isGenerating &&
          !isFailed &&
          "cursor-pointer border-[var(--border)] hover:border-[var(--sage)] hover:shadow-sm",
      )}
    >
      {/* Delete Button - visible on hover */}
      <button
        type="button"
        onClick={handleDeleteClick}
        className="absolute top-2 right-2 rounded p-1.5 text-[var(--muted-foreground)] opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
        title="Delete goal"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Header: Category */}
      <div className="mb-3 flex items-center gap-2 pr-6 text-sm text-[var(--muted-foreground)]">
        {getCategoryIcon(goal.category)}
        <span>{getCategoryLabel(goal.category)}</span>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-medium text-[var(--foreground)]">
        {goal.title}
      </h3>

      {/* Description (truncated) - flex-grow pushes footer down */}
      <div className="mb-4 flex-grow">
        {goal.description && (
          <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress - skeleton during generation */}
      <GoalCardProgress
        goal={goal}
        isGenerating={isGenerating}
      />

      {/* Footer: Milestones - skeleton during generation */}
      <GoalCardFooter
        goal={goal}
        isGenerating={isGenerating}
      />
    </div>
  );
};

const ErrorState = ({ error }: { error: Error }): React.JSX.Element => (
  <div className="flex h-full flex-col items-center justify-center bg-[var(--background)]">
    <div className="text-center">
      <Target className="mx-auto mb-4 h-12 w-12 text-[var(--destructive)]" />
      <h3 className="mb-2">Failed to load goals</h3>
      <p className="mx-auto max-w-md text-sm text-[var(--muted-foreground)]">
        {error.message}
      </p>
    </div>
  </div>
);

interface StatusSectionProps {
  status: GoalStatus;
  label: string;
  goals: GoalListItem[];
  onGoalClick: (goalId: string) => void;
  onGoalDelete: (goal: GoalListItem) => void;
}

const StatusSection = ({
  status,
  label,
  goals,
  onGoalClick,
  onGoalDelete,
}: StatusSectionProps): React.JSX.Element | null => {
  // Don't render empty sections
  if (goals.length === 0) return null;

  const statusStyles = getStatusStyles(status);

  return (
    <div className="mb-8 last:mb-0">
      {/* Section Header */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles.bg} ${statusStyles.text} ${statusStyles.className ?? ""}`}
        >
          {label}
        </span>
        <span className="text-sm text-[var(--muted-foreground)]">
          {goals.length} goal{goals.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            // eslint-disable-next-line react/jsx-no-bind -- Closure needed for list items
            onClick={() => onGoalClick(goal.id)}
            // eslint-disable-next-line react/jsx-no-bind -- Closure needed for list items
            onDelete={() => onGoalDelete(goal)}
          />
        ))}
      </div>
    </div>
  );
};

const GoalsPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const fetchWithAuth = useAuthenticatedFetch();
  const { goals, total, isLoading, error, mutate } = useGoals();

  // Poll while any goal is generating (SWR's refreshInterval has race condition issues)
  useEffect(() => {
    const hasGeneratingGoal = goals.some((g) => g.status === "generating");

    if (!hasGeneratingGoal) {
      return;
    }

    const intervalId = setInterval(() => {
      mutate();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [goals, mutate]);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<GoalListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Group goals by status for display (React Compiler handles memoization)
  const groupedGoals = groupGoalsByStatus(goals);

  const handleCreateGoal = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const handleGoalCreated = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleGoalClick = useCallback(
    (goalId: string) => {
      navigate(`/goals/${goalId}`);
    },
    [navigate],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!goalToDelete) return;

    setIsDeleting(true);
    try {
      await deleteGoal(fetchWithAuth, goalToDelete.id);
      toast.success("Goal deleted successfully");
      setGoalToDelete(null);
      mutate();
    } catch (err) {
      console.error("Failed to delete goal:", err);
      toast.error("Failed to delete goal");
    } finally {
      setIsDeleting(false);
    }
  }, [fetchWithAuth, goalToDelete, mutate]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <GoalsHeader
        count={total}
        onCreateGoal={handleCreateGoal}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6">
          {goals.length === 0 ? (
            <EmptyState onCreateGoal={handleCreateGoal} />
          ) : (
            <div>
              {STATUS_SECTIONS.map(({ status, label }) => (
                <StatusSection
                  key={status}
                  status={status}
                  label={label}
                  goals={groupedGoals[status]}
                  onGoalClick={handleGoalClick}
                  onGoalDelete={setGoalToDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Goal Wizard Modal */}
      <CreateGoalWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onGoalCreated={handleGoalCreated}
      />

      {/* Delete Goal Confirmation Dialog */}
      {goalToDelete && (
        <DeleteConfirmationDialog
          open={!!goalToDelete}
          // eslint-disable-next-line react/jsx-no-bind -- Dialog state handler
          onOpenChange={(open) => !open && setGoalToDelete(null)}
          title="Delete goal"
          description="This action cannot be undone. All milestones and tasks will be permanently deleted."
          itemName={goalToDelete.title}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default GoalsPage;

/**
 * Task Dependencies Dialog
 *
 * Modal for selecting which tasks the current task depends on.
 * Dependencies allow tasks to build upon context from previous tasks.
 */

import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Link2, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { IconBox } from "@/shared/components/ui/icon-box";
import { Button } from "@/shared/components/ui/button";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { updateTask } from "../services";
import type { Task, Milestone } from "../types";

// =============================================================================
// Types
// =============================================================================

interface TaskDependenciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  allMilestones: Milestone[];
  onDependenciesUpdated: () => void;
}

// =============================================================================
// Component
// =============================================================================

// eslint-disable-next-line max-lines-per-function -- Dialog component with list rendering
export const TaskDependenciesDialog = ({
  open,
  onOpenChange,
  task,
  allMilestones,
  onDependenciesUpdated,
}: TaskDependenciesDialogProps): React.JSX.Element => {
  const fetchWithAuth = useAuthenticatedFetch();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with current dependencies
  useEffect(() => {
    if (open && task) {
      setSelectedIds(task.dependencies.map((d) => d.depends_on_task_id));
    }
  }, [open, task]);

  // Group tasks by milestone, excluding current task
  // React Compiler handles memoization automatically
  const tasksByMilestone = allMilestones
    .map((m) => ({
      milestone: m,
      tasks: m.tasks.filter((t) => t.id !== task.id),
    }))
    .filter((g) => g.tasks.length > 0);

  const handleToggle = useCallback((taskId: string) => {
    setSelectedIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await updateTask(fetchWithAuth, task.id, { dependency_ids: selectedIds });
      toast.success("Dependencies updated");
      onOpenChange(false);
      onDependenciesUpdated();
    } catch (err) {
      console.error("Failed to update dependencies:", err);
      toast.error("Failed to update dependencies");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    fetchWithAuth,
    task.id,
    selectedIds,
    onOpenChange,
    onDependenciesUpdated,
  ]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <IconBox>
              <Link2 className="h-5 w-5" />
            </IconBox>
            <div>
              <DialogTitle>Task dependencies</DialogTitle>
              <DialogDescription>
                Select tasks to build upon. A summary of their conversations
                will be provided as context.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current Task Display */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--sand)]/30 p-4">
          <p className="text-xs text-[var(--muted-foreground)]">Current task</p>
          <p className="font-medium">{task.title}</p>
        </div>

        {/* Task List - Scrollable */}
        <div className="max-h-[400px] overflow-y-auto">
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">
            Select tasks to use as dependencies
          </p>

          {tasksByMilestone.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No other tasks available to select as dependencies.
            </div>
          ) : (
            tasksByMilestone.map(({ milestone, tasks }) => (
              <div
                key={milestone.id}
                className="mb-5"
              >
                <h4 className="mb-2 text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">
                  {milestone.title}
                </h4>
                <div className="space-y-1">
                  {tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                       
                      onClick={() => handleToggle(t.id)}
                      className="flex w-full items-start gap-3 rounded-md px-1 py-2 text-left transition-colors hover:bg-[var(--sand)]/50"
                    >
                      {/* Checkbox */}
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                          selectedIds.includes(t.id)
                            ? "border-[var(--forest-green)] bg-[var(--forest-green)] text-white"
                            : "border-[var(--muted-foreground)]/40"
                        }`}
                      >
                        {selectedIds.includes(t.id) && (
                          <Check
                            className="h-3 w-3"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{t.title}</p>
                        {t.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="text-sm text-[var(--muted-foreground)]">
            {selectedIds.length === 0
              ? "No dependencies selected"
              : `${selectedIds.length} ${selectedIds.length === 1 ? "dependency" : "dependencies"} selected`}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Dependencies"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

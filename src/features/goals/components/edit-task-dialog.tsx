/**
 * Edit Task Dialog
 *
 * Modal dialog for editing an existing task.
 */

import React, {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { useWorkflows } from "@/core/hooks/use-workflows";
import { updateTask } from "../services";
import type { Task } from "../types";

const NO_WORKFLOW = "none";

/**
 * Validates the task title and returns an error message if invalid.
 */
const validateTitle = (title: string): string | null => {
  const trimmed = title.trim();
  if (!trimmed) {
    return "Task title is required";
  }
  if (trimmed.length > 255) {
    return "Title must be 255 characters or less";
  }
  return null;
};

/**
 * Converts workflow ID from form state to API format (null for no workflow).
 */
const normalizeWorkflowId = (workflowId: string): string | null =>
  workflowId === NO_WORKFLOW ? null : workflowId;

/**
 * Checks if task form values have changed from original task.
 */
const hasTaskChanges = (
  task: Task,
  trimmedTitle: string,
  trimmedDescription: string,
  newWorkflowId: string | null,
): boolean => {
  const originalWorkflowId = task.workflow_id ?? null;
  return (
    trimmedTitle !== task.title ||
    trimmedDescription !== (task.description ?? "") ||
    newWorkflowId !== originalWorkflowId
  );
};

/**
 * Builds the update request from form values.
 */
const buildUpdateRequest = (
  task: Task,
  trimmedTitle: string,
  trimmedDescription: string,
  newWorkflowId: string | null,
): Parameters<typeof updateTask>[2] => {
  const originalWorkflowId = task.workflow_id ?? null;
  const workflowChanged = newWorkflowId !== originalWorkflowId;

  return {
    title: trimmedTitle,
    ...(trimmedDescription && { description: trimmedDescription }),
    ...(workflowChanged && { workflow_id: newWorkflowId }),
  };
};

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskUpdated: () => void;
}

// eslint-disable-next-line max-lines-per-function -- Dialog component with form state
export const EditTaskDialog = ({
  open,
  onOpenChange,
  task,
  onTaskUpdated,
}: EditTaskDialogProps): React.JSX.Element => {
  const fetchWithAuth = useAuthenticatedFetch();
  const { workflows } = useWorkflows();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [workflowId, setWorkflowId] = useState<string>(
    task.workflow_id ?? NO_WORKFLOW,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setWorkflowId(task.workflow_id ?? NO_WORKFLOW);
      setError(null);
    }
  }, [open, task.title, task.description, task.workflow_id]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const newWorkflowId = normalizeWorkflowId(workflowId);

    if (
      !hasTaskChanges(task, trimmedTitle, trimmedDescription, newWorkflowId)
    ) {
      handleOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const request = buildUpdateRequest(
        task,
        trimmedTitle,
        trimmedDescription,
        newWorkflowId,
      );
      await updateTask(fetchWithAuth, task.id, request);
      toast.success("Task updated successfully");
      handleOpenChange(false);
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to update task:", err);
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g., Review sustainability metrics"
                maxLength={255}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-description">Description (optional)</Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Describe what this task involves..."
                className="min-h-[80px]"
                maxLength={5000}
                disabled={isSubmitting}
              />
            </div>

            {workflows.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="task-workflow">Workflow (optional)</Label>
                <Select
                  value={workflowId}
                  onValueChange={setWorkflowId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="task-workflow"
                    className="w-full"
                  >
                    <SelectValue placeholder="Select a guided workflow...">
                      {workflowId && workflowId !== NO_WORKFLOW ? (
                        <span className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-[var(--copper)]" />
                          {
                            workflows.find((w) => w.workflow_id === workflowId)
                              ?.title
                          }
                        </span>
                      ) : (
                        "No workflow"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_WORKFLOW}>
                      <span className="text-[var(--muted-foreground)]">
                        No workflow
                      </span>
                    </SelectItem>
                    {workflows.map((workflow) => (
                      <SelectItem
                        key={workflow.workflow_id}
                        value={workflow.workflow_id}
                      >
                        <span className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-[var(--copper)]" />
                          {workflow.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Link a guided workflow to provide step-by-step assistance.
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

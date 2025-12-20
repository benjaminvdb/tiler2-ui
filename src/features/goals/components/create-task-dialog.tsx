/**
 * Create Task Dialog
 *
 * Modal dialog for adding a new task to a milestone.
 */

import React, { useState, FormEvent, ChangeEvent } from "react";
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
import { createTask } from "../services";

const NO_WORKFLOW = "none";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string;
  milestoneName: string;
  onTaskCreated: () => void;
}

// eslint-disable-next-line max-lines-per-function -- Dialog component with form state
export const CreateTaskDialog = ({
  open,
  onOpenChange,
  milestoneId,
  milestoneName,
  onTaskCreated,
}: CreateTaskDialogProps): React.JSX.Element => {
  const fetchWithAuth = useAuthenticatedFetch();
  const { workflows } = useWorkflows();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workflowId, setWorkflowId] = useState<string>(NO_WORKFLOW);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle("");
      setDescription("");
      setWorkflowId(NO_WORKFLOW);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Task title is required");
      return;
    }

    if (trimmedTitle.length > 255) {
      setError("Title must be 255 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      const request = {
        milestone_id: milestoneId,
        title: trimmedTitle,
        ...(description.trim() && { description: description.trim() }),
        ...(workflowId &&
          workflowId !== NO_WORKFLOW && { workflow_id: workflowId }),
      };
      await createTask(fetchWithAuth, request);
      toast.success("Task created successfully");
      handleOpenChange(false);
      onTaskCreated();
    } catch (err) {
      console.error("Failed to create task:", err);
      setError(err instanceof Error ? err.message : "Failed to create task");
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
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Add a new task to &ldquo;{milestoneName}&rdquo;
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
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

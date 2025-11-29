/**
 * Create Milestone Dialog
 *
 * Modal dialog for adding a new milestone to a goal.
 */

import React, { useState, useCallback, FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { createMilestone } from "../services";

interface CreateMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  onMilestoneCreated: () => void;
}

// eslint-disable-next-line max-lines-per-function -- Dialog component with form state
export const CreateMilestoneDialog = ({
  open,
  onOpenChange,
  goalId,
  onMilestoneCreated,
}: CreateMilestoneDialogProps): React.JSX.Element => {
  const fetchWithAuth = useAuthenticatedFetch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setTitle("");
        setDescription("");
        setError(null);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("Milestone title is required");
        return;
      }

      if (trimmedTitle.length > 255) {
        setError("Title must be 255 characters or less");
        return;
      }

      setIsSubmitting(true);
      try {
        const request = {
          goal_id: goalId,
          title: trimmedTitle,
          ...(description.trim() && { description: description.trim() }),
        };
        await createMilestone(fetchWithAuth, request);
        toast.success("Milestone created successfully");
        handleOpenChange(false);
        onMilestoneCreated();
      } catch (err) {
        console.error("Failed to create milestone:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create milestone",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      description,
      goalId,
      fetchWithAuth,
      handleOpenChange,
      onMilestoneCreated,
    ],
  );

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone to track progress on your goal.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="milestone-title">Title</Label>
              <Input
                id="milestone-title"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g., Data Collection & Analysis"
                maxLength={255}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="milestone-description">
                Description (optional)
              </Label>
              <Textarea
                id="milestone-description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Describe what this milestone involves..."
                className="min-h-[80px]"
                maxLength={5000}
                disabled={isSubmitting}
              />
            </div>

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
                "Create Milestone"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

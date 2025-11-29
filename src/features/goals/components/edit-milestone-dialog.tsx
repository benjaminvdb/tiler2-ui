/**
 * Edit Milestone Dialog
 *
 * Modal dialog for editing an existing milestone.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
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
import { updateMilestone } from "../services";
import type { Milestone } from "../types";

interface EditMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone;
  onMilestoneUpdated: () => void;
}

// eslint-disable-next-line max-lines-per-function -- Dialog component with form state
export const EditMilestoneDialog = ({
  open,
  onOpenChange,
  milestone,
  onMilestoneUpdated,
}: EditMilestoneDialogProps): React.JSX.Element => {
  const fetchWithAuth = useAuthenticatedFetch();
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when milestone changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitle(milestone.title);
      setDescription(milestone.description ?? "");
      setError(null);
    }
  }, [open, milestone.title, milestone.description]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
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

      // Check if anything has changed
      const trimmedDescription = description.trim();
      const hasChanges =
        trimmedTitle !== milestone.title ||
        trimmedDescription !== (milestone.description ?? "");

      if (!hasChanges) {
        handleOpenChange(false);
        return;
      }

      setIsSubmitting(true);
      try {
        const request = {
          title: trimmedTitle,
          ...(trimmedDescription && { description: trimmedDescription }),
        };
        await updateMilestone(fetchWithAuth, milestone.id, request);
        toast.success("Milestone updated successfully");
        handleOpenChange(false);
        onMilestoneUpdated();
      } catch (err) {
        console.error("Failed to update milestone:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update milestone",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      description,
      milestone,
      fetchWithAuth,
      handleOpenChange,
      onMilestoneUpdated,
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
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>
              Update the milestone details below.
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

/**
 * Dialog for renaming chat threads with validation and error handling.
 */
import { useState, FormEvent, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

interface RenameThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  currentTitle: string;
  onRename: (threadId: string, newTitle: string) => Promise<void>;
}

/**
 * Validate thread title and return error message if invalid
 */
function validateTitle(title: string): string | null {
  const trimmed = title.trim();

  if (trimmed === "") {
    return "Thread title cannot be empty";
  }

  if (trimmed.length > 100) {
    return "Thread title must be 100 characters or less";
  }

  return null;
}

/**
 * Form content for the rename dialog
 */
interface RenameFormProps {
  title: string;
  loading: boolean;
  error: string | null;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
}

const RenameForm: React.FC<RenameFormProps> = ({
  title,
  loading,
  error,
  handleTitleChange,
  handleSubmit,
  handleCancel,
}) => (
  <form onSubmit={handleSubmit}>
    <DialogHeader>
      <DialogTitle>Edit Thread Title</DialogTitle>
      <DialogDescription>
        Enter a new title for this conversation.
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="thread-title">Title</Label>
        <Input
          id="thread-title"
          className="h-12 text-base"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter thread title"
          maxLength={100}
          disabled={loading}
          autoFocus
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </div>

    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </Button>
    </DialogFooter>
  </form>
);

export const RenameThreadDialog = ({
  open,
  onOpenChange,
  threadId,
  currentTitle,
  onRename,
}: RenameThreadDialogProps): React.JSX.Element => {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const validationError = validateTitle(title);
      if (validationError) {
        setError(validationError);
        return;
      }

      const trimmedTitle = title.trim();
      if (trimmedTitle === currentTitle) {
        onOpenChange(false);
        return;
      }

      setLoading(true);
      try {
        await onRename(threadId, trimmedTitle);
        onOpenChange(false);
        setTitle(trimmedTitle);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to rename thread",
        );
      } finally {
        setLoading(false);
      }
    },
    [title, currentTitle, onOpenChange, onRename, threadId],
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setTitle(currentTitle);
        setError(null);
      }
      onOpenChange(newOpen);
    },
    [currentTitle, onOpenChange],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <RenameForm
          title={title}
          loading={loading}
          error={error}
          handleTitleChange={handleTitleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

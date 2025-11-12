import { useState, FormEvent } from "react";
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();

    // Validation
    if (trimmedTitle === "") {
      setError("Thread title cannot be empty");
      return;
    }

    if (trimmedTitle.length > 100) {
      setError("Thread title must be 100 characters or less");
      return;
    }

    // No change
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
      setError(err instanceof Error ? err.message : "Failed to rename thread");
    } finally {
      setLoading(false);
    }
  };

  // Reset state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(currentTitle);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-lg lg:max-w-xl xl:max-w-2xl">
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
                onChange={(e) => setTitle(e.target.value)}
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
              onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
};

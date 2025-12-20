/**
 * Dropdown menu providing rename and delete actions for chat threads.
 */
import { useState, useCallback } from "react";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/shared/components/ui/sidebar";
import { RenameThreadDialog } from "./dialogs/rename-thread-dialog";
import { DeleteThreadConfirmDialog } from "./dialogs/delete-thread-confirm-dialog";

interface ThreadActionsMenuProps {
  threadId: string;
  threadTitle: string;
  onRename: (threadId: string, newTitle: string) => Promise<void>;
  onDelete: (threadId: string) => Promise<void>;
}

export const ThreadActionsMenu = ({
  threadId,
  threadTitle,
  onRename,
  onDelete,
}: ThreadActionsMenuProps): React.JSX.Element => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /**
   * Prevents button click from triggering parent thread selection.
   */
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  /**
   * Prevents focus from returning to trigger button when dialog closes to avoid unwanted parent interactions.
   */
  const handleCloseAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handleRenameSelect = useCallback((e: Event) => {
    e.preventDefault();
    setRenameDialogOpen(true);
  }, []);

  const handleDeleteSelect = useCallback((e: Event) => {
    e.preventDefault();
    setDeleteDialogOpen(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <SidebarMenuAction
          showOnHover
          asChild
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={handleButtonClick}
              aria-label="Thread actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
        </SidebarMenuAction>
        <DropdownMenuContent
          align="end"
          className="w-40"
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          <DropdownMenuItem onSelect={handleRenameSelect}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename Thread
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleDeleteSelect}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Thread
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameThreadDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        threadId={threadId}
        currentTitle={threadTitle}
        onRename={onRename}
      />

      <DeleteThreadConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        threadId={threadId}
        threadTitle={threadTitle}
        onConfirm={onDelete}
      />
    </>
  );
};

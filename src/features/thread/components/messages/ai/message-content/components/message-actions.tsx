import { useState, useCallback } from "react";
import { BranchSwitcher } from "../../../shared/components/branch-switcher";
import { CommandBar } from "../../../shared/components/command-bar";
import { ExpertHelpDialog } from "../../../shared/components/expert-help-dialog";
import { Checkpoint } from "@langchain/langgraph-sdk";
import type { StreamContextType } from "@/core/providers/stream/types";
import type { MessageMetadata } from "@/shared/types";
import { cn } from "@/shared/utils/utils";

interface MessageMetadataWithBranch extends Partial<MessageMetadata> {
  branch?: string;
  branchOptions?: string[];
}

interface MessageActionsProps {
  contentString: string;
  htmlContainerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  meta: MessageMetadataWithBranch | null;
  thread: StreamContextType;
  parentCheckpoint: Checkpoint | null | undefined;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}
export const MessageActions: React.FC<MessageActionsProps> = ({
  contentString,
  htmlContainerRef,
  isLoading,
  meta,
  thread,
  parentCheckpoint,
  handleRegenerate,
}) => {
  const [isExpertHelpDialogOpen, setIsExpertHelpDialogOpen] = useState(false);

  const handleBranchSelect = useCallback(
    (branch: string) => {
      thread.setBranch(branch);
    },
    [thread],
  );

  const handleRegenerateClick = useCallback(() => {
    handleRegenerate(parentCheckpoint);
  }, [handleRegenerate, parentCheckpoint]);

  const handleExpertHelpClick = useCallback(() => {
    setIsExpertHelpDialogOpen(true);
  }, []);

  return (
    <>
      <div
        className={cn(
          "mr-auto flex items-center gap-2 transition-opacity duration-200",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        <BranchSwitcher
          branch={meta?.branch}
          branchOptions={meta?.branchOptions}
          onSelect={handleBranchSelect}
          isLoading={isLoading}
        />
        <CommandBar
          content={contentString}
          htmlContainerRef={htmlContainerRef}
          isLoading={isLoading}
          isAiMessage={true}
          handleRegenerate={handleRegenerateClick}
          onExpertHelpClick={handleExpertHelpClick}
        />
      </div>

      <ExpertHelpDialog
        open={isExpertHelpDialogOpen}
        onOpenChange={setIsExpertHelpDialogOpen}
        threadId={thread.threadId}
        runId={thread.currentRunId}
        aiMessageContent={contentString}
      />
    </>
  );
};

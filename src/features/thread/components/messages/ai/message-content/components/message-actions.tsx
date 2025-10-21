import { useState } from "react";
import { cn } from "@/shared/utils/utils";
import { BranchSwitcher } from "../../../shared/components/branch-switcher";
import { CommandBar } from "../../../shared/components/command-bar";
import { ExpertHelpDialog } from "../../../shared/components/expert-help-dialog";
import { Checkpoint } from "@langchain/langgraph-sdk";
import type { StreamContextType } from "@/core/providers/stream/types";
import type { MessageMetadata } from "@/shared/types";

interface MessageActionsProps {
  contentString: string;
  isLoading: boolean;
  meta: MessageMetadata | null;
  thread: StreamContextType;
  parentCheckpoint: Checkpoint | null | undefined;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}
export const MessageActions: React.FC<MessageActionsProps> = ({
  contentString,
  isLoading,
  meta,
  thread,
  parentCheckpoint,
  handleRegenerate,
}) => {
  const [isExpertHelpDialogOpen, setIsExpertHelpDialogOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "mr-auto flex items-center gap-2 transition-opacity",
          "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
        )}
      >
        <BranchSwitcher
          branch={(meta as any)?.branch}
          branchOptions={(meta as any)?.branchOptions}
          onSelect={(branch) => thread.setBranch(branch)}
          isLoading={isLoading}
        />
        <CommandBar
          content={contentString}
          isLoading={isLoading}
          isAiMessage={true}
          handleRegenerate={() => handleRegenerate(parentCheckpoint)}
          onExpertHelpClick={() => setIsExpertHelpDialogOpen(true)}
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

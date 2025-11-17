import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BranchSwitcher } from "../../../shared/components/branch-switcher";
import { CommandBar } from "../../../shared/components/command-bar";
import { ExpertHelpDialog } from "../../../shared/components/expert-help-dialog";
import { Checkpoint } from "@langchain/langgraph-sdk";
import type { StreamContextType } from "@/core/providers/stream/types";
import type { MessageMetadata } from "@/shared/types";

interface MessageActionsProps {
  contentString: string;
  htmlContainerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  meta: MessageMetadata | null;
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
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

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
        className="mr-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-2"
          style={{ pointerEvents: isHovered ? "auto" : "none" }}
        >
          <BranchSwitcher
            branch={(meta as any)?.branch}
            branchOptions={(meta as any)?.branchOptions}
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
        </motion.div>
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

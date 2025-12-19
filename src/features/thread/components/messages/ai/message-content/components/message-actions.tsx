import { useState, useCallback } from "react";
import { CommandBar } from "../../../shared/components/command-bar";
import { ExpertHelpDialog } from "../../../shared/components/expert-help-dialog";
import type { StreamContextType } from "@/core/providers/stream/stream-types";
import { cn } from "@/shared/utils/utils";

interface MessageActionsProps {
  contentString: string;
  htmlContainerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  thread: StreamContextType;
  messageId: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  contentString,
  htmlContainerRef,
  isLoading,
  thread,
  messageId,
}) => {
  const [isExpertHelpDialogOpen, setIsExpertHelpDialogOpen] = useState(false);

  const handleExpertHelpClick = useCallback(() => {
    setIsExpertHelpDialogOpen(true);
  }, []);

  const handleRegenerate = useCallback(() => {
    thread.regenerate({ messageId });
  }, [messageId, thread]);

  return (
    <>
      <div
        className={cn(
          "mr-auto flex items-center gap-2 transition-opacity duration-200",
          "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
        )}
      >
        <CommandBar
          content={contentString}
          htmlContainerRef={htmlContainerRef}
          isLoading={isLoading}
          isAiMessage={true}
          handleRegenerate={handleRegenerate}
          onExpertHelpClick={handleExpertHelpClick}
        />
      </div>

      <ExpertHelpDialog
        open={isExpertHelpDialogOpen}
        onOpenChange={setIsExpertHelpDialogOpen}
        threadId={thread.threadId}
        runId={null}
        aiMessageContent={contentString}
      />
    </>
  );
};

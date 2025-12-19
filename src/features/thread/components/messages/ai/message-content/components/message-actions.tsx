import { useState, useCallback } from "react";
import { CommandBar } from "../../../shared/components/command-bar";
import { ExpertHelpDialog } from "../../../shared/components/expert-help-dialog";
import type { UseCopilotChatReturn } from "@/core/providers/copilotkit";
import { cn } from "@/shared/utils/utils";

interface MessageActionsProps {
  contentString: string;
  htmlContainerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  chat: UseCopilotChatReturn;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  contentString,
  htmlContainerRef,
  isLoading,
  chat,
}) => {
  const [isExpertHelpDialogOpen, setIsExpertHelpDialogOpen] = useState(false);

  const handleExpertHelpClick = useCallback(() => {
    setIsExpertHelpDialogOpen(true);
  }, []);

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
          onExpertHelpClick={handleExpertHelpClick}
        />
      </div>

      <ExpertHelpDialog
        open={isExpertHelpDialogOpen}
        onOpenChange={setIsExpertHelpDialogOpen}
        threadId={chat.threadId ?? null}
        runId={null}
        aiMessageContent={contentString}
      />
    </>
  );
};

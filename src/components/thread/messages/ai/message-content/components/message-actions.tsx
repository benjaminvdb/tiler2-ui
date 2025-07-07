import { cn } from "@/lib/utils";
import { BranchSwitcher } from "../../../shared/components/branch-switcher";
import { CommandBar } from "../../../shared/components/command-bar";
import { Checkpoint } from "@langchain/langgraph-sdk";
import type { StreamContextType } from "@/providers/stream/types";
import type { MessageMetadata } from "@/types";

interface MessageActionsProps {
  contentString: string;
  isLoading: boolean;
  meta: MessageMetadata | null;
  thread: StreamContextType;
  parentCheckpoint: Checkpoint | null | undefined;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}

export function MessageActions({
  contentString,
  isLoading,
  meta,
  thread,
  parentCheckpoint,
  handleRegenerate,
}: MessageActionsProps) {
  return (
    <div
      className={cn(
        "mr-auto flex items-center gap-2 transition-opacity",
        "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
      )}
    >
      <BranchSwitcher
        branch={meta?.branch}
        branchOptions={meta?.branchOptions}
        onSelect={(branch) => thread.setBranch(branch)}
        isLoading={isLoading}
      />
      <CommandBar
        content={contentString}
        isLoading={isLoading}
        isAiMessage={true}
        handleRegenerate={() => handleRegenerate(parentCheckpoint)}
      />
    </div>
  );
}

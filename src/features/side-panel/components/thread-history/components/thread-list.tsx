import React, { useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Thread } from "@langchain/langgraph-sdk";
import { useSearchParamState } from "@/core/routing/hooks";
import { extractThreadDisplayText } from "../utils/thread-text-extractor";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { type NavigationService } from "@/core/services/navigation";

interface ThreadListItemProps {
  thread: Thread;
  currentThreadId: string | null;
  navigationService: NavigationService;
  onThreadClick?: (threadId: string) => void;
}

const ThreadListItem = React.memo(function ThreadListItem({
  thread,
  currentThreadId,
  navigationService,
  onThreadClick,
}: ThreadListItemProps) {
  const itemText = extractThreadDisplayText(thread);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onThreadClick?.(thread.thread_id);
      if (thread.thread_id === currentThreadId) return;

      navigationService.navigateToHome({ threadId: thread.thread_id });
    },
    [thread.thread_id, currentThreadId, navigationService, onThreadClick],
  );

  return (
    <div className="w-full px-1">
      <Button
        variant="ghost"
        className="w-full items-start justify-start text-left font-normal"
        onClick={handleClick}
      >
        <p className="w-full truncate text-ellipsis">{itemText}</p>
      </Button>
    </div>
  );
});

interface ThreadListProps {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}
export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  onThreadClick,
}) => {
  const [threadId] = useSearchParamState("threadId");
  const { navigationService } = useUIContext();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2">
      {threads.map((t) => (
        <ThreadListItem
          key={t.thread_id}
          thread={t}
          currentThreadId={threadId}
          navigationService={navigationService}
          {...(onThreadClick && { onThreadClick })}
        />
      ))}
    </div>
  );
};

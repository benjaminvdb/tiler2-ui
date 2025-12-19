import { useMemo } from "react";
import {
  AssistantIf,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAssistantApi,
  useAssistantState,
} from "@assistant-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/shared/components/ui/sidebar";
import { useSearchParamState } from "@/core/routing/hooks";

const ThreadListSkeleton = () => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <SidebarMenuItem key={i}>
        <SidebarMenuSkeleton showIcon />
      </SidebarMenuItem>
    ))}
  </>
);

const EmptyState = () => (
  <div className="px-2 py-4 text-center">
    <p className="text-muted-foreground text-xs">
      No chats yet. Start a new conversation!
    </p>
  </div>
);

const ThreadListItem = () => {
  const title = useAssistantState(
    ({ threadListItem }) => threadListItem.title ?? "New Chat",
  );

  return (
    <ThreadListItemPrimitive.Root className="group data-[active=true]:bg-foreground/5 flex items-center rounded-md px-1">
      <ThreadListItemPrimitive.Trigger
        className="hover:bg-muted data-[active=true]:bg-muted flex flex-1 items-center truncate rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none"
      >
        <span className="truncate">{title}</span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Delete asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground mr-1 hidden rounded-md p-1 transition-colors group-hover:block"
          aria-label="Delete thread"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </ThreadListItemPrimitive.Delete>
    </ThreadListItemPrimitive.Root>
  );
};

export const AssistantThreadList = () => {
  const api = useAssistantApi();

  const hasThreads = useAssistantState(
    ({ threads }) => (threads.threadIds?.length ?? 0) > 0,
  );
  const [, setThreadId] = useSearchParamState("threadId");

  const handleNewChat = useMemo(() => {
    return () => {
      api.threads().switchToNewThread();
      setThreadId(null);
    };
  }, [api, setThreadId]);

  return (
    <ThreadListPrimitive.Root className="flex flex-col gap-2">
      <ThreadListPrimitive.New asChild>
        <Button
          variant="outline"
          className="mb-2 w-full justify-start gap-2 rounded-lg px-3 text-sm"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </ThreadListPrimitive.New>

      <AssistantIf condition={({ threads }) => threads.isLoading}>
        <ThreadListSkeleton />
      </AssistantIf>

      <AssistantIf
        condition={({ threads }) => !threads.isLoading && hasThreads}
      >
        <ThreadListPrimitive.Items components={{ ThreadListItem }} />
      </AssistantIf>

      <AssistantIf
        condition={({ threads }) => !threads.isLoading && !hasThreads}
      >
        <EmptyState />
      </AssistantIf>
    </ThreadListPrimitive.Root>
  );
};

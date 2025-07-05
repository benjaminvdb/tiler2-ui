import { Button } from "@/components/ui/button";
import { Thread } from "@langchain/langgraph-sdk";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { ThreadList } from "./thread-list";
import { ThreadHistoryLoading } from "./thread-history-loading";

interface DesktopHistoryPanelProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  threads: Thread[];
  threadsLoading: boolean;
}

export function DesktopHistoryPanel({
  chatHistoryOpen,
  setChatHistoryOpen,
  threads,
  threadsLoading,
}: DesktopHistoryPanelProps) {
  return (
    <div className="shadow-inner-right hidden h-screen w-[300px] shrink-0 flex-col items-start justify-start gap-6 border-r-[1px] border-slate-300 lg:flex">
      <div className="flex w-full items-center justify-between px-4 pt-1.5">
        <Button
          className="hover:bg-gray-100"
          variant="ghost"
          onClick={() => setChatHistoryOpen((p) => !p)}
        >
          {chatHistoryOpen ? (
            <PanelRightOpen className="size-5" />
          ) : (
            <PanelRightClose className="size-5" />
          )}
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          Thread History
        </h1>
      </div>
      {threadsLoading ? (
        <ThreadHistoryLoading />
      ) : (
        <ThreadList threads={threads} />
      )}
    </div>
  );
}
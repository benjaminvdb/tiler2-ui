import { Thread } from "@langchain/langgraph-sdk";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThreadList } from "./thread-list";

interface MobileHistorySheetProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isLargeScreen: boolean;
  threads: Thread[];
}

export function MobileHistorySheet({
  chatHistoryOpen,
  setChatHistoryOpen,
  isLargeScreen,
  threads,
}: MobileHistorySheetProps) {
  return (
    <div className="lg:hidden">
      <Sheet
        open={!!chatHistoryOpen && !isLargeScreen}
        onOpenChange={(open) => {
          if (isLargeScreen) return;
          setChatHistoryOpen(open);
        }}
      >
        <SheetContent
          side="left"
          className="flex lg:hidden"
        >
          <SheetHeader>
            <SheetTitle>Thread History</SheetTitle>
          </SheetHeader>
          <ThreadList
            threads={threads}
            onThreadClick={() => setChatHistoryOpen((o) => !o)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ThreadIdCopyable } from "../../thread-id";
import { ButtonGroup } from "./button-group";
import { HeaderSectionProps } from "../types";

export function HeaderSection({
  threadTitle,
  threadId,
  apiUrl,
  onOpenInStudio,
  onShowState,
  onShowDescription,
  showingState,
  showingDescription,
}: HeaderSectionProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex items-center justify-start gap-3">
        <p className="text-2xl tracking-tighter text-pretty">{threadTitle}</p>
        {threadId && <ThreadIdCopyable threadId={threadId} />}
      </div>
      <div className="flex flex-row items-center justify-start gap-2">
        {apiUrl && (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 bg-white"
            onClick={onOpenInStudio}
          >
            Studio
          </Button>
        )}
        <ButtonGroup
          handleShowState={onShowState}
          handleShowDescription={onShowDescription}
          showingState={showingState}
          showingDescription={showingDescription}
        />
      </div>
    </div>
  );
}

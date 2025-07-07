import React from "react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { InboxItemInput } from "./inbox-item-input";
import { ThreadIdCopyable } from "./thread-id";
import { useInterruptedActions } from "../hooks/use-interrupted-actions";
import { constructOpenInStudioURL } from "../utils";

// Types
export interface ThreadActionsViewProps {
  interrupt: HumanInterrupt;
  handleShowSidePanel: (showState: boolean, showDescription: boolean) => void;
  showState: boolean;
  showDescription: boolean;
}

interface ButtonGroupProps {
  handleShowState: () => void;
  handleShowDescription: () => void;
  showingState: boolean;
  showingDescription: boolean;
}

interface HeaderSectionProps {
  threadTitle: string;
  threadId: string | null;
  apiUrl: string | null;
  onOpenInStudio: () => void;
  onShowState: () => void;
  onShowDescription: () => void;
  showingState: boolean;
  showingDescription: boolean;
}

interface ActionButtonsProps {
  onResolve: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  onIgnore: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  ignoreAllowed: boolean;
  actionsDisabled: boolean;
}

// Utility functions
const getThreadTitle = (interrupt: HumanInterrupt): string => {
  return interrupt.action_request.action || "Unknown";
};

const getActionsDisabled = (loading: boolean, streaming: boolean): boolean => {
  return loading || streaming;
};

const getIgnoreAllowed = (interrupt: HumanInterrupt): boolean => {
  return interrupt.config.allow_ignore;
};

// Hook
function useStudioHandler(apiUrl: string | null, threadId: string | null) {
  const handleOpenInStudio = () => {
    if (!apiUrl) {
      toast.error("Error", {
        description: "Please set the LangGraph deployment URL in settings.",
        duration: 5000,
        richColors: true,
        closeButton: true,
      });
      return;
    }

    const studioUrl = constructOpenInStudioURL(apiUrl, threadId ?? undefined);
    window.open(studioUrl, "_blank");
  };

  return { handleOpenInStudio };
}

// Sub-components
function ButtonGroup({
  handleShowState,
  handleShowDescription,
  showingState,
  showingDescription,
}: ButtonGroupProps) {
  return (
    <div className="flex flex-row items-center justify-center gap-0">
      <Button
        variant="outline"
        className={cn(
          "rounded-l-md rounded-r-none border-r-[0px]",
          showingState ? "text-black" : "bg-white",
        )}
        size="sm"
        onClick={handleShowState}
      >
        State
      </Button>
      <Button
        variant="outline"
        className={cn(
          "rounded-l-none rounded-r-md border-l-[0px]",
          showingDescription ? "text-black" : "bg-white",
        )}
        size="sm"
        onClick={handleShowDescription}
      >
        Description
      </Button>
    </div>
  );
}

function HeaderSection({
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

function ActionButtons({
  onResolve,
  onIgnore,
  ignoreAllowed,
  actionsDisabled,
}: ActionButtonsProps) {
  return (
    <div className="flex w-full flex-row items-center justify-start gap-2">
      <Button
        variant="outline"
        className="border-gray-500 bg-white font-normal text-gray-800"
        onClick={onResolve}
        disabled={actionsDisabled}
      >
        Mark as Resolved
      </Button>
      {ignoreAllowed && (
        <Button
          variant="outline"
          className="border-gray-500 bg-white font-normal text-gray-800"
          onClick={onIgnore}
          disabled={actionsDisabled}
        >
          Ignore
        </Button>
      )}
    </div>
  );
}

// Main component
export function ThreadActionsView({
  interrupt,
  handleShowSidePanel,
  showDescription,
  showState,
}: ThreadActionsViewProps) {
  const [threadId] = useQueryState("threadId");
  const [apiUrl] = useQueryState("apiUrl");

  const {
    acceptAllowed,
    hasEdited,
    hasAddedResponse,
    streaming,
    supportsMultipleMethods,
    streamFinished,
    loading,
    handleSubmit,
    handleIgnore,
    handleResolve,
    setSelectedSubmitType,
    setHasAddedResponse,
    setHasEdited,
    humanResponse,
    setHumanResponse,
    initialHumanInterruptEditValue,
  } = useInterruptedActions({
    interrupt,
  });

  const { handleOpenInStudio } = useStudioHandler(apiUrl, threadId);

  const threadTitle = getThreadTitle(interrupt);
  const actionsDisabled = getActionsDisabled(loading, streaming);
  const ignoreAllowed = getIgnoreAllowed(interrupt);

  return (
    <div className="flex min-h-full w-full flex-col gap-9">
      {/* Header */}
      <HeaderSection
        threadTitle={threadTitle}
        threadId={threadId}
        apiUrl={apiUrl}
        onOpenInStudio={handleOpenInStudio}
        onShowState={() => handleShowSidePanel(true, false)}
        onShowDescription={() => handleShowSidePanel(false, true)}
        showingState={showState}
        showingDescription={showDescription}
      />

      {/* Action Buttons */}
      <ActionButtons
        onResolve={handleResolve}
        onIgnore={handleIgnore}
        ignoreAllowed={ignoreAllowed}
        actionsDisabled={actionsDisabled}
      />

      {/* Actions */}
      <InboxItemInput
        acceptAllowed={acceptAllowed}
        hasEdited={hasEdited}
        hasAddedResponse={hasAddedResponse}
        interruptValue={interrupt}
        humanResponse={humanResponse}
        initialValues={initialHumanInterruptEditValue.current}
        setHumanResponse={setHumanResponse}
        streaming={streaming}
        streamFinished={streamFinished}
        supportsMultipleMethods={supportsMultipleMethods}
        setSelectedSubmitType={setSelectedSubmitType}
        setHasAddedResponse={setHasAddedResponse}
        setHasEdited={setHasEdited}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

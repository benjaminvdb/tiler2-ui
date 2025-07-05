import { useQueryState } from "nuqs";
import { InboxItemInput } from "../inbox-item-input";
import useInterruptedActions from "../../hooks/use-interrupted-actions";
import { ThreadActionsViewProps } from "./types";
import { HeaderSection } from "./components/header-section";
import { ActionButtons } from "./components/action-buttons";
import { useStudioHandler } from "./hooks/use-studio-handler";
import {
  getThreadTitle,
  getActionsDisabled,
  getIgnoreAllowed,
} from "./utils/thread-utils";

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

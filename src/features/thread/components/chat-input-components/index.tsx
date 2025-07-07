import React from "react";
import { ContentBlocksPreview } from "../content-blocks-preview";
import { Container } from "./components/container";
import { TextareaInput } from "./components/textarea-input";
import { InterruptIndicator } from "./components/interrupt-indicator";
import { ControlsSection } from "./components/controls-section";
import { ChatInputProps } from "./types";

const ChatInputComponent = ({
  input,
  onInputChange,
  onSubmit,
  onPaste,
  onFileUpload,
  contentBlocks,
  onRemoveBlock,
  isLoading,
  isRespondingToInterrupt,
  hideToolCalls,
  onHideToolCallsChange,
  onStop,
  dragOver,
  dropRef,
  chatStarted,
}: ChatInputProps) => {
  return (
    <Container
      dragOver={dragOver}
      chatStarted={chatStarted}
      dropRef={dropRef}
    >
      <form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2"
      >
        <ContentBlocksPreview
          blocks={contentBlocks}
          onRemove={onRemoveBlock}
        />
        <TextareaInput
          input={input}
          onInputChange={onInputChange}
          onPaste={onPaste}
          isRespondingToInterrupt={isRespondingToInterrupt}
        />
        <InterruptIndicator isRespondingToInterrupt={isRespondingToInterrupt} />
        <ControlsSection
          hideToolCalls={hideToolCalls}
          onHideToolCallsChange={onHideToolCallsChange}
          onFileUpload={onFileUpload}
          isLoading={isLoading}
          onStop={onStop}
          input={input}
          contentBlocks={contentBlocks}
        />
      </form>
    </Container>
  );
};

ChatInputComponent.displayName = "ChatInput";

export const ChatInput = React.memo(ChatInputComponent);

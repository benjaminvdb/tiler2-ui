import { ToolCallsToggle } from "./tool-calls-toggle";
import { FileUpload } from "./file-upload";
import { ActionButtons } from "./action-buttons";
import { ControlsSectionProps } from "../types";

export const ControlsSection: React.FC<ControlsSectionProps> = ({
  hideToolCalls,
  onHideToolCallsChange,
  onFileUpload,
  isLoading,
  onStop,
  input,
  contentBlocks,
}) => {
  return (
    <div className="flex items-center gap-6 p-2 pt-4">
      <ToolCallsToggle
        hideToolCalls={hideToolCalls}
        onHideToolCallsChange={onHideToolCallsChange}
      />
      <FileUpload onFileUpload={onFileUpload} />
      <ActionButtons
        isLoading={isLoading}
        onStop={onStop}
        input={input}
        contentBlocks={contentBlocks}
      />
    </div>
  );
};

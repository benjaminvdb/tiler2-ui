import React from "react";
import { XIcon, SendHorizontal, RefreshCcw, Pencil } from "lucide-react";
import { TooltipIconButton } from "../../../../tooltip-icon-button";
import { ContentCopyable } from "../content-copyable";
import { CommandBarProps } from "../../types";
import { shouldShowEditButton } from "./validation";

interface EditActionsProps {
  isLoading: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmitEdit: () => void;
}
const EditActions: React.FC<EditActionsProps> = ({
  isLoading,
  setIsEditing,
  handleSubmitEdit,
}) => {
  return (
    <div className="flex items-center gap-2">
      <TooltipIconButton
        disabled={isLoading}
        tooltip="Cancel edit"
        variant="ghost"
        onClick={() => setIsEditing(false)}
      >
        <XIcon />
      </TooltipIconButton>
      <TooltipIconButton
        disabled={isLoading}
        tooltip="Submit"
        variant="secondary"
        onClick={handleSubmitEdit}
      >
        <SendHorizontal />
      </TooltipIconButton>
    </div>
  );
};

interface MessageActionsProps {
  content: string;
  isLoading: boolean;
  isAiMessage?: boolean | undefined;
  showEdit: boolean;
  handleRegenerate?: (() => void) | undefined;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}
const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  isLoading,
  isAiMessage,
  showEdit,
  handleRegenerate,
  setIsEditing,
}) => {
  return (
    <div className="flex items-center gap-2">
      <ContentCopyable
        content={content}
        disabled={isLoading}
      />
      {isAiMessage && !!handleRegenerate && (
        <TooltipIconButton
          disabled={isLoading}
          tooltip="Refresh"
          variant="ghost"
          onClick={handleRegenerate}
        >
          <RefreshCcw />
        </TooltipIconButton>
      )}
      {showEdit && (
        <TooltipIconButton
          disabled={isLoading}
          tooltip="Edit"
          variant="ghost"
          onClick={() => setIsEditing?.(true)}
        >
          <Pencil />
        </TooltipIconButton>
      )}
    </div>
  );
};

export const CommandBar: React.FC<CommandBarProps> = ({
  content,
  isHumanMessage,
  isAiMessage,
  isEditing,
  setIsEditing,
  handleSubmitEdit,
  handleRegenerate,
  isLoading,
}) => {
  // Validation logic removed to avoid TypeScript strict optional property issues

  const showEdit = shouldShowEditButton(
    isHumanMessage,
    isEditing,
    setIsEditing,
    handleSubmitEdit,
  );

  const isInEditMode =
    isHumanMessage && isEditing && !!setIsEditing && !!handleSubmitEdit;

  if (isInEditMode) {
    return (
      <EditActions
        isLoading={isLoading}
        setIsEditing={setIsEditing}
        handleSubmitEdit={handleSubmitEdit}
      />
    );
  }
  return (
    <MessageActions
      content={content}
      isLoading={isLoading}
      isAiMessage={isAiMessage}
      showEdit={!!showEdit}
      handleRegenerate={handleRegenerate}
      setIsEditing={setIsEditing}
    />
  );
};

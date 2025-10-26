import React, { useState } from "react";
import {
  XIcon,
  SendHorizontal,
  RefreshCcw,
  Pencil,
  UserCircle,
  Copy,
} from "lucide-react";
import { TooltipIconButton } from "../../../../tooltip-icon-button";
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
  onExpertHelpClick?: (() => void) | undefined;
}
const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  isLoading,
  isAiMessage,
  showEdit,
  handleRegenerate,
  setIsEditing,
  onExpertHelpClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 transition-colors duration-200 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50"
        style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
      >
        <Copy
          className="h-3.5 w-3.5 text-muted-foreground"
          strokeWidth={2}
        />
        <span className="text-[13px] text-foreground">
          {copied ? "Copied!" : "Copy"}
        </span>
      </button>

      {isAiMessage && !!handleRegenerate && (
        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 transition-colors duration-200 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
        >
          <RefreshCcw
            className="h-3.5 w-3.5 text-muted-foreground"
            strokeWidth={2}
          />
          <span className="text-[13px] text-foreground">Refresh</span>
        </button>
      )}

      {isAiMessage && !!onExpertHelpClick && (
        <button
          onClick={onExpertHelpClick}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 transition-colors duration-200 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
        >
          <UserCircle
            className="h-3.5 w-3.5 text-muted-foreground"
            strokeWidth={2}
          />
          <span className="text-[13px] text-foreground">Ask an Expert</span>
        </button>
      )}

      {showEdit && (
        <button
          onClick={() => setIsEditing?.(true)}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 transition-colors duration-200 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
        >
          <Pencil
            className="h-3.5 w-3.5 text-muted-foreground"
            strokeWidth={2}
          />
          <span className="text-[13px] text-foreground">Edit</span>
        </button>
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
  onExpertHelpClick,
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
      onExpertHelpClick={onExpertHelpClick}
    />
  );
};

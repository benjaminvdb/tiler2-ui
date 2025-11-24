import React, { useState, useCallback } from "react";
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
import { copyWithFormat } from "@/shared/utils/clipboard";

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
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  return (
    <div className="flex items-center gap-2">
      <TooltipIconButton
        disabled={isLoading}
        tooltip="Cancel edit"
        variant="ghost"
        onClick={handleCancelEdit}
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
  htmlContainerRef?: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  isAiMessage?: boolean | undefined;
  showEdit: boolean;
  handleRegenerate?: (() => void) | undefined;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  onExpertHelpClick?: (() => void) | undefined;
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  icon,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="border-border bg-card hover:bg-sand flex items-center gap-1.5 rounded-md border px-3 py-1.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
    style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
  >
    {icon}
    <span className="text-foreground text-[13px]">{label}</span>
  </button>
);

const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  htmlContainerRef,
  isLoading,
  isAiMessage,
  showEdit,
  handleRegenerate,
  setIsEditing,
  onExpertHelpClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyWithFormat({
      markdownText: content,
      ...(htmlContainerRef && { htmlContainerRef }),
    });

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content, htmlContainerRef]);

  const handleEditClick = useCallback(() => {
    setIsEditing?.(true);
  }, [setIsEditing]);

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={handleCopy}
        disabled={isLoading}
        icon={
          <Copy
            className="text-muted-foreground h-3.5 w-3.5"
            strokeWidth={2}
          />
        }
        label={copied ? "Copied!" : "Copy"}
      />

      {isAiMessage && !!handleRegenerate && (
        <ActionButton
          onClick={handleRegenerate}
          disabled={isLoading}
          icon={
            <RefreshCcw
              className="text-muted-foreground h-3.5 w-3.5"
              strokeWidth={2}
            />
          }
          label="Refresh"
        />
      )}

      {isAiMessage && !!onExpertHelpClick && (
        <ActionButton
          onClick={onExpertHelpClick}
          disabled={isLoading}
          icon={
            <UserCircle
              className="text-muted-foreground h-3.5 w-3.5"
              strokeWidth={2}
            />
          }
          label="Ask an Expert"
        />
      )}

      {showEdit && (
        <ActionButton
          onClick={handleEditClick}
          disabled={isLoading}
          icon={
            <Pencil
              className="text-muted-foreground h-3.5 w-3.5"
              strokeWidth={2}
            />
          }
          label="Edit"
        />
      )}
    </div>
  );
};

export const CommandBar: React.FC<CommandBarProps> = ({
  content,
  htmlContainerRef,
  isHumanMessage,
  isAiMessage,
  isEditing,
  setIsEditing,
  handleSubmitEdit,
  handleRegenerate,
  isLoading,
  onExpertHelpClick,
}) => {
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
      {...(htmlContainerRef && { htmlContainerRef })}
      isLoading={isLoading}
      isAiMessage={isAiMessage}
      showEdit={!!showEdit}
      handleRegenerate={handleRegenerate}
      setIsEditing={setIsEditing}
      onExpertHelpClick={onExpertHelpClick}
    />
  );
};

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

  const copyPlainText = useCallback(async () => {
    await navigator.clipboard.writeText(content);
  }, [content]);

  const copyHtml = useCallback(async () => {
    if (!htmlContainerRef?.current) {
      await copyPlainText();
      return;
    }

    const htmlContent = htmlContainerRef.current.innerHTML;
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([htmlContent], { type: "text/html" }),
      "text/plain": new Blob([content], { type: "text/plain" }),
    });
    await navigator.clipboard.write([clipboardItem]);
  }, [htmlContainerRef, content, copyPlainText]);

  const handleCopy = useCallback(async () => {
    try {
      await copyHtml();
    } catch {
      try {
        await copyPlainText();
      } catch (fallbackErr) {
        console.error("Failed to copy:", fallbackErr);
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [copyHtml, copyPlainText]);

  const handleEditClick = useCallback(() => {
    setIsEditing?.(true);
  }, [setIsEditing]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        disabled={isLoading}
        className="border-border bg-card hover:bg-sand flex items-center gap-1.5 rounded-md border px-3 py-1.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
      >
        <Copy
          className="text-muted-foreground h-3.5 w-3.5"
          strokeWidth={2}
        />
        <span className="text-foreground text-[13px]">
          {copied ? "Copied!" : "Copy"}
        </span>
      </button>

      {isAiMessage && !!handleRegenerate && (
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isLoading}
          className="border-border bg-card hover:bg-sand flex items-center gap-1.5 rounded-md border px-3 py-1.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
        >
          <RefreshCcw
            className="text-muted-foreground h-3.5 w-3.5"
            strokeWidth={2}
          />
          <span className="text-foreground text-[13px]">Refresh</span>
        </button>
      )}

      {isAiMessage && !!onExpertHelpClick && (
        <button
          type="button"
          onClick={onExpertHelpClick}
          disabled={isLoading}
          className="border-border bg-card hover:bg-sand flex items-center gap-1.5 rounded-md border px-3 py-1.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
        >
          <UserCircle
            className="text-muted-foreground h-3.5 w-3.5"
            strokeWidth={2}
          />
          <span className="text-foreground text-[13px]">Ask an Expert</span>
        </button>
      )}

      {showEdit && (
        <button
          type="button"
          onClick={handleEditClick}
          disabled={isLoading}
          className="border-border bg-card hover:bg-sand flex items-center gap-1.5 rounded-md border px-3 py-1.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
        >
          <Pencil
            className="text-muted-foreground h-3.5 w-3.5"
            strokeWidth={2}
          />
          <span className="text-foreground text-[13px]">Edit</span>
        </button>
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

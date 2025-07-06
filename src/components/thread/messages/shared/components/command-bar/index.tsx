import { CommandBarProps } from "../../types";
import { validateCommandBarProps, shouldShowEditButton } from "./validation";
import { EditActions, MessageActions } from "./components";

export function CommandBar({
  content,
  isHumanMessage,
  isAiMessage,
  isEditing,
  setIsEditing,
  handleSubmitEdit,
  handleRegenerate,
  isLoading,
}: CommandBarProps) {
  validateCommandBarProps({
    content,
    isHumanMessage,
    isAiMessage,
    isEditing,
    setIsEditing,
    handleSubmitEdit,
    handleRegenerate,
    isLoading,
  });

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
}

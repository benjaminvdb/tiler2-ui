import { CommandBarProps } from "../../types";

export function validateCommandBarProps({
  isHumanMessage,
  isAiMessage,
  isEditing,
  setIsEditing,
  handleSubmitEdit,
}: CommandBarProps) {
  if (isHumanMessage && isAiMessage) {
    throw new Error(
      "Can only set one of isHumanMessage or isAiMessage to true, not both.",
    );
  }

  if (!isHumanMessage && !isAiMessage) {
    throw new Error(
      "One of isHumanMessage or isAiMessage must be set to true.",
    );
  }

  if (
    isHumanMessage &&
    (isEditing === undefined ||
      setIsEditing === undefined ||
      handleSubmitEdit === undefined)
  ) {
    throw new Error(
      "If isHumanMessage is true, all of isEditing, setIsEditing, and handleSubmitEdit must be set.",
    );
  }
}

export function shouldShowEditButton(
  isHumanMessage: boolean | undefined,
  isEditing: boolean | undefined,
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>> | undefined,
  handleSubmitEdit: (() => void) | undefined,
) {
  return (
    isHumanMessage &&
    isEditing !== undefined &&
    !!setIsEditing &&
    !!handleSubmitEdit
  );
}

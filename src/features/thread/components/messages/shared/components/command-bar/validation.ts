export const shouldShowEditButton = (
  isHumanMessage: boolean | undefined,
  isEditing: boolean | undefined,
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>> | undefined,
  handleSubmitEdit: (() => void) | undefined,
): boolean => {
  return !!(
    isHumanMessage &&
    isEditing !== undefined &&
    setIsEditing &&
    handleSubmitEdit
  );
};

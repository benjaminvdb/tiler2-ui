import { cn } from "@/shared/utils/utils";
import { BranchSwitcher, CommandBar } from "../../shared/index";
import { MessageControlsProps } from "../types";

export const MessageControls: React.FC<MessageControlsProps> = ({
  isLoading,
  contentString,
  isEditing,
  setIsEditing,
  handleSubmitEdit,
  branch,
  branchOptions,
  onBranchSelect,
}) => {
  return (
    <div
      className={cn(
        "ml-auto flex items-center gap-2 transition-opacity",
        "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
        isEditing && "opacity-100",
      )}
    >
      <BranchSwitcher
        branch={branch}
        branchOptions={branchOptions}
        onSelect={onBranchSelect}
        isLoading={isLoading}
      />
      <CommandBar
        isLoading={isLoading}
        content={contentString}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSubmitEdit={handleSubmitEdit}
        isHumanMessage={true}
      />
    </div>
  );
};

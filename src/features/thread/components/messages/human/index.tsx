import { memo } from "react";
import { getContentString } from "../../utils";
import { cn } from "@/shared/utils/utils";
import { HumanMessageProps } from "./types";
import { useHumanMessageEdit } from "./hooks/use-human-message-edit";
import { EditableContent } from "./components/editable-content";
import { MultimodalContent } from "./components/multimodal-content";
import { TextContent } from "./components/text-content";
import { MessageControls } from "./components/message-controls";

export const HumanMessage = memo(function HumanMessage({
  message,
  isLoading,
}: HumanMessageProps) {
  const contentString = getContentString(message.content);

  const { isEditing, value, setValue, handleSubmitEdit, setIsEditing } =
    useHumanMessageEdit(message, contentString);

  return (
    <div
      className={cn(
        "group ml-auto flex items-center gap-2",
        isEditing && "w-full max-w-xl",
      )}
    >
      <div className={cn("flex flex-col gap-2", isEditing && "w-full")}>
        {isEditing ? (
          <EditableContent
            value={value}
            setValue={setValue}
            onSubmit={handleSubmitEdit}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <MultimodalContent content={message.content} />
            <TextContent contentString={contentString} />
          </div>
        )}
        <MessageControls
          isLoading={isLoading}
          contentString={contentString}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSubmitEdit={handleSubmitEdit}
        />
      </div>
    </div>
  );
});

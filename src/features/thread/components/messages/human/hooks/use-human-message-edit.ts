import { useState } from "react";
import { useCopilotChat } from "@/core/providers/copilotkit";
import type { Message } from "@copilotkit/shared";

export function useHumanMessageEdit(_message: Message, contentString: string) {
  const chat = useCopilotChat();

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmitEdit = () => {
    setIsEditing(false);

    // Submit the edited message using CopilotKit's interface
    chat.submit({ content: value });
  };

  const handleSetIsEditing = (
    editing: boolean | ((prev: boolean) => boolean),
  ) => {
    const newEditing =
      typeof editing === "function" ? editing(isEditing) : editing;
    if (newEditing) {
      setValue(contentString);
    }
    setIsEditing(newEditing);
  };

  return {
    isEditing,
    value,
    setValue,
    handleSubmitEdit,
    setIsEditing: handleSetIsEditing,
  };
}

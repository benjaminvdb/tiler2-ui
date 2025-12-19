import { useState } from "react";
import { useStreamContext } from "@/core/providers/stream";

export function useHumanMessageEdit(contentString: string) {
  const thread = useStreamContext();

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmitEdit = () => {
    setIsEditing(false);

    if (value.trim().length === 0) return;
    thread.sendMessage({ text: value });
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

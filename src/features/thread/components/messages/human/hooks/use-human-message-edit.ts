import { useState } from "react";
import { useStreamContext } from "@/core/providers/stream";
import type { UIMessage } from "@/core/providers/stream/stream-types";

export function useHumanMessageEdit(
  _message: UIMessage,
  contentString: string,
) {
  const thread = useStreamContext();

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmitEdit = () => {
    setIsEditing(false);

    const newMessage: UIMessage = {
      id: crypto.randomUUID(),
      type: "human",
      content: value,
    };
    thread.submit(
      { messages: [newMessage] },
      {
        streamMode: ["values"],
        streamSubgraphs: true,
      },
    );
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
